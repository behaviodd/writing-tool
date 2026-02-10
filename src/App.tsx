import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProjectListPage } from './pages/ProjectListPage';
import { WritingPage } from './pages/WritingPage';
import { SharedViewPage } from './pages/SharedViewPage';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<ProjectListPage />} />
            <Route path="/project/:projectId" element={<WritingPage />} />
            <Route path="/shared/:shareId" element={<SharedViewPage />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
