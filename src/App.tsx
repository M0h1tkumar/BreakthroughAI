import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "./components/ToastContainer";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import PatientDashboard from "./pages/PatientDashboard";
import NewQuery from "./pages/NewQuery";
import QueryResults from "./pages/QueryResults";
import ReportsPage from "./pages/ReportsPage";
import Settings from "./pages/Settings";
import DoctorSettings from "./pages/DoctorSettings";
import PatientSettings from "./pages/PatientSettings";
import PatientsPage from "./pages/PatientsPage";
import SearchPage from "./pages/SearchPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import NotFound from "./pages/NotFound";
import PharmacyDashboard from "./pages/PharmacyDashboard";
import PharmacySettings from "./pages/PharmacySettings";
import AICouncilPage from "./pages/AICouncilPage";
import { authService } from "./lib/auth";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = authService.getCurrentUser();
  const isAuthenticated = authService.isAuthenticated();
  
  if (!user || !isAuthenticated) {
    window.location.href = '/login';
    return null;
  }
  return <>{children}</>;
};

const RoleBasedDashboard = () => {
  const user = authService.getCurrentUser();
  
  if (!user) {
    window.location.href = '/login';
    return null;
  }
  
  switch (user.role) {
    case 'DOCTOR':
      return <DoctorDashboard />;
    case 'PATIENT':
      return <PatientDashboard />;
    case 'PHARMACY':
      return <PharmacyDashboard />;
    default:
      return <Dashboard />;
  }
};

const RoleBasedSettings = () => {
  const user = authService.getCurrentUser();
  
  if (!user) {
    window.location.href = '/login';
    return null;
  }
  
  switch (user.role) {
    case 'DOCTOR':
      return <DoctorSettings />;
    case 'PATIENT':
      return <PatientSettings />;
    case 'PHARMACY':
      return <PharmacySettings />;
    default:
      return <Settings />;
  }
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ToastContainer />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <RoleBasedDashboard />
            </ProtectedRoute>
          } />
          <Route path="/doctor" element={
            <ProtectedRoute>
              <DoctorDashboard />
            </ProtectedRoute>
          } />
          <Route path="/patient" element={
            <ProtectedRoute>
              <PatientDashboard />
            </ProtectedRoute>
          } />
          <Route path="/pharmacy" element={
            <ProtectedRoute>
              <PharmacyDashboard />
            </ProtectedRoute>
          } />
          <Route path="/queries" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/queries/new" element={
            <ProtectedRoute>
              <NewQuery />
            </ProtectedRoute>
          } />
          <Route path="/queries/results" element={
            <ProtectedRoute>
              <QueryResults />
            </ProtectedRoute>
          } />
          <Route path="/reports" element={
            <ProtectedRoute>
              <ReportsPage />
            </ProtectedRoute>
          } />
          <Route path="/patients" element={
            <ProtectedRoute>
              <PatientsPage />
            </ProtectedRoute>
          } />
          <Route path="/search" element={
            <ProtectedRoute>
              <SearchPage />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <RoleBasedSettings />
            </ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute>
              <AnalyticsPage />
            </ProtectedRoute>
          } />
          <Route path="/ai-council" element={
            <ProtectedRoute>
              <AICouncilPage />
            </ProtectedRoute>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
