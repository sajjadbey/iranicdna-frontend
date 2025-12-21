// App.tsx

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { CommunitiesPage } from './pages/CommunitiesPage';
import { BlogPostsPage } from './pages/BlogPostsPage';
import { BlogPostDetailPage } from './pages/BlogPostDetailPage';
import { VCFAnalysisPage } from './pages/VCFAnalysisPage';

const App: React.FC = () => {
  const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';

  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/communities" element={<CommunitiesPage />} />
        <Route path="/blog" element={<BlogPostsPage />} />
        <Route path="/blog/:slug" element={<BlogPostDetailPage />} />
        <Route path="/vcf-analysis" element={<VCFAnalysisPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;