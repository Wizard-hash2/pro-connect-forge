import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import ClientDashboard from "./pages/ClientDashboard";
import FreelancerDashboard from "./pages/FreelancerDashboard";
import PostJob from "./pages/PostJob";
import FindFreelancers from "./pages/FindFreelancers";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            <DashboardLayout>
              <ClientDashboard />
            </DashboardLayout>
          } />
          <Route path="/freelancer" element={
            <DashboardLayout>
              <FreelancerDashboard />
            </DashboardLayout>
          } />
          <Route path="/post-job" element={
            <DashboardLayout>
              <PostJob />
            </DashboardLayout>
          } />
          <Route path="/find-freelancers" element={
            <DashboardLayout>
              <FindFreelancers />
            </DashboardLayout>
          } />
          <Route path="/browse-jobs" element={
            <DashboardLayout>
              <FreelancerDashboard />
            </DashboardLayout>
          } />
          <Route path="/profile" element={
            <DashboardLayout>
              <FreelancerDashboard />
            </DashboardLayout>
          } />
          <Route path="/projects" element={
            <DashboardLayout>
              <ClientDashboard />
            </DashboardLayout>
          } />
          <Route path="/applications" element={
            <DashboardLayout>
              <FreelancerDashboard />
            </DashboardLayout>
          } />
          <Route path="/messages" element={
            <DashboardLayout>
              <ClientDashboard />
            </DashboardLayout>
          } />
          <Route path="/settings" element={
            <DashboardLayout>
              <ClientDashboard />
            </DashboardLayout>
          } />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
