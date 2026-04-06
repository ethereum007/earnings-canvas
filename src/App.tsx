import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "./pages/Dashboard";
import CompanyDetail from "./pages/CompanyDetail";
import SentimentOverview from "./pages/SentimentOverview";
import PolicyAlpha from "./pages/PolicyAlpha";
import Conferences from "./pages/Conferences";
import Investors from "./pages/Investors";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/company/:symbol" element={<CompanyDetail />} />
          <Route path="/sentiment" element={<SentimentOverview />} />
          <Route path="/policy" element={<PolicyAlpha />} />
          <Route path="/conferences" element={<Conferences />} />
          <Route path="/investors" element={<Investors />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
