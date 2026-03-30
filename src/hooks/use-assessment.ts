import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type {
  AgentScore,
  AssessmentData,
  AssessmentSummary,
  DimensionKey,
  Gap,
  RolloutItem,
} from "@/types/assessment";
import { DIMENSIONS } from "@/types/assessment";

const GAP_THRESHOLD = 3;

export function useAssessment(): AssessmentData {
  const [scores, setScores] = useState<AgentScore[]>([]);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [assessmentName, setAssessmentName] = useState("Untitled Assessment");
  const [assessments, setAssessments] = useState<AssessmentSummary[]>([]);
  const [saving, setSaving] = useState(false);

  // Fetch the user's assessments list on mount
  useEffect(() => {
    let cancelled = false;

    async function fetchAssessments() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled) return;

      const { data, error } = await supabase
        .from("assessments")
        .select("id, name, created_at, updated_at")
        .order("updated_at", { ascending: false });

      if (!error && data && !cancelled) {
        setAssessments(
          data.map((row) => ({
            id: row.id,
            name: row.name,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
          }))
        );
      }
    }

    fetchAssessments();
    return () => { cancelled = true; };
  }, []);

  const setScore = useCallback(
    (agentId: string, agentName: string, dimension: DimensionKey, score: number) => {
      setScores((prev) => {
        const idx = prev.findIndex(
          (s) => s.agentId === agentId && s.dimension === dimension
        );
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], score, agentName };
          return next;
        }
        return [
          ...prev,
          { agentId, agentName, dimension, score },
        ];
      });
    },
    []
  );

  const removeAgent = useCallback((agentId: string) => {
    setScores((prev) => prev.filter((s) => s.agentId !== agentId));
  }, []);

  // --- Computed values (unchanged) ---

  const dimAvg = useMemo(() => {
    const result = {} as Record<DimensionKey, number>;
    for (const dim of DIMENSIONS) {
      const dimScores = scores.filter((s) => s.dimension === dim.key);
      result[dim.key] =
        dimScores.length > 0
          ? dimScores.reduce((sum, s) => sum + s.score, 0) / dimScores.length
          : 0;
    }
    return result;
  }, [scores]);

  const overallAvg = useMemo(() => {
    const vals = Object.values(dimAvg).filter((v) => v > 0);
    return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  }, [dimAvg]);

  const completionPct = useMemo(() => {
    if (scores.length === 0) return 0;
    const agentIds = new Set(scores.map((s) => s.agentId));
    const totalPossible = agentIds.size * DIMENSIONS.length;
    return totalPossible > 0 ? (scores.length / totalPossible) * 100 : 0;
  }, [scores]);

  const gaps = useMemo<Gap[]>(() => {
    return scores
      .filter((s) => s.score < GAP_THRESHOLD)
      .map((s) => ({
        id: `${s.agentId}-${s.dimension}`,
        agentId: s.agentId,
        agentName: s.agentName,
        dimension: s.dimension,
        score: s.score,
        threshold: GAP_THRESHOLD,
        severity: s.score === 1 ? "critical" : s.score === 2 ? "major" : "minor",
      }));
  }, [scores]);

  const rolloutOrder = useMemo<RolloutItem[]>(() => {
    const agentIds = [...new Set(scores.map((s) => s.agentId))];
    return agentIds
      .map((agentId) => {
        const agentScores = scores.filter((s) => s.agentId === agentId);
        const avg =
          agentScores.reduce((sum, s) => sum + s.score, 0) /
          (agentScores.length || 1);
        return {
          id: agentId,
          agentId,
          agentName: agentScores[0]?.agentName ?? agentId,
          priority: avg,
          phase: avg >= 4 ? "Phase 1" : avg >= 3 ? "Phase 2" : "Phase 3",
          status: "pending" as const,
        };
      })
      .sort((a, b) => b.priority - a.priority);
  }, [scores]);

  // --- Persistence operations ---

  const saveAssessment = useCallback(async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let currentId = assessmentId;

      if (currentId) {
        // Update existing assessment
        const { error } = await supabase
          .from("assessments")
          .update({ name: assessmentName })
          .eq("id", currentId);
        if (error) throw error;
      } else {
        // Create new assessment
        const { data, error } = await supabase
          .from("assessments")
          .insert({ user_id: user.id, name: assessmentName })
          .select("id")
          .single();
        if (error) throw error;
        currentId = data.id;
        setAssessmentId(currentId);
      }

      // Upsert all scores
      if (scores.length > 0) {
        const rows = scores.map((s) => ({
          assessment_id: currentId!,
          agent_id: s.agentId,
          agent_name: s.agentName,
          dimension: s.dimension,
          score: s.score,
        }));

        const { error } = await supabase
          .from("agent_scores")
          .upsert(rows, { onConflict: "assessment_id,agent_id,dimension" });
        if (error) throw error;
      }

      // Refresh the assessments list
      const { data: allAssessments } = await supabase
        .from("assessments")
        .select("id, name, created_at, updated_at")
        .order("updated_at", { ascending: false });

      if (allAssessments) {
        setAssessments(
          allAssessments.map((row) => ({
            id: row.id,
            name: row.name,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
          }))
        );
      }
    } catch (err) {
      console.error("Failed to save assessment:", err);
    } finally {
      setSaving(false);
    }
  }, [assessmentId, assessmentName, scores]);

  const loadAssessment = useCallback(async (id: string) => {
    try {
      const { data: assessment, error: assessmentError } = await supabase
        .from("assessments")
        .select("id, name")
        .eq("id", id)
        .single();
      if (assessmentError) throw assessmentError;

      const { data: scoreRows, error: scoresError } = await supabase
        .from("agent_scores")
        .select("agent_id, agent_name, dimension, score")
        .eq("assessment_id", id);
      if (scoresError) throw scoresError;

      setAssessmentId(assessment.id);
      setAssessmentName(assessment.name);
      setScores(
        (scoreRows ?? []).map((row) => ({
          agentId: row.agent_id,
          agentName: row.agent_name,
          dimension: row.dimension as DimensionKey,
          score: row.score,
        }))
      );
    } catch (err) {
      console.error("Failed to load assessment:", err);
    }
  }, []);

  const newAssessment = useCallback(() => {
    setAssessmentId(null);
    setAssessmentName("Untitled Assessment");
    setScores([]);
  }, []);

  const deleteAssessment = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from("assessments")
        .delete()
        .eq("id", id);
      if (error) throw error;

      setAssessments((prev) => prev.filter((a) => a.id !== id));

      // If we deleted the current assessment, clear state
      if (id === assessmentId) {
        newAssessment();
      }
    } catch (err) {
      console.error("Failed to delete assessment:", err);
    }
  }, [assessmentId, newAssessment]);

  const shareAssessment = useCallback(async (_id: string) => {
    // TODO: Implement public sharing (requires a shared_assessments table or public flag)
    return `${window.location.origin}/shared/${_id}`;
  }, []);

  return {
    scores,
    setScore,
    removeAgent,
    dimAvg,
    overallAvg,
    completionPct,
    gaps,
    rolloutOrder,
    assessmentId,
    assessmentName,
    setAssessmentName,
    assessments,
    saving,
    saveAssessment,
    loadAssessment,
    newAssessment,
    deleteAssessment,
    shareAssessment,
  };
}
