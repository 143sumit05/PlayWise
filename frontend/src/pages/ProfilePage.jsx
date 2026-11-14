import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../redux/slices/authSlice.js';
import { fetchUserProfiles } from '../redux/slices/pcSlice.js';
import {
  IconUser,
  IconCpu,
  IconHeart,
  IconGamepad,
  IconShieldCheck,
  IconTag,
  IconPlus,
} from '../components/common/Icons.jsx';

export const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const userSpecs = useSelector((state) => state.pc.specs);
  const profiles = useSelector((state) => state.pc.profiles);
  const wishlistCount = useSelector((state) => state.wishlist.gameIds.length);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchUserProfiles());
    }
  }, [isAuthenticated, dispatch]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/');
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <IconUser className="w-16 h-16 text-slate-600 mx-auto" />
        <h2 className="text-2xl font-bold text-white">Not Signed In</h2>
        <p className="text-slate-400 text-sm">
          Please sign in to view your gamer profile and saved hardware configurations.
        </p>
        <Link
          to="/login"
          className="inline-block px-6 py-2.5 rounded-xl bg-cyan-500 text-black font-extrabold text-sm"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const memberDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
      })
    : '2025';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* 1. GAMER BANNER & AVATAR CARD */}
      <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-r from-[#0d1424] via-[#101b33] to-[#171330] p-6 sm:p-10 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <img
            src={
              user.avatar ||
              'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=300&q=80'
            }
            alt={user.name}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover ring-4 ring-cyan-500/50 shadow-2xl shrink-0"
          />

          <div className="space-y-2 text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold bg-gradient-to-r from-cyan-500 to-blue-600 text-black uppercase tracking-wider">
                VERIFIED GAMER
              </span>
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-white/10 text-cyan-300">
                PRO LEVEL
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white font-display">
              {user.name}
            </h1>

            <p className="text-xs sm:text-sm text-slate-400">
              {user.email} • Member since {memberDate}
            </p>
          </div>

          <div className="self-center sm:self-start">
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* 2. STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-[#0e1320] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-3 text-cyan-400 mb-2">
            <IconCpu className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Saved PC Configurations
            </span>
          </div>
          <div className="text-xl font-extrabold text-white">
            {profiles.length} Cloud Rigs
          </div>
          <Link to="/my-pc" className="text-xs text-cyan-400 hover:underline mt-1 block">
            Manage profiles in My PC &rarr;
          </Link>
        </div>

        <div className="bg-[#0e1320] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-3 text-rose-400 mb-2">
            <IconHeart className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Wishlist Items
            </span>
          </div>
          <div className="text-xl font-extrabold text-white">
            {wishlistCount} Games
          </div>
          <Link to="/wishlist" className="text-xs text-cyan-400 hover:underline mt-1 block">
            View saved titles &rarr;
          </Link>
        </div>

        <div className="bg-[#0e1320] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-3 text-purple-400 mb-2">
            <IconTag className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Database Sync
            </span>
          </div>
          <div className="text-xl font-extrabold text-emerald-400 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>MongoDB Atlas Active</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Multi-device cloud profile</p>
        </div>
      </div>

      {/* 3. HARDWARE SPECIFICATION DETAILS & SAVED RIGS */}
      <div className="bg-[#0e1320] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <IconCpu className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white">
                Active Benchmark Rig ({userSpecs?.presetName || 'Custom Rig'})
              </h2>
              <p className="text-xs text-slate-400">
                Current specs used for automated game compatibility checks
              </p>
            </div>
          </div>

          <Link
            to="/my-pc"
            className="px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500 text-cyan-400 hover:text-black border border-cyan-500/30 font-bold text-xs transition-all"
          >
            Configure Specs
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="bg-black/40 border border-white/5 p-4 rounded-xl flex justify-between items-center">
            <span className="text-slate-400 font-medium">Graphics Card:</span>
            <span className="text-white font-bold">{userSpecs?.gpu || 'Not Set'}</span>
          </div>
          <div className="bg-black/40 border border-white/5 p-4 rounded-xl flex justify-between items-center">
            <span className="text-slate-400 font-medium">Processor (CPU):</span>
            <span className="text-white font-bold">{userSpecs?.cpu || 'Not Set'}</span>
          </div>
          <div className="bg-black/40 border border-white/5 p-4 rounded-xl flex justify-between items-center">
            <span className="text-slate-400 font-medium">Memory (RAM):</span>
            <span className="text-white font-bold">{userSpecs?.ram || 16} GB</span>
          </div>
          <div className="bg-black/40 border border-white/5 p-4 rounded-xl flex justify-between items-center">
            <span className="text-slate-400 font-medium">Storage Type:</span>
            <span className="text-white font-bold">
              {userSpecs?.storageType || 'NVMe SSD'} ({userSpecs?.storageSpace || 500} GB)
            </span>
          </div>
          <div className="bg-black/40 border border-white/5 p-4 rounded-xl flex justify-between items-center md:col-span-2">
            <span className="text-slate-400 font-medium">Operating System:</span>
            <span className="text-white font-bold">{userSpecs?.os || 'Windows 11 64-bit'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
