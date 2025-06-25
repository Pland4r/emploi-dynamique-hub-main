import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import JobDetails from "./pages/JobDetails";
import CandidateDashboard from "@/components/CandidateDashboard";
import RecruiterDashboard from "@/components/RecruiterDashboard";
import NotFound from "./pages/NotFound";
import JobList from './pages/JobList';
import SavedJobs from "./pages/SavedJobs";
import ApplicationsHistory from "./pages/ApplicationsHistory";
import MyCV from "./pages/MyCV";
import CandidateNavBar from "./components/CandidateNavBar";
import EditCV from "./pages/EditCV";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/jobs/:id" element={<JobDetails />} />
            <Route path="/jobs" element={<JobList />} />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute userType="candidate">
                  <CandidateNavBar />
                  <CandidateDashboard onBack={() => window.history.back()} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/saved-jobs" 
              element={
                <ProtectedRoute userType="candidate">
                  <CandidateNavBar />
                  <SavedJobs />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/applications-history" 
              element={
                <ProtectedRoute userType="candidate">
                  <CandidateNavBar />
                  <ApplicationsHistory />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/my-cv" 
              element={
                <ProtectedRoute userType="candidate">
                  <CandidateNavBar />
                  <MyCV />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/edit-cv" 
              element={
                <ProtectedRoute userType="candidate">
                  <EditCV />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/recruiter-dashboard" 
              element={
                <ProtectedRoute userType="recruiter">
                  <RecruiterDashboard onBack={() => window.history.back()} />
                </ProtectedRoute>
              } 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
