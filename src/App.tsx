// App.tsx

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { CommunitiesPage } from './pages/CommunitiesPage';

const App: React.FC = () => {
  const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';

  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/communities" element={<CommunitiesPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;