import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './themes/theme';
import { ProtectedRoute } from './components/ProtectedRoute';

// Lazy load all page components for better code splitting
const HomePage = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));
const CommunitiesPage = lazy(() => import('./pages/CommunitiesPage').then(m => ({ default: m.CommunitiesPage })));
const BlogPostsPage = lazy(() => import('./pages/BlogPostsPage').then(m => ({ default: m.BlogPostsPage })));
const BlogPostDetailPage = lazy(() => import('./pages/BlogPostDetailPage').then(m => ({ default: m.BlogPostDetailPage })));
const AdmixturePage = lazy(() => import('./pages/AdmixturePage').then(m => ({ default: m.AdmixturePage })));
const ToolsPage = lazy(() => import('./pages/ToolsPage').then(m => ({ default: m.ToolsPage })));
const FileConverterPage = lazy(() => import('./pages/FileConverterPage').then(m => ({ default: m.FileConverterPage })));
const QpAdmPage = lazy(() => import('./pages/QpAdmPage').then(m => ({ default: m.QpAdmPage })));
const SignupPage = lazy(() => import('./pages/SignupPage').then(m => ({ default: m.SignupPage })));
const SigninPage = lazy(() => import('./pages/SigninPage').then(m => ({ default: m.SigninPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage').then(m => ({ default: m.VerifyEmailPage })));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then(m => ({ default: m.ContactPage })));

// Loading fallback component
const PageLoader: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="inline-block w-12 h-12 border-4 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-slate-400">Loading...</p>
    </div>
  </div>
);

const App: React.FC = () => {
  const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';

  return (
    <ThemeProvider forcedTheme="default">
      <BrowserRouter basename={basename}>
        <AuthProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/communities" element={<CommunitiesPage />} />
              <Route path="/blog" element={<BlogPostsPage />} />
              <Route path="/blog/:slug" element={<BlogPostDetailPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/tools" element={<ToolsPage />} />
              <Route path="/tools/admixture" element={<AdmixturePage />} />
              <Route path="/tools/file-converter" element={<FileConverterPage />} />
              <Route path="/tools/vcf-to-plink" element={<FileConverterPage />} />
              <Route path="/tools/qpadm" element={<QpAdmPage />} />
              
              {/* Auth Routes */}
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/signin" element={<SigninPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              
              {/* Protected Routes */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;