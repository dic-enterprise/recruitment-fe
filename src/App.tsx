import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Toaster as Sonner, toast } from '@/shared/components/ui/sonner';
import { Toaster } from '@/shared/components/ui/toaster';
import { TooltipProvider } from '@/shared/components/ui/tooltip';
import AppLayout from '@/shared/components/AppLayout';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import DashboardPage from './pages/hr/DashboardPage';
import DepartmentsPage from './pages/hr/department/DepartmentsPage.tsx';
import DepartmentDetailPage from './pages/hr/DepartmentDetailPage';
import JobsPage from './pages/hr/JobsPage';
import JobDetailPage from './pages/hr/JobDetailPage';
import CandidatesPage from './pages/hr/CandidatesPage';
import CandidateDetailPage from './pages/hr/CandidateDetailPage';
import PublicUploadPage from './pages/public/PublicUploadPage';
import PublicCVStatusPage from './pages/public/PublicCVStatusPage';
import ExtractErrorsPage from './pages/admin/ExtractErrorsPage';

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
      toast.error(error.response?.data?.message || error.message || 'Lỗi kết nối server');
    },
  }),
  mutationCache: new MutationCache({
    onError: (error: any) => {
      // Hiển thị toast lỗi cho tất cả POST/PUT/DELETE requests
      toast.error(error.response?.data?.message || error.message || 'Thao tác thất bại');
    },
  }),
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Index />} />
          {/* Public routes - no sidebar */}
          <Route path='/public/upload' element={<PublicUploadPage />} />
          <Route path='/public/cv/:candidateId/status' element={<PublicCVStatusPage />} />
          {/* HR routes */}
          <Route
            path='/hr/dashboard'
            element={
              <AppLayout>
                <DashboardPage />
              </AppLayout>
            }
          />
          <Route
            path='/hr/departments'
            element={
              <AppLayout>
                <DepartmentsPage />
              </AppLayout>
            }
          />
          <Route
            path='/hr/departments/:departmentId'
            element={
              <AppLayout>
                <DepartmentDetailPage />
              </AppLayout>
            }
          />
          <Route
            path='/hr/jobs'
            element={
              <AppLayout>
                <JobsPage />
              </AppLayout>
            }
          />
          <Route
            path='/hr/jobs/:jobId'
            element={
              <AppLayout>
                <JobDetailPage />
              </AppLayout>
            }
          />
          <Route
            path='/hr/candidates'
            element={
              <AppLayout>
                <CandidatesPage />
              </AppLayout>
            }
          />
          <Route
            path='/hr/candidates/:candidateId'
            element={
              <AppLayout>
                <CandidateDetailPage />
              </AppLayout>
            }
          />
          {/* Admin routes */}
          <Route
            path='/admin/extract-errors'
            element={
              <AppLayout>
                <ExtractErrorsPage />
              </AppLayout>
            }
          />
          <Route path='*' element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
