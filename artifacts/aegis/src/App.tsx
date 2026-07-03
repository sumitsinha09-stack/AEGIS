import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Layout } from "@/components/layout";
import { RefreshProvider } from "@/hooks/use-refresh";

import Overview from "@/pages/overview";
import Risk from "@/pages/risk";
import Scenarios from "@/pages/scenarios";
import Procurement from "@/pages/procurement";
import Reserve from "@/pages/reserve";
import DigitalTwin from "@/pages/digital-twin";
import Settings from "@/pages/settings";
import Analytics from "@/pages/analytics";
import AICommand from "@/pages/ai-command";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 2,
    },
  },
});

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Overview} />
        <Route path="/risk" component={Risk} />
        <Route path="/scenarios" component={Scenarios} />
        <Route path="/procurement" component={Procurement} />
        <Route path="/reserve" component={Reserve} />
        <Route path="/digital-twin" component={DigitalTwin} />
        <Route path="/settings" component={Settings} />
        <Route path="/analytics" component={Analytics} />
        <Route path="/ai-command" component={AICommand} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RefreshProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </RefreshProvider>
    </QueryClientProvider>
  );
}

export default App;
