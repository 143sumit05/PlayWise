import React, { useEffect } from 'react';
import { Routes, Route, useLocation, Link, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth } from './redux/slices/authSlice.js';
import { fetchUserProfiles } from './redux/slices/pcSlice.js';
import { fetchCurrencyRates } from './redux/slices/currencySlice.js';
import Layout from './components/layout/Layout.jsx';
import HomePage from './pages/HomePage.jsx';
import ExplorePage from './pages/ExplorePage.jsx';
import DealsPage from './pages/DealsPage.jsx';
import GameDetailsPage from './pages/GameDetailsPage.jsx';
import MyPcPage from './pages/MyPcPage.jsx';
import WishlistPage from './pages/WishlistPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import { IconGamepad } from './components/common/Icons.jsx';

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// Protected route wrapper
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  if (!isAuthenticated && !loading) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// 404 Fallback
function NotFoundPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-28 text-center space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center mx-auto mb-2">
        <IconGamepad className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-black text-white font-display">404 - Level Not Found</h1>
      <p className="text-slate-400 text-sm">
        The checkpoint or game coordinates you are looking for do not exist in this sector.
      </p>
      <Link
        to="/"
        className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-black font-extrabold text-sm shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:opacity-95 transition-all"
      >
        Return to Home Base
      </Link>
    </div>
  );
}

export function App() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Check auth session and fetch latest currency exchange rates on startup
  useEffect(() => {
    dispatch(checkAuth());
    dispatch(fetchCurrencyRates());
  }, [dispatch]);

  // When authenticated, fetch cloud PC profiles
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchUserProfiles());
    }
  }, [isAuthenticated, dispatch]);

  return (
    <Layout>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/deals" element={<DealsPage />} />
        <Route path="/game/:id" element={<GameDetailsPage />} />
        <Route path="/my-pc" element={<MyPcPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
