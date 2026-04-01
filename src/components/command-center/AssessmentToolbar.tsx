import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addToast } from "@/hooks/use-toast";
import { Trash2 } from "lucide-react";
import type { AgentScore, DimensionKey, Gap } from "@/types/assessment";

interface AssessmentToolbarProps {
  assessmentId: string | null;
  assessmentName: string;
  setAssessmentName: (name: string) => void;
  assessments: { id: string; name: string }[];
  saving: boolean;
  saveAssessment: () => Promise<{ success: boolean; error?: string }>;
  loadAssessment: (id: string) => Promise<{ success: boolean; error?: string }>;
  newAssessment: () => void;
  deleteAssessment: (id: string) => Promise<{ success: boolean; error?: string }>;
  shareAssessment: (id: string) => Promise<string>;
  scores: AgentScore[];
  gaps: Gap[];
  overallAvg: number;
  dimAvg: Record<DimensionKey, number>;
}

export function AssessmentToolbar({
  assessmentId,
  assessmentName,
  setAssessmentName,
  assessments,
  saving,
  saveAssessment,
  loadAssessment,
  newAssessment,
  deleteAssessment,
  scores,
  overallAvg,
}: AssessmentToolbarProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const handleSave = async () => {
    const result = await saveAssessment();
    if (result.success) {
      addToast("Assessment saved", "success");
    } else {
      addToast(result.error ?? "Failed to save", "destructive");
    }
  };

  const handleLoad = async (id: string) => {
    const result = await loadAssessment(id);
    if (result.success) {
      addToast("Assessment loaded", "success");
    } else {
      addToast(result.error ?? "Failed to load", "destructive");
    }
  };

  const handleDelete = async () => {
    if (!assessmentId) return;
    const result = await deleteAssessment(assessmentId);
    if (result.success) {
      addToast("Assessment deleted", "success");
    } else {
      addToast(result.error ?? "Failed to delete", "destructive");
    }
    setConfirmingDelete(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Assessment name */}
      <Input
        className="h-8 w-40 text-xs"
        value={assessmentName}
        onChange={(e) => setAssessmentName(e.target.value)}
        placeholder="Assessment name"
      />

      {/* Load existing */}
      {assessments.length > 0 && (
        <select
          className="h-8 rounded-md border border-input bg-background px-2 text-xs"
          value={assessmentId ?? ""}
          onChange={(e) => {
            if (e.target.value) handleLoad(e.target.value);
          }}
        >
          <option value="" disabled>
            Load...
          </option>
          {assessments.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      )}

      {/* Save */}
      <Button size="sm" variant="outline" onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : "Save"}
      </Button>

      {/* New */}
      <Button size="sm" variant="ghost" onClick={newAssessment}>
        New
      </Button>

      {/* Delete */}
      {assessmentId && (
        <>
          {confirmingDelete ? (
            <div className="flex items-center gap-1">
              <Button size="sm" variant="destructive" onClick={handleDelete}>
                Confirm
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setConfirmingDelete(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              className="text-muted-foreground hover:text-destructive"
              onClick={() => setConfirmingDelete(true)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </>
      )}

      {/* Stats */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>{scores.length} scores</span>
        <span className="h-3 w-px bg-border" />
        <span>Avg: {overallAvg > 0 ? overallAvg.toFixed(1) : "—"}</span>
      </div>
    </div>
  );
}
