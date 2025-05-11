import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/uiaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Chat from "@/pages/Chat";
import CreateCharacter from "@/pages/CreateCharacter";
import { ErrorBoundary } from "@/components/ErrorBoundary";

function Router() {
  return (
    <ErrorBoundary <Switch>
        <Route path="/" component={Home} />
        <Route path="/chatcharacterId/:sessionId" component={Chat} />
        <Route path="/create" component={CreateCharacter} />
        <Route component={NotFound} />
      </Switch>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <ErrorBoundary>
          <Router />
        </ErrorBoundary>
     Provider>
    </QueryClientProvider>
  );
}

export default App;