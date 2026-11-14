import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  IconGamepad,
  IconCpu,
  IconHeart,
  IconUser,
  IconMenu,
  IconClose,
  IconSearch,
  IconTag,
  IconGlobe,
} from '../common/Icons.jsx';
import { setCurrency } from '../../redux/slices/currencySlice.js';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const dispatch = useDispatch();

  const wishlistCount = useSelector((state) => state.wishlist.gameIds.length);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const userSpecs = useSelector((state) => state.pc.specs);
  const { activeCurrency, currencies } = useSelector((state) => state.currency);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Explore', path: '/explore' },
    { name: 'Deals', path: '/deals', badge: 'HOT' },
    { name: 'My PC', path: '/my-pc', badge: userSpecs?.gpu ? 'Ready' : null },
    { name: 'Wishlist', path: '/wishlist', count: wishlistCount },
  ];

  const linkClasses = ({ isActive }) =>
    `relative px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
      isActive
        ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.15)]'
        : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
    }`;

  const displayName = user?.name || user?.gamerTag || 'Gamer';

  const handleCurrencyChange = (code) => {
    dispatch(setCurrency(code));
    setCurrencyDropdownOpen(false);
  };

  const currentCurrencyInfo = currencies[activeCurrency] || { symbol: '$', code: 'USD' };

  return (
    <header className="sticky top-0 z-50 bg-[#080b11]/90 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 p-0.5 shadow-[0_0_20px_rgba(0,240,255,0.35)] group-hover:shadow-[0_0_25px_rgba(0,240,255,0.6)] transition-all">
            <div className="w-full h-full bg-[#080b11] rounded-[10px] flex items-center justify-center">
              <IconGamepad className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black tracking-wider text-white font-display">
              PLAY<span className="text-gradient">WISE</span>
            </span>
            <span className="text-[10px] font-semibold tracking-widest text-cyan-400/80 -mt-1 uppercase">
              Play Smarter. Choose Better.
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
          {navLinks.map((link) => (
            <NavLink key={link.name} to={link.path} className={linkClasses}>
              <span>{link.name}</span>
              {typeof link.count === 'number' && link.count > 0 && (
                <span className="px-1.5 py-0.5 text-[11px] font-extrabold rounded-full bg-rose-500 text-white min-w-5 text-center leading-none">
                  {link.count}
                </span>
              )}
              {link.badge && (
                <span
                  className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                    link.badge === 'HOT'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse'
                      : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  }`}
                >
                  {link.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Right Section: Currency Selector + Quick Search + Auth / Profile */}
        <div className="hidden md:flex items-center gap-2.5">
          {/* Currency Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 hover:text-cyan-300 transition-all cursor-pointer"
              title="Display Currency (Estimated Conversions)"
            >
              <IconGlobe className="w-3.5 h-3.5 text-cyan-400" />
              <span>{currentCurrencyInfo.code} ({currentCurrencyInfo.symbol})</span>
              {activeCurrency !== 'USD' && (
                <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Est.
                </span>
              )}
            </button>

            {currencyDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-48 rounded-xl bg-[#0e1320] border border-cyan-500/30 shadow-[0_10px_30px_rgba(0,0,0,0.8)] py-1.5 z-50 backdrop-blur-xl animate-fadeIn"
                onMouseLeave={() => setCurrencyDropdownOpen(false)}
              >
                <div className="px-3 py-1.5 border-b border-white/10 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  Select Display Currency
                </div>
                {Object.values(currencies).map((c) => (
                  <button
                    key={c.code}
                    onClick={() => handleCurrencyChange(c.code)}
                    className={`w-full text-left px-3 py-2 text-xs font-semibold flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer ${
                      activeCurrency === c.code ? 'text-cyan-400 bg-cyan-950/40' : 'text-slate-300'
                    }`}
                  >
                    <span>{c.name}</span>
                    <span className="font-mono font-bold text-slate-400">
                      {c.code} ({c.symbol})
                    </span>
                  </button>
                ))}
                <div className="px-3 py-1.5 border-t border-white/10 text-[9px] text-slate-500 leading-tight">
                  Non-USD prices are real-time estimated conversions.
                </div>
              </div>
            )}
          </div>

          {/* Quick Search */}
          <Link
            to="/explore"
            className="p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors"
            title="Search Games"
          >
            <IconSearch className="w-5 h-5" />
          </Link>

          {/* Profile / Auth */}
          {isAuthenticated && user ? (
            <Link
              to="/profile"
              className="flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/40 transition-all group"
            >
              <img
                src={
                  user.avatar ||
                  'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=300&q=80'
                }
                alt={displayName}
                className="w-8 h-8 rounded-lg object-cover ring-2 ring-cyan-500/40 group-hover:ring-cyan-400"
              />
              <div className="text-left hidden lg:block">
                <div className="text-xs font-bold text-white leading-tight">
                  {displayName}
                </div>
                <div className="text-[10px] font-semibold text-cyan-400 leading-tight">
                  PRO GAMER
                </div>
              </div>
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-2 text-sm font-bold text-slate-300 hover:text-white transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 text-sm font-bold rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-black hover:opacity-95 shadow-[0_0_15px_rgba(0,240,255,0.25)] transition-all"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          {/* Quick Currency Toggle for Mobile */}
          <select
            value={activeCurrency}
            onChange={(e) => dispatch(setCurrency(e.target.value))}
            className="bg-white/10 text-cyan-300 text-xs font-bold py-1 px-2 rounded-lg border border-white/10 focus:outline-none"
            aria-label="Select Currency"
          >
            {Object.values(currencies).map((c) => (
              <option key={c.code} value={c.code} className="bg-[#080b11] text-white">
                {c.code} ({c.symbol})
              </option>
            ))}
          </select>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 cursor-pointer"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <IconClose className="w-6 h-6" /> : <IconMenu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0a0d14] border-b border-white/10 px-4 pt-3 pb-6 space-y-2 animate-fadeIn">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={linkClasses}
            >
              <span>{link.name}</span>
              {typeof link.count === 'number' && link.count > 0 && (
                <span className="ml-auto px-2 py-0.5 text-xs font-bold rounded-full bg-rose-500 text-white">
                  {link.count}
                </span>
              )}
              {link.badge && (
                <span
                  className={`ml-auto px-2 py-0.5 text-[10px] font-bold rounded ${
                    link.badge === 'HOT'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  }`}
                >
                  {link.badge}
                </span>
              )}
            </NavLink>
          ))}

          <div className="pt-4 border-t border-white/10 flex flex-col gap-2">
            {isAuthenticated && user ? (
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
              >
                <img
                  src={
                    user.avatar ||
                    'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=300&q=80'
                  }
                  alt={displayName}
                  className="w-9 h-9 rounded-lg object-cover ring-2 ring-cyan-500"
                />
                <div>
                  <div className="text-sm font-bold text-white">{displayName}</div>
                  <div className="text-xs text-cyan-400">View Gamer Profile</div>
                </div>
              </Link>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 text-center text-sm font-bold rounded-xl border border-white/10 text-white bg-white/5"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 text-center text-sm font-bold rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-black"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
