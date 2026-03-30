import type { Gap } from "@/types/assessment";

interface GapRegisterProps {
  gaps: Gap[];
}

export function GapRegister({ gaps }: GapRegisterProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Gap Register</h2>
        <p className="text-sm text-muted-foreground">
          Identifies areas where agent scores fall below the readiness threshold, highlighting critical gaps that need attention.
        </p>
      </div>

      {gaps.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No gaps detected. Score your agents to identify readiness gaps.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-3 text-left font-medium">Agent</th>
                <th className="p-3 text-left font-medium">Dimension</th>
                <th className="p-3 text-left font-medium">Score</th>
                <th className="p-3 text-left font-medium">Threshold</th>
                <th className="p-3 text-left font-medium">Severity</th>
              </tr>
            </thead>
            <tbody>
              {gaps.map((gap) => (
                <tr key={gap.id} className="border-b last:border-0">
                  <td className="p-3">{gap.agentName}</td>
                  <td className="p-3 capitalize">{gap.dimension}</td>
                  <td className="p-3">{gap.score}</td>
                  <td className="p-3">{gap.threshold}</td>
                  <td className="p-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        gap.severity === "critical"
                          ? "bg-destructive/10 text-destructive"
                          : gap.severity === "major"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {gap.severity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
