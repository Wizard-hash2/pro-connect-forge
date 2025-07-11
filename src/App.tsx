import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import ClientDashboard from "./pages/ClientDashboard";
import FreelancerDashboard from "./pages/FreelancerDashboard";
import PostJob from "./pages/PostJob";
import FindFreelancers from "./pages/FindFreelancers";
import NotFound from "./pages/NotFound";
import SignUp from '@/pages/SignUp';
import Auth from '@/pages/Auth';
import { UserProfileProvider } from '@/context/UserProfileContext';
import Messages from './pages/Messages';
import Projects from './pages/Projects';
import Profile from './pages/Profile';
import Applications from './pages/Applications';
import Settings from './pages/Settings';
import BrowseJobs from './pages/BrowseJobs';
import SearchPage from './pages/SearchPage';
import Verified from './pages/Verified';

const queryClient = new QueryClient();

const App = () => (
  <UserProfileProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <nav className="p-4 bg-gray-100 flex gap-4">
            <Link to="/auth" className="text-blue-600 hover:underline">Auth</Link>
            {/* Remove or comment out the Sign Up link */}
            {/* <Link to="/signup" className="text-blue-600 hover:underline">Sign Up</Link> */}
            {/* Add more navigation links here */}
          </nav>
          <Routes>
            <Route path="/" element={<Auth />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={
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
                <BrowseJobs />
              </DashboardLayout>
            } />
            <Route path="/profile" element={
              <DashboardLayout>
                <Profile />
              </DashboardLayout>
            } />
            <Route path="/projects" element={
              <DashboardLayout>
                <Projects />
              </DashboardLayout>
            } />
            <Route path="/applications" element={
              <DashboardLayout>
                <Applications />
              </DashboardLayout>
            } />
            <Route path="/settings" element={
              <DashboardLayout>
                <Settings />
              </DashboardLayout>
            } />
            <Route path="/messages" element={
              <DashboardLayout>
                <Messages />
              </DashboardLayout>
            } />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/verified" element={<Verified />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </UserProfileProvider>
);

export default App;
