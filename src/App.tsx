import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query';
import i18n from '@/shared/i18n';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { Toaster as Sonner, toast } from '@/shared/components/ui/sonner';
import { Toaster } from '@/shared/components/ui/toaster';
import { TooltipProvider } from '@/shared/components/ui/tooltip';
import AppLayout from '@/shared/components/AppLayout';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
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
import ExtractErrorsPage from './pages/admin/ExtractErrorsPage';
import AIConfigPage from './pages/admin/AIConfigPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false, // Tắt hoàn toàn retry theo yêu cầu
      staleTime: 1000 * 30,
    },
  },
  queryCache: new QueryCache({
    onError: (error: any) => {
      // Hiển thị toast lỗi cho tất cả GET requests
      toast.error(error.response?.data?.message || error.message || i18n.t('common.serverError'));
    },
  }),
  mutationCache: new MutationCache({
    onError: (error: any) => {
      // Hiển thị toast lỗi cho tất cả POST/PUT/DELETE requests
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
        <Routes>
          <Route path='/' element={<Index />} />
          {/* Public routes - no sidebar */}
          <Route path='/public/upload' element={<PublicUploadPage />} />
          <Route path='/public/cv/:candidateId/status' element={<PublicCVStatusPage />} />
          {/* HR routes */}
          <Route element={<AppLayout />}>
            {/* HR */}
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

            {/* Admin */}
            <Route path='/admin/extract-errors' element={<ExtractErrorsPage />} />
            <Route path='/admin/ai-config' element={<AIConfigPage />} />
          </Route>
          {/* <Route path='*' element={<NotFound />} /> */}
          <Route path='*' element={<Navigate to='/' replace />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
