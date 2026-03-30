import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/command-center/AppSidebar";
import { Overview } from "@/components/command-center/Overview";
import { AgentDeepDive } from "@/components/command-center/AgentDeepDive";
import { GapRegister } from "@/components/command-center/GapRegister";
import { RolloutRemediation } from "@/components/command-center/RolloutRemediation";
import { WorkshopPlanner } from "@/components/command-center/WorkshopPlanner";
import { DependencyMap } from "@/components/command-center/DependencyMap";
import { StrategyConsultant } from "@/pages/StrategyConsultant";
import { AuthPage } from "@/components/command-center/AuthPage";
import { AssessmentToolbar } from "@/components/command-center/AssessmentToolbar";
import { useAssessment } from "@/hooks/use-assessment";
import { Routes, Route } from "react-router-dom";
import type { Session } from "@supabase/supabase-js";

export default function CommandCenterLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return <AuthPage />;
  }

  return <AuthenticatedApp />;
}

function AuthenticatedApp() {
  const assessment = useAssessment();
  const {
    scores, setScore, removeAgent, dimAvg, overallAvg, completionPct, gaps, rolloutOrder,
    assessmentId, assessmentName, setAssessmentName,
    assessments, saving,
    saveAssessment, loadAssessment, newAssessment, deleteAssessment, shareAssessment,
  } = assessment;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-auto min-h-[48px] flex flex-wrap items-center border-b bg-card px-4 py-2 gap-3">
            <SidebarTrigger />
            <span className="text-sm font-semibold text-foreground mr-auto">AI Readiness Command Center</span>
            <AssessmentToolbar
              assessmentId={assessmentId}
              assessmentName={assessmentName}
              setAssessmentName={setAssessmentName}
              assessments={assessments}
              saving={saving}
              saveAssessment={saveAssessment}
              loadAssessment={loadAssessment}
              newAssessment={newAssessment}
              deleteAssessment={deleteAssessment}
              shareAssessment={shareAssessment}
              scores={scores}
              gaps={gaps}
              overallAvg={overallAvg}
              dimAvg={dimAvg}
            />
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6">
            <Routes>
              <Route index element={<Overview overallAvg={overallAvg} dimAvg={dimAvg} completionPct={completionPct} />} />
              <Route path="agents" element={<AgentDeepDive scores={scores} setScore={setScore} removeAgent={removeAgent} overallAvg={overallAvg} dimAvg={dimAvg} completionPct={completionPct} />} />
              <Route path="gaps" element={<GapRegister gaps={gaps} />} />
              <Route path="rollout" element={<RolloutRemediation scores={scores} overallAvg={overallAvg} rolloutOrder={rolloutOrder} />} />
              <Route path="workshops" element={<WorkshopPlanner />} />
              <Route path="dependencies" element={<DependencyMap />} />
              <Route path="strategy-ai" element={<StrategyConsultant scores={scores} gaps={gaps} overallAvg={overallAvg} dimAvg={dimAvg} rolloutOrder={rolloutOrder} />} />
            </Routes>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
