export type DimensionKey =
  | "data"
  | "infrastructure"
  | "people"
  | "process"
  | "strategy"
  | "governance";

export const DIMENSIONS: { key: DimensionKey; label: string }[] = [
  { key: "data", label: "Data" },
  { key: "infrastructure", label: "Infrastructure" },
  { key: "people", label: "People" },
  { key: "process", label: "Process" },
  { key: "strategy", label: "Strategy" },
  { key: "governance", label: "Governance" },
];

export interface AgentScore {
  agentId: string;
  agentName: string;
  dimension: DimensionKey;
  score: number;
}

export interface Gap {
  id: string;
  agentId: string;
  agentName: string;
  dimension: DimensionKey;
  score: number;
  threshold: number;
  severity: "critical" | "major" | "minor";
}

export interface RolloutItem {
  id: string;
  agentId: string;
  agentName: string;
  priority: number;
  phase: string;
  status: "pending" | "in-progress" | "complete";
}

export interface AssessmentSummary {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentData {
  assessmentId: string | null;
  assessmentName: string;
  setAssessmentName: (name: string) => void;
  scores: AgentScore[];
  setScore: (agentId: string, agentName: string, dimension: DimensionKey, score: number) => void;
  removeAgent: (agentId: string) => void;
  dimAvg: Record<DimensionKey, number>;
  overallAvg: number;
  completionPct: number;
  gaps: Gap[];
  rolloutOrder: RolloutItem[];
  assessments: AssessmentSummary[];
  saving: boolean;
  saveAssessment: () => Promise<void>;
  loadAssessment: (id: string) => Promise<void>;
  newAssessment: () => void;
  deleteAssessment: (id: string) => Promise<void>;
  shareAssessment: (id: string) => Promise<string>;
}
