import React from 'react';
import { Link } from 'react-router-dom';
import { IconGamepad } from '../common/Icons.jsx';

export const Footer = () => {
  return (
    <footer className="bg-[#06080d] border-t border-white/5 pt-16 pb-12 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/5">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 p-0.5 shadow-[0_0_15px_rgba(0,240,255,0.3)]">
                <div className="w-full h-full bg-[#080b11] rounded-[10px] flex items-center justify-center">
                  <IconGamepad className="w-5 h-5 text-cyan-400" />
                </div>
              </div>
              <span className="text-xl font-black text-white font-display">
                PLAY<span className="text-gradient">WISE</span>
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-slate-400">
              The premier gaming discovery & PC hardware compatibility benchmark platform.
              Analyze your rig, explore 100+ titles, and track the best deals across digital storefronts.
            </p>
            <div className="text-xs font-semibold text-cyan-400">
              Play smarter. Choose better.
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-cyan-400 transition-colors">Home Showcase</Link>
              </li>
              <li>
                <Link to="/explore" className="hover:text-cyan-400 transition-colors">Explore All Games</Link>
              </li>
              <li>
                <Link to="/deals" className="hover:text-cyan-400 transition-colors">Game Deals & Discounts</Link>
              </li>
              <li>
                <Link to="/my-pc" className="hover:text-cyan-400 transition-colors">My PC Specs Builder</Link>
              </li>
              <li>
                <Link to="/wishlist" className="hover:text-cyan-400 transition-colors">My Saved Wishlist</Link>
              </li>
            </ul>
          </div>

          {/* Supported Stores & Features */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4">Features</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span>PC Compatibility Benchmark</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                <span>Cross-Store Price Comparison</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Instant Bottleneck Analysis</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                <span>Wishlist Price Alerts</span>
              </li>
            </ul>
          </div>

          {/* Disclaimer & Tech */}
          <div>
            <h4 className="text-white font-bold text-sm tracking-wider uppercase mb-4">Tech Foundation</h4>
            <p className="text-xs leading-relaxed text-slate-500 mb-3">
              Built on React, Tailwind CSS v4, DaisyUI, Redux Toolkit, Node.js & Express.
            </p>
            <div className="text-[11px] text-slate-500">
              Disclaimer: Steam, Epic Games, GOG, and other trademarks are the property of their respective owners.
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>
            &copy; {new Date().getFullYear()} PlayWise Gaming Platform. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <span className="text-cyan-400/80 font-mono">v1.0 Production Ready</span>
            <span>Made for PC Gamers</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

