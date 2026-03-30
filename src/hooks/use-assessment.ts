import { useState, useMemo, useCallback } from "react";
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

  const setScore = useCallback(
    (agentId: string, dimension: DimensionKey, score: number) => {
      setScores((prev) => {
        const idx = prev.findIndex(
          (s) => s.agentId === agentId && s.dimension === dimension
        );
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], score };
          return next;
        }
        return [
          ...prev,
          { agentId, agentName: agentId, dimension, score },
        ];
      });
    },
    []
  );

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

  const saveAssessment = useCallback(async () => {
    setSaving(true);
    // TODO: Implement Supabase persistence
    await new Promise((r) => setTimeout(r, 500));
    if (!assessmentId) {
      const id = crypto.randomUUID();
      setAssessmentId(id);
      setAssessments((prev) => [
        ...prev,
        {
          id,
          name: assessmentName,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);
    }
    setSaving(false);
  }, [assessmentId, assessmentName]);

  const loadAssessment = useCallback(async (_id: string) => {
    // TODO: Implement Supabase loading
    setAssessmentId(_id);
  }, []);

  const newAssessment = useCallback(() => {
    setAssessmentId(null);
    setAssessmentName("Untitled Assessment");
    setScores([]);
  }, []);

  const deleteAssessment = useCallback(async (id: string) => {
    // TODO: Implement Supabase deletion
    setAssessments((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const shareAssessment = useCallback(async (_id: string) => {
    // TODO: Implement sharing
    return `${window.location.origin}/shared/${_id}`;
  }, []);

  return {
    scores,
    setScore,
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
