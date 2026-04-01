import type { RolloutItem } from "@/types/assessment";

interface RolloutRemediationProps {
  rolloutOrder: RolloutItem[];
}

export function RolloutRemediation({ rolloutOrder }: RolloutRemediationProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Rollout & Remediation</h2>
        <p className="text-sm text-muted-foreground">
          Prioritized rollout plan based on readiness scores. Agents with the highest readiness are deployed first, while lower-scoring agents receive remediation.
        </p>
      </div>

      {rolloutOrder.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No rollout plan yet. Score your agents to generate a prioritized deployment order.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {rolloutOrder.map((item, index) => (
            <div key={item.id} className="flex items-center gap-4 rounded-lg border bg-card p-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {index + 1}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{item.agentName}</p>
                <p className="text-xs text-muted-foreground">{item.phase}</p>
              </div>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  item.status === "complete"
                    ? "bg-green-100 text-green-700"
                    : item.status === "in-progress"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {item.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
