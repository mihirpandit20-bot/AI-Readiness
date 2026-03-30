import { DIMENSIONS, type DimensionKey } from "@/types/assessment";

interface OverviewProps {
  overallAvg: number;
  dimAvg: Record<DimensionKey, number>;
  completionPct: number;
}

export function Overview({ overallAvg, dimAvg, completionPct }: OverviewProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
        <p className="text-sm text-muted-foreground">
          Your AI readiness at a glance. Score agents across dimensions to build your profile.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground">Overall Readiness</p>
          <p className="text-4xl font-bold mt-2">
            {overallAvg > 0 ? overallAvg.toFixed(1) : "—"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">out of 5.0</p>
        </div>

        <div className="rounded-lg border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground">Completion</p>
          <p className="text-4xl font-bold mt-2">{Math.round(completionPct)}%</p>
          <p className="text-xs text-muted-foreground mt-1">of all dimensions scored</p>
        </div>

        <div className="rounded-lg border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground">Dimensions</p>
          <p className="text-4xl font-bold mt-2">{DIMENSIONS.length}</p>
          <p className="text-xs text-muted-foreground mt-1">assessment areas</p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Dimension Averages</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {DIMENSIONS.map((dim) => (
            <div key={dim.key} className="rounded-lg border bg-card p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{dim.label}</span>
                <span className="text-lg font-bold">
                  {dimAvg[dim.key] > 0 ? dimAvg[dim.key].toFixed(1) : "—"}
                </span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${(dimAvg[dim.key] / 5) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
