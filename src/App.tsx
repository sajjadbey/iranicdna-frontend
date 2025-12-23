import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { CommunitiesPage } from './pages/CommunitiesPage';
import { BlogPostsPage } from './pages/BlogPostsPage';
import { BlogPostDetailPage } from './pages/BlogPostDetailPage';
import { AdmixturePage } from './pages/AdmixturePage';
import { ToolsPage } from './pages/ToolsPage';
import { FileConverterPage } from './pages/FileConverterPage';
import { SignupPage } from './pages/SignupPage';
import { SigninPage } from './pages/SigninPage';
import { ProfilePage } from './pages/ProfilePage';

const App: React.FC = () => {
  const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';

  return (
    <BrowserRouter basename={basename}>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/communities" element={<CommunitiesPage />} />
          <Route path="/blog" element={<BlogPostsPage />} />
          <Route path="/blog/:slug" element={<BlogPostDetailPage />} />
          <Route path="/tools" element={<ToolsPage />} />
          <Route path="/tools/admixture" element={<AdmixturePage />} />
          <Route path="/tools/file-converter" element={<FileConverterPage />} />
          <Route path="/tools/vcf-to-plink" element={<FileConverterPage />} />
          
          {/* Auth Routes */}
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/signin" element={<SigninPage />} />
          
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
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;