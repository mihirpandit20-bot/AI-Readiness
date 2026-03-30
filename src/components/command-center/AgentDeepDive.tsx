import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DIMENSIONS, type AgentScore, type DimensionKey } from "@/types/assessment";
import { Plus, X } from "lucide-react";

interface AgentDeepDiveProps {
  scores: AgentScore[];
  setScore: (agentId: string, agentName: string, dimension: DimensionKey, score: number) => void;
  removeAgent: (agentId: string) => void;
  overallAvg: number;
  dimAvg: Record<DimensionKey, number>;
  completionPct: number;
}

function getAgentAvg(scores: AgentScore[], agentId: string): number {
  const agentScores = scores.filter((s) => s.agentId === agentId);
  if (agentScores.length === 0) return 0;
  return agentScores.reduce((sum, s) => sum + s.score, 0) / agentScores.length;
}

export function AgentDeepDive({
  scores,
  setScore,
  removeAgent,
  completionPct,
}: AgentDeepDiveProps) {
  const [newAgentName, setNewAgentName] = useState("");

  // Derive unique agents with their display names
  const agentMap = new Map<string, string>();
  for (const s of scores) {
    if (!agentMap.has(s.agentId)) {
      agentMap.set(s.agentId, s.agentName);
    }
  }
  const agents = [...agentMap.entries()].map(([id, name]) => ({ id, name }));

  const handleAddAgent = () => {
    const name = newAgentName.trim();
    if (!name) return;
    const agentId = crypto.randomUUID();
    // Set first dimension to score 3 as a starting point
    setScore(agentId, name, DIMENSIONS[0].key, 3);
    setNewAgentName("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleAddAgent();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Agent Deep Dive</h2>
        <p className="text-sm text-muted-foreground">
          Score individual AI agents across readiness dimensions. Each agent represents an AI use case being evaluated for deployment.
        </p>
      </div>

      {/* Stats bar */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="rounded-md border bg-card px-3 py-1.5">
          <span className="text-muted-foreground">Agents: </span>
          <span className="font-medium">{agents.length}</span>
        </div>
        <div className="rounded-md border bg-card px-3 py-1.5">
          <span className="text-muted-foreground">Scores: </span>
          <span className="font-medium">{scores.length}</span>
        </div>
        <div className="rounded-md border bg-card px-3 py-1.5">
          <span className="text-muted-foreground">Completion: </span>
          <span className="font-medium">{Math.round(completionPct)}%</span>
        </div>
      </div>

      {/* Add agent */}
      <div className="flex gap-2">
        <Input
          placeholder="Enter agent / use case name..."
          value={newAgentName}
          onChange={(e) => setNewAgentName(e.target.value)}
          onKeyDown={handleKeyDown}
          className="max-w-sm"
        />
        <Button onClick={handleAddAgent} disabled={!newAgentName.trim()}>
          <Plus className="mr-1 h-4 w-4" />
          Add Agent
        </Button>
      </div>

      {/* Agent cards */}
      {agents.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No agents scored yet. Add your first AI agent above to begin the assessment.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {agents.map((agent) => {
            const avg = getAgentAvg(scores, agent.id);
            return (
              <div key={agent.id} className="rounded-lg border bg-card">
                {/* Agent header */}
                <div className="flex items-center justify-between border-b px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold">{agent.name}</span>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      {avg > 0 ? avg.toFixed(1) : "—"}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => removeAgent(agent.id)}
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remove agent</span>
                  </Button>
                </div>

                {/* Dimension scores */}
                <div className="divide-y">
                  {DIMENSIONS.map((dim) => {
                    const current = scores.find(
                      (s) => s.agentId === agent.id && s.dimension === dim.key
                    );
                    return (
                      <div key={dim.key} className="flex items-center justify-between px-4 py-2">
                        <span className="text-sm text-muted-foreground w-28 shrink-0">
                          {dim.label}
                        </span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((value) => (
                            <button
                              key={value}
                              onClick={() => setScore(agent.id, agent.name, dim.key, value)}
                              className={`h-8 w-8 rounded-md text-xs font-medium transition-colors ${
                                current?.score === value
                                  ? "bg-primary text-primary-foreground"
                                  : "border bg-background hover:bg-accent hover:text-accent-foreground"
                              }`}
                            >
                              {value}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
