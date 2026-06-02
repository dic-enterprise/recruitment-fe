import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query';
import i18n from '@/shared/i18n';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { Toaster as Sonner, toast } from '@/shared/components/ui/sonner';
import { Toaster } from '@/shared/components/ui/toaster';
import { TooltipProvider } from '@/shared/components/ui/tooltip';
import { AuthProvider } from '@/shared/context/auth-context';
import { ProtectedRoute, AdminRoute } from '@/shared/components/ProtectedRoute';
import AppLayout from '@/shared/components/AppLayout';
import Index from './pages/Index';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/hr/DashboardPage';
import DepartmentsPage from './pages/hr/department/DepartmentsPage.tsx';
import JobsPage from './pages/hr/JobsPage';
import MatchResultsPage from './pages/hr/MatchResultsPage';
import InterviewProcessesPage from './pages/hr/InterviewProcessesPage';
import InterviewProcessDetailPage from './pages/hr/InterviewProcessDetailPage';
import CandidatesPage from './pages/hr/CandidatesPage';
import CandidateDetailPage from './pages/hr/CandidateDetailPage';
import SchedulePage from './pages/hr/SchedulePage';
import PublicUploadPage from './pages/public/PublicUploadPage';
import PublicCVStatusPage from './pages/public/PublicCVStatusPage';
import PublicJobsPage from './pages/public/PublicJobsPage';
import PublicApplySuccessPage from './pages/public/PublicApplySuccessPage';
import PublicJobDetailPage from './pages/public/PublicJobDetailPage';
import ExtractErrorsPage from './pages/admin/ExtractErrorsPage';
import AIConfigPage from './pages/admin/AIConfigPage';
import UsersPage from './pages/admin/UsersPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 1000 * 30,
    },
  },
  queryCache: new QueryCache({
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || i18n.t('common.serverError'));
    },
  }),
  mutationCache: new MutationCache({
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || i18n.t('common.operationFailed'));
    },
  }),
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter
        basename={
          import.meta.env.BASE_URL === '/' ? undefined : import.meta.env.BASE_URL.replace(/\/$/, '')
        }
      >
        <AuthProvider>
          <Routes>
            <Route path='/' element={<Index />} />
            <Route path='/login' element={<LoginPage />} />
            {/* Public routes - no sidebar */}
            <Route path='/public/upload' element={<PublicUploadPage />} />
            <Route path='/public/cv/:candidateId/status' element={<PublicCVStatusPage />} />
            <Route path='/public/jobs' element={<PublicJobsPage />} />
            <Route path='/public/jobs/:jobId' element={<PublicJobDetailPage />} />
            <Route path='/public/apply/success/:candidateId' element={<PublicApplySuccessPage />} />
            {/* Protected HR / Admin routes */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path='/hr/dashboard' element={<DashboardPage />} />
              <Route path='/hr/departments' element={<DepartmentsPage />} />
              <Route path='/hr/jobs' element={<JobsPage />} />
              <Route path='/hr/matches' element={<MatchResultsPage />} />
              <Route path='/hr/interview-processes' element={<InterviewProcessesPage />} />
              <Route path='/hr/interview-processes/:id' element={<InterviewProcessDetailPage />} />
              <Route path='/hr/candidates' element={<CandidatesPage />} />
              <Route path='/hr/candidates/:candidateId' element={<CandidateDetailPage />} />
              <Route path='/hr/schedule' element={<SchedulePage />} />
              <Route path='/hr/calendar' element={<SchedulePage />} />

              <Route path='/admin/extract-errors' element={<ExtractErrorsPage />} />
              <Route path='/admin/ai-config' element={<AIConfigPage />} />
              <Route
                path='/admin/users'
                element={
                  <AdminRoute>
                    <UsersPage />
                  </AdminRoute>
                }
              />
            </Route>
            <Route path='*' element={<Navigate to='/' replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
