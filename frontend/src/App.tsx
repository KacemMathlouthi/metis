import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { RepositoryProvider } from './contexts/RepositoryContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { CallbackPage } from './pages/CallbackPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { AnalyticsPage } from './pages/dashboard/AnalyticsPage';
import { AIReviewPage } from './pages/dashboard/AIReviewPage';
import { RepositoriesPage } from './pages/dashboard/RepositoriesPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RepositoryProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/callback" element={<CallbackPage />} />

            {/* Protected Dashboard Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="ai-review" element={<AIReviewPage />} />
              <Route path="repositories" element={<RepositoriesPage />} />
            </Route>

            {/* 404 Page */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </RepositoryProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
