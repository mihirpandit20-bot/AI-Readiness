import type { AgentScore, DimensionKey, Gap, RolloutItem } from "@/types/assessment";

interface StrategyConsultantProps {
  scores: AgentScore[];
  gaps: Gap[];
  overallAvg: number;
  dimAvg: Record<DimensionKey, number>;
  rolloutOrder: RolloutItem[];
}

export function StrategyConsultant({ overallAvg }: StrategyConsultantProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Strategy Consultant</h2>
        <p className="text-sm text-muted-foreground">
          Get AI-powered recommendations for your readiness journey based on your assessment data.
        </p>
      </div>

      <div className="rounded-lg border bg-card p-4">
        <p className="text-sm text-muted-foreground mb-2">Current readiness score</p>
        <p className="text-2xl font-bold">{overallAvg > 0 ? overallAvg.toFixed(1) : "—"} / 5.0</p>
      </div>

      <div className="rounded-lg border p-4 space-y-4">
        <div className="space-y-2">
          <label htmlFor="strategy-input" className="text-sm font-medium">
            Ask a question about your AI readiness strategy
          </label>
          <div className="flex gap-2">
            <input
              id="strategy-input"
              type="text"
              placeholder="e.g., What should we prioritize first?"
              className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
              disabled
            />
            <button
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground opacity-50"
              disabled
            >
              Ask
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            AI strategy consultation will be available once connected to a language model.
          </p>
        </div>
      </div>
    </div>
  );
}
