import { DIMENSIONS, type AgentScore, type DimensionKey, type Gap } from "@/types/assessment";
import { Calendar, Users, Clock, AlertTriangle } from "lucide-react";

interface WorkshopPlannerProps {
  gaps: Gap[];
  scores: AgentScore[];
}

interface Workshop {
  dimension: DimensionKey;
  title: string;
  description: string;
  affectedAgents: string[];
  priority: "high" | "medium" | "low";
  estimatedDuration: string;
  focusAreas: string[];
}

const WORKSHOP_TEMPLATES: Record<DimensionKey, { title: string; description: string; focusAreas: string[] }> = {
  data: {
    title: "Data Readiness Workshop",
    description: "Build capabilities in data collection, quality, governance, and pipeline readiness for AI workloads.",
    focusAreas: ["Data quality assessment", "Pipeline architecture", "Data governance frameworks", "Labeling strategies"],
  },
  infrastructure: {
    title: "Infrastructure & Platform Workshop",
    description: "Ensure compute, storage, networking, and MLOps infrastructure are ready for AI deployment.",
    focusAreas: ["Cloud/on-prem compute sizing", "GPU provisioning", "MLOps pipeline setup", "Monitoring & observability"],
  },
  people: {
    title: "People & Skills Workshop",
    description: "Upskill teams on AI literacy, technical skills, and change management for AI adoption.",
    focusAreas: ["AI literacy for non-technical staff", "ML engineering skills", "Responsible AI training", "Change management"],
  },
  process: {
    title: "Process Optimization Workshop",
    description: "Redesign business processes to integrate AI decision-making and automation effectively.",
    focusAreas: ["Process mapping for AI", "Automation opportunity analysis", "Human-in-the-loop design", "KPI definition"],
  },
  strategy: {
    title: "AI Strategy Alignment Workshop",
    description: "Align AI initiatives with business objectives, define ROI metrics, and create a roadmap.",
    focusAreas: ["Business case development", "ROI framework", "Prioritization matrix", "Stakeholder alignment"],
  },
  governance: {
    title: "AI Governance Workshop",
    description: "Establish policies, ethics frameworks, and compliance standards for responsible AI use.",
    focusAreas: ["Ethics guidelines", "Bias detection & mitigation", "Regulatory compliance", "Model risk management"],
  },
};

function generateWorkshops(gaps: Gap[]): Workshop[] {
  const gapsByDimension = new Map<DimensionKey, Gap[]>();
  for (const gap of gaps) {
    const existing = gapsByDimension.get(gap.dimension) ?? [];
    existing.push(gap);
    gapsByDimension.set(gap.dimension, existing);
  }

  const workshops: Workshop[] = [];
  for (const [dimension, dimGaps] of gapsByDimension) {
    const template = WORKSHOP_TEMPLATES[dimension];
    const criticalCount = dimGaps.filter((g) => g.severity === "critical").length;
    const majorCount = dimGaps.filter((g) => g.severity === "major").length;

    const priority: "high" | "medium" | "low" =
      criticalCount > 0 ? "high" : majorCount > 0 ? "medium" : "low";

    const estimatedDuration =
      priority === "high" ? "Full day (8h)" : priority === "medium" ? "Half day (4h)" : "2 hours";

    workshops.push({
      dimension,
      title: template.title,
      description: template.description,
      affectedAgents: [...new Set(dimGaps.map((g) => g.agentName))],
      priority,
      estimatedDuration,
      focusAreas: template.focusAreas,
    });
  }

  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return workshops.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}

const priorityStyles = {
  high: "bg-destructive/10 text-destructive",
  medium: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  low: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
};

export function WorkshopPlanner({ gaps }: WorkshopPlannerProps) {
  const workshops = generateWorkshops(gaps);
  const dimLabel = (key: DimensionKey) =>
    DIMENSIONS.find((d) => d.key === key)?.label ?? key;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Workshop Planner</h2>
        <p className="text-sm text-muted-foreground">
          Targeted workshops based on your gap analysis to address readiness gaps and upskill teams.
        </p>
      </div>

      {workshops.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-sm font-medium">All dimensions above threshold</p>
          <p className="text-xs text-muted-foreground mt-1">
            No workshops needed right now. Score more agents to keep your assessment current.
          </p>
        </div>
      ) : (
        <>
          <div className="text-sm text-muted-foreground">
            {workshops.length} workshop{workshops.length !== 1 ? "s" : ""} recommended based on {gaps.length} gap{gaps.length !== 1 ? "s" : ""}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {workshops.map((ws) => (
              <div key={ws.dimension} className="rounded-lg border bg-card">
                <div className="border-b px-4 py-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">{ws.title}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${priorityStyles[ws.priority]}`}>
                      {ws.priority}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{dimLabel(ws.dimension)} dimension</p>
                </div>

                <div className="px-4 py-3 space-y-3">
                  <p className="text-xs text-muted-foreground">{ws.description}</p>

                  <div className="flex items-center gap-2 text-xs">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{ws.estimatedDuration}</span>
                  </div>

                  <div className="flex items-start gap-2 text-xs">
                    <AlertTriangle className="h-3.5 w-3.5 text-muted-foreground mt-0.5" />
                    <span>
                      {ws.affectedAgents.length} agent{ws.affectedAgents.length !== 1 ? "s" : ""} affected:{" "}
                      {ws.affectedAgents.join(", ")}
                    </span>
                  </div>

                  <div className="flex items-start gap-2 text-xs">
                    <Users className="h-3.5 w-3.5 text-muted-foreground mt-0.5" />
                    <div>
                      <span className="font-medium">Focus areas:</span>
                      <ul className="mt-1 space-y-0.5 text-muted-foreground">
                        {ws.focusAreas.map((area) => (
                          <li key={area}>• {area}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
