import type { AgentScore, DimensionKey } from "@/types/assessment";

interface AgentDeepDiveProps {
  scores: AgentScore[];
  setScore: (agentId: string, dimension: DimensionKey, score: number) => void;
  overallAvg: number;
  dimAvg: Record<DimensionKey, number>;
  completionPct: number;
}

export function AgentDeepDive({ scores }: AgentDeepDiveProps) {
  const agentIds = [...new Set(scores.map((s) => s.agentId))];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Agent Deep Dive</h2>
        <p className="text-sm text-muted-foreground">
          Score individual AI agents across readiness dimensions. Each agent represents an AI use case being evaluated for deployment.
        </p>
      </div>

      {agentIds.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No agents scored yet. Add your first AI agent to begin the assessment.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border">
          <div className="p-4">
            <p className="text-sm text-muted-foreground">
              {agentIds.length} agent{agentIds.length !== 1 ? "s" : ""} scored with {scores.length} total scores.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
