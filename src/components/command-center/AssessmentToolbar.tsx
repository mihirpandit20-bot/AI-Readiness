import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AgentScore, DimensionKey, Gap } from "@/types/assessment";

interface AssessmentToolbarProps {
  assessmentId: string | null;
  assessmentName: string;
  setAssessmentName: (name: string) => void;
  assessments: { id: string; name: string }[];
  saving: boolean;
  saveAssessment: () => Promise<void>;
  loadAssessment: (id: string) => Promise<void>;
  newAssessment: () => void;
  deleteAssessment: (id: string) => Promise<void>;
  shareAssessment: (id: string) => Promise<string>;
  scores: AgentScore[];
  gaps: Gap[];
  overallAvg: number;
  dimAvg: Record<DimensionKey, number>;
}

export function AssessmentToolbar({
  assessmentName,
  setAssessmentName,
  saving,
  saveAssessment,
  newAssessment,
  scores,
  overallAvg,
}: AssessmentToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        className="h-8 w-48 text-xs"
        value={assessmentName}
        onChange={(e) => setAssessmentName(e.target.value)}
        placeholder="Assessment name"
      />
      <Button size="sm" variant="outline" onClick={saveAssessment} disabled={saving}>
        {saving ? "Saving..." : "Save"}
      </Button>
      <Button size="sm" variant="ghost" onClick={newAssessment}>
        New
      </Button>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>{scores.length} scores</span>
        <span className="h-3 w-px bg-border" />
        <span>Avg: {overallAvg > 0 ? overallAvg.toFixed(1) : "—"}</span>
      </div>
    </div>
  );
}
