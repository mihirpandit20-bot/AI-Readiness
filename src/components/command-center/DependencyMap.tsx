import { DIMENSIONS, type AgentScore, type DimensionKey } from "@/types/assessment";

interface DependencyMapProps {
  scores: AgentScore[];
}

const scoreColors: Record<number, string> = {
  1: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  2: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  3: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  4: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  5: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
};

function getScore(scores: AgentScore[], agentId: string, dim: DimensionKey): number | null {
  const s = scores.find((s) => s.agentId === agentId && s.dimension === dim);
  return s ? s.score : null;
}

function getDimAvg(scores: AgentScore[], dim: DimensionKey): number {
  const dimScores = scores.filter((s) => s.dimension === dim);
  if (dimScores.length === 0) return 0;
  return dimScores.reduce((sum, s) => sum + s.score, 0) / dimScores.length;
}

export function DependencyMap({ scores }: DependencyMapProps) {
  const agentMap = new Map<string, string>();
  for (const s of scores) {
    if (!agentMap.has(s.agentId)) {
      agentMap.set(s.agentId, s.agentName);
    }
  }
  const agents = [...agentMap.entries()].map(([id, name]) => ({ id, name }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dependency Map</h2>
        <p className="text-sm text-muted-foreground">
          Heatmap of agent readiness across dimensions. Darker colors indicate lower scores requiring attention.
        </p>
      </div>

      {agents.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Dependency visualization will appear here once agents are scored.
          </p>
        </div>
      ) : (
        <>
          {/* Heatmap grid */}
          <div className="overflow-x-auto">
            <div
              className="grid gap-px bg-border rounded-lg overflow-hidden"
              style={{
                gridTemplateColumns: `150px repeat(${DIMENSIONS.length}, 1fr)`,
              }}
            >
              {/* Header row */}
              <div className="bg-muted px-3 py-2 text-xs font-medium text-muted-foreground">
                Agent
              </div>
              {DIMENSIONS.map((dim) => (
                <div
                  key={dim.key}
                  className="bg-muted px-2 py-2 text-xs font-medium text-muted-foreground text-center"
                >
                  {dim.label}
                </div>
              ))}

              {/* Agent rows */}
              {agents.map((agent) => (
                <>
                  <div
                    key={`${agent.id}-label`}
                    className="bg-card px-3 py-2.5 text-sm font-medium truncate"
                    title={agent.name}
                  >
                    {agent.name}
                  </div>
                  {DIMENSIONS.map((dim) => {
                    const score = getScore(scores, agent.id, dim.key);
                    return (
                      <div
                        key={`${agent.id}-${dim.key}`}
                        className={`flex items-center justify-center py-2.5 text-sm font-semibold ${
                          score ? scoreColors[score] : "bg-card text-muted-foreground"
                        }`}
                      >
                        {score ?? "—"}
                      </div>
                    );
                  })}
                </>
              ))}

              {/* Average row */}
              <div className="bg-muted px-3 py-2 text-xs font-semibold">
                Average
              </div>
              {DIMENSIONS.map((dim) => {
                const avg = getDimAvg(scores, dim.key);
                const rounded = Math.round(avg);
                return (
                  <div
                    key={`avg-${dim.key}`}
                    className={`flex items-center justify-center py-2 text-xs font-semibold ${
                      rounded >= 1 && rounded <= 5
                        ? scoreColors[rounded]
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {avg > 0 ? avg.toFixed(1) : "—"}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="font-medium">Legend:</span>
            {[1, 2, 3, 4, 5].map((score) => (
              <div key={score} className="flex items-center gap-1">
                <div className={`h-4 w-4 rounded ${scoreColors[score]}`} />
                <span>{score}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
