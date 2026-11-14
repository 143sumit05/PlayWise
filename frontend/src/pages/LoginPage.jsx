import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearAuthError } from '../redux/slices/authSlice.js';
import { fetchUserProfiles } from '../redux/slices/pcSlice.js';
import { IconGamepad, IconShieldCheck, IconAlertCircle } from '../components/common/Icons.jsx';

export const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isAuthenticated, loading, error, successMessage } = useSelector(
    (state) => state.auth
  );

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchUserProfiles());
      navigate('/profile');
    }
  }, [isAuthenticated, navigate, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(
      loginUser({
        email: email.trim(),
        password,
      })
    );

    if (loginUser.fulfilled.match(result)) {
      dispatch(fetchUserProfiles());
      navigate('/profile');
    }
  };

  const handleFillDemoCredentials = () => {
    setEmail('gamer@playwise.gg');
    setPassword('GamerPassword123!');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md bg-[#0e1320] border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute -right-20 -top-20 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center space-y-2 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-600 p-0.5 mx-auto mb-3 shadow-[0_0_20px_rgba(0,240,255,0.3)]">
            <div className="w-full h-full bg-[#080b11] rounded-[14px] flex items-center justify-center">
              <IconGamepad className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            Welcome Back, Gamer
          </h2>
          <p className="text-xs text-slate-400">
            Sign in to access your saved PC rigs, alerts & wishlist
          </p>
        </div>

        {/* Error Alert Message */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/80 border border-rose-500/50 flex items-start gap-3 text-rose-200 text-xs">
            <IconAlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{error}</div>
          </div>
        )}

        {/* Success Alert Message */}
        {successMessage && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/50 flex items-start gap-3 text-emerald-200 text-xs">
            <IconShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{successMessage}</div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="gamer@playwise.gg"
              required
              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 text-sm focus:border-cyan-500 focus:outline-none transition-all"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Password
              </label>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 text-sm focus:border-cyan-500 focus:outline-none transition-all"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-white/20 bg-black/40 text-cyan-500 focus:ring-0"
              />
              <span>Remember this device</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-black font-extrabold text-sm hover:opacity-95 shadow-[0_0_20px_rgba(0,240,255,0.25)] transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Authenticating with PlayWise...' : 'Sign In to PlayWise'}
          </button>
        </form>

        {/* Quick Fill Credentials Helper */}
        <div className="mt-4 pt-4 border-t border-white/5">
          <button
            type="button"
            onClick={handleFillDemoCredentials}
            className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-300 text-xs font-bold border border-cyan-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <IconShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Fill Demo Credentials</span>
          </button>
        </div>

        {/* Switch to Signup */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Don't have an account yet?{' '}
          <Link to="/signup" className="text-cyan-400 font-bold hover:underline">
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
