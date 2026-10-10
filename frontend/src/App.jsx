import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { VocabProvider } from './context/VocabContext';
import { Navbar } from './components/Navbar';
import { DashboardPage } from './pages/DashboardPage';
import { ReviewPage } from './pages/ReviewPage';
import { AddWordPage } from './pages/AddWordPage';
import { UpcomingPage } from './pages/UpcomingPage';
import { ProgressPage } from './pages/ProgressPage';

export function App() {
  return (
    <BrowserRouter>
      <VocabProvider>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/review" element={<ReviewPage />} />
              <Route path="/add" element={<AddWordPage />} />
              <Route path="/upcoming" element={<UpcomingPage />} />
              <Route path="/progress" element={<ProgressPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </VocabProvider>
    </BrowserRouter>
  );
}

export default App;
