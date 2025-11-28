import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import YouTubeLearningAssistant from './components/YouTubeLearningAssistant.jsx';
import LandingPage from './components/LandingPage.jsx';
import AboutPage from './components/AboutPage.jsx';
import MultiSourceLearningAssistant from './components/MultiSourceLearningAssistant.jsx';
import TailwindDebug from './components/TailwindDebug.jsx';
import LoginPage from './components/LoginPage.jsx';
import RegisterPage from './components/RegisterPage.jsx';
import HistoryPage from './components/HistoryPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { useAuth } from './contexts/AuthContext';
import { LogOut, User } from 'lucide-react';

function Nav() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const isActive = (path) => location.pathname === path;
  return (
    <nav className="bg-white shadow mb-4">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-xl font-bold text-blue-700">StudyLab</Link>
          <Link
            to="/"
            className={`text-sm font-medium transition-colors ${isActive('/') ? 'text-blue-700' : 'text-gray-600 hover:text-blue-700'}`}
          >Home</Link>
          <Link
            to="/main"
            className={`text-sm font-medium transition-colors ${isActive('/main') ? 'text-blue-700' : 'text-gray-600 hover:text-blue-700'}`}
          >Assistant</Link>
          <Link
            to="/about"
            className={`text-sm font-medium transition-colors ${isActive('/about') ? 'text-blue-700' : 'text-gray-600 hover:text-blue-700'}`}
          >About</Link>
          <Link
            to="/multi"
            className={`text-sm font-medium transition-colors ${isActive('/multi') ? 'text-blue-700' : 'text-gray-600 hover:text-blue-700'}`}
          >Multi-Source</Link>
          {user && (
            <Link
              to="/history"
              className={`text-sm font-medium transition-colors ${isActive('/history') ? 'text-blue-700' : 'text-gray-600 hover:text-blue-700'}`}
            >History</Link>
          )}
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <User className="w-4 h-4" />
                <span>{user.name || user.email}</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-blue-700 hover:text-blue-800 transition">
                Login
              </Link>
              <Link to="/register" className="px-3 py-1.5 text-sm font-medium bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Nav />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/main" element={<YouTubeLearningAssistant />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/multi" element={<MultiSourceLearningAssistant />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
            <Route path="/tw" element={<TailwindDebug />} />
            <Route path="*" element={<div className="p-8 text-center text-gray-600">404 – Page Not Found</div>} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}