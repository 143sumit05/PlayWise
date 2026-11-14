import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setSpecs,
  setActiveProfile,
  applyPreset,
  clearSpecs,
  fetchUserProfiles,
  createUserProfile,
  updateUserProfile,
  deleteUserProfile,
  setDefaultUserProfile,
  PC_PRESETS,
} from '../redux/slices/pcSlice.js';
import { mockGames } from '../data/mockGames.js';
import { checkCompatibility } from '../utils/compatibilityChecker.js';
import SpecComparisonBar from '../components/common/SpecComparisonBar.jsx';
import compatibilityService from '../services/compatibilityService.js';
import benchmarkService from '../services/benchmarkService.js';
import {
  IconCpu,
  IconShieldCheck,
  IconCheck,
  IconGamepad,
  IconAlertCircle,
  IconTrash,
  IconPlus,
  IconGauge,
  IconMonitor,
  IconZap,
} from '../components/common/Icons.jsx';
import { Link } from 'react-router-dom';

export const MyPcPage = () => {
  const dispatch = useDispatch();
  const currentSpecs = useSelector((state) => state.pc.specs);
  const profiles = useSelector((state) => state.pc.profiles);
  const activeProfileId = useSelector((state) => state.pc.activeProfileId);
  const loading = useSelector((state) => state.pc.loading);
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [editingProfileId, setEditingProfileId] = useState(null);

  const [formData, setFormData] = useState({
    profileName: currentSpecs.presetName || 'Main Gaming Rig',
    cpu: currentSpecs.cpu || '',
    gpu: currentSpecs.gpu || '',
    ram: currentSpecs.ram || 16,
    storageType: currentSpecs.storageType || 'NVMe SSD',
    storageSpace: currentSpecs.storageSpace || 500,
    os: currentSpecs.os || 'Windows 11 64-bit',
    isDefault: false,
  });

  const [selectedGameId, setSelectedGameId] = useState(mockGames[0]?.id || '');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  // Fetch profiles from MongoDB when user is logged in
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchUserProfiles());
    }
  }, [isAuthenticated, dispatch]);

  // Sync form when currentSpecs change or when switching active profile
  useEffect(() => {
    if (!isCreatingNew) {
      setFormData({
        profileName: currentSpecs.presetName || 'Main Gaming Rig',
        cpu: currentSpecs.cpu || '',
        gpu: currentSpecs.gpu || '',
        ram: currentSpecs.ram || 16,
        storageType: currentSpecs.storageType || 'NVMe SSD',
        storageSpace: currentSpecs.storageSpace || 500,
        os: currentSpecs.os || 'Windows 11 64-bit',
        isDefault: false,
      });
      setEditingProfileId(activeProfileId);
    }
  }, [currentSpecs, activeProfileId, isCreatingNew]);

  const selectedGame = mockGames.find((g) => g.id === selectedGameId) || mockGames[0];

  // Phase 5 Hardware Benchmark & Balance State
  const [rigResolution, setRigResolution] = useState('1080p');
  const [rigBottleneck, setRigBottleneck] = useState(null);
  const [matchedGpu, setMatchedGpu] = useState(null);
  const [matchedCpu, setMatchedCpu] = useState(null);
  const [liveTesterCompatibility, setLiveTesterCompatibility] = useState(null);

  // Fetch verified benchmark tiers and hardware balance for active rig
  useEffect(() => {
    let isMounted = true;
    if (currentSpecs?.cpu && currentSpecs?.gpu) {
      Promise.all([
        benchmarkService.matchHardware(currentSpecs.gpu, 'gpu'),
        benchmarkService.matchHardware(currentSpecs.cpu, 'cpu'),
        compatibilityService.calculateBottleneck(currentSpecs.cpu, currentSpecs.gpu, rigResolution),
      ])
        .then(([gpuRes, cpuRes, bottleRes]) => {
          if (isMounted) {
            setMatchedGpu(gpuRes);
            setMatchedCpu(cpuRes);
            setRigBottleneck(bottleRes);
          }
        })
        .catch((err) => {
          console.warn('[MyPC] Benchmark analysis error:', err.message);
        });
    } else {
      setMatchedGpu(null);
      setMatchedCpu(null);
      setRigBottleneck(null);
    }
    return () => {
      isMounted = false;
    };
  }, [currentSpecs?.cpu, currentSpecs?.gpu, rigResolution]);

  // Fetch verified benchmark compatibility for the live game tester
  useEffect(() => {
    let isMounted = true;
    if (selectedGame && currentSpecs?.cpu && currentSpecs?.gpu) {
      compatibilityService
        .evaluate(currentSpecs, selectedGame)
        .then((data) => {
          if (isMounted && data) {
            setLiveTesterCompatibility(data);
          }
        })
        .catch((err) => {
          console.warn('[MyPC] Game benchmark evaluate error:', err.message);
        });
    } else {
      setLiveTesterCompatibility(null);
    }
    return () => {
      isMounted = false;
    };
  }, [selectedGame, currentSpecs]);

  const baseCompatibility = checkCompatibility(currentSpecs, selectedGame);
  const compatibility = liveTesterCompatibility || baseCompatibility;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? checked
          : name === 'ram' || name === 'storageSpace'
          ? Number(value)
          : value,
    }));
  };

  const handleSelectPreset = (presetName) => {
    const preset = PC_PRESETS.find((p) => p.name === presetName);
    if (preset) {
      setFormData({
        profileName: preset.specs.presetName,
        cpu: preset.specs.cpu,
        gpu: preset.specs.gpu,
        ram: preset.specs.ram,
        storageType: preset.specs.storageType,
        storageSpace: preset.specs.storageSpace,
        os: preset.specs.os,
        isDefault: false,
      });
      dispatch(applyPreset(presetName));
      setSaveSuccess(true);
      setFeedbackMessage(`Loaded preset: ${preset.name}`);
      setTimeout(() => setSaveSuccess(false), 2500);
    }
  };

  const handleSelectProfile = (profile) => {
    setIsCreatingNew(false);
    setEditingProfileId(profile._id);
    dispatch(setActiveProfile(profile._id));
    setSaveSuccess(true);
    setFeedbackMessage(`Switched active rig to "${profile.profileName}"`);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleSetDefault = (profileId) => {
    dispatch(setDefaultUserProfile(profileId));
    setSaveSuccess(true);
    setFeedbackMessage('Default rig updated in cloud.');
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleDelete = (profileId) => {
    if (window.confirm('Are you sure you want to delete this PC configuration?')) {
      dispatch(deleteUserProfile(profileId));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (isAuthenticated) {
      if (isCreatingNew || !editingProfileId) {
        // Create new MongoDB PC Profile
        await dispatch(
          createUserProfile({
            profileName: formData.profileName || 'Custom Gaming Rig',
            cpu: formData.cpu,
            gpu: formData.gpu,
            ram: formData.ram,
            storage: formData.storageSpace,
            storageType: formData.storageType,
            operatingSystem: formData.os,
            isDefault: formData.isDefault,
          })
        );
        setIsCreatingNew(false);
        setFeedbackMessage('New profile saved to your MongoDB cloud account!');
      } else {
        // Update existing MongoDB PC Profile
        await dispatch(
          updateUserProfile({
            id: editingProfileId,
            profileData: {
              profileName: formData.profileName,
              cpu: formData.cpu,
              gpu: formData.gpu,
              ram: formData.ram,
              storage: formData.storageSpace,
              storageType: formData.storageType,
              operatingSystem: formData.os,
              isDefault: formData.isDefault,
            },
          })
        );
        setFeedbackMessage('PC profile updated in MongoDB Atlas!');
      }
    } else {
      // Guest local storage mode
      dispatch(
        setSpecs({
          cpu: formData.cpu,
          gpu: formData.gpu,
          ram: formData.ram,
          storageType: formData.storageType,
          storageSpace: formData.storageSpace,
          os: formData.os,
          presetName: formData.profileName || 'Custom Build',
        })
      );
      setFeedbackMessage('Hardware specs saved to your local browser storage!');
    }

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const startNewProfile = () => {
    setIsCreatingNew(true);
    setEditingProfileId(null);
    setFormData({
      profileName: 'Secondary Gaming Rig',
      cpu: '',
      gpu: '',
      ram: 16,
      storageType: 'NVMe SSD',
      storageSpace: 500,
      os: 'Windows 11 64-bit',
      isDefault: false,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* 1. PAGE HEADER */}
      <div className="pb-6 border-b border-white/5 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-2">
            <IconCpu className="w-4 h-4 text-cyan-400" />
            Hardware Profile & Diagnostics
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white font-display">
            My Gaming PC Setup
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure your hardware specs to get 1-click real-time compatibility ratings across all games in the catalog.
          </p>
        </div>

        {/* Status Pill */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <span className="px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Cloud Sync: <strong>{user?.name}</strong> ({profiles.length} Rigs)
            </span>
          ) : (
            <span className="px-3 py-1.5 rounded-xl bg-amber-950/60 border border-amber-500/30 text-xs text-amber-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Guest Mode (Local Storage Only)
            </span>
          )}
        </div>
      </div>

      {/* Guest Mode Callout */}
      {!isAuthenticated && (
        <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <IconAlertCircle className="w-6 h-6 text-cyan-400 shrink-0" />
            <div className="text-xs text-slate-300">
              <strong className="text-white">Save Multiple PC Profiles:</strong> Sign in to store your Desktop, Laptop, and HTPC configurations in MongoDB Atlas and access them from any device!
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/login"
              className="px-4 py-2 rounded-xl bg-cyan-500 text-black text-xs font-bold hover:bg-cyan-400 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold hover:bg-white/10 transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>
      )}

      {/* 2. AUTHENTICATED: MULTI-PC PROFILE MANAGEMENT SELECTOR */}
      {isAuthenticated && profiles.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
              <span>Saved Cloud PC Configurations</span>
              <span className="text-xs font-normal text-slate-500">
                (Click to activate for compatibility scoring)
              </span>
            </h3>

            <button
              onClick={startNewProfile}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <IconPlus className="w-3.5 h-3.5" />
              <span>Add New Rig Profile</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profiles.map((profile) => {
              const isActive = (activeProfileId === profile._id) || (currentSpecs.presetName === profile.profileName);
              return (
                <div
                  key={profile._id}
                  className={`p-5 rounded-2xl border transition-all relative flex flex-col justify-between ${
                    isActive
                      ? 'bg-[#121c2e] border-cyan-500 shadow-[0_0_20px_rgba(0,240,255,0.2)]'
                      : 'bg-[#0d121c] border-white/5 hover:border-white/20'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h4 className="font-extrabold text-white text-base truncate" title={profile.profileName}>
                        {profile.profileName}
                      </h4>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {profile.isDefault && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase">
                            Default
                          </span>
                        )}
                        {isActive && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-cyan-500 text-black uppercase">
                            Active
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-xs font-mono text-cyan-400/90 space-y-1 mb-4">
                      <div className="truncate">GPU: {profile.gpu}</div>
                      <div className="truncate">CPU: {profile.cpu}</div>
                      <div>RAM: {profile.ram} GB • {profile.storageType} ({profile.storage} GB)</div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => handleSelectProfile(profile)}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                        isActive
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          : 'bg-white/5 hover:bg-cyan-500 hover:text-black text-slate-300'
                      }`}
                    >
                      {isActive ? 'Active Rig' : 'Select Rig'}
                    </button>

                    <div className="flex items-center gap-2">
                      {!profile.isDefault && (
                        <button
                          type="button"
                          onClick={() => handleSetDefault(profile._id)}
                          className="text-[11px] text-slate-400 hover:text-purple-400 font-medium"
                          title="Set as Default Rig"
                        >
                          Make Default
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDelete(profile._id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete Profile"
                      >
                        <IconTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 3. 1-CLICK HARDWARE PRESETS */}
      <section className="space-y-4">
        <h3 className="text-white font-bold text-lg flex items-center gap-2">
          <span>Quick Benchmark Presets</span>
          <span className="text-xs font-normal text-slate-500">(Populate specs in 1-click)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PC_PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => handleSelectPreset(preset.name)}
              className="p-5 rounded-2xl text-left border bg-[#0d121c] border-white/5 hover:border-cyan-500/40 hover:bg-[#111724] transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-extrabold text-white text-base group-hover:text-cyan-400 transition-colors">
                  {preset.name}
                </h4>
              </div>
              <p className="text-xs text-slate-400 mb-3">{preset.description}</p>
              <div className="text-[11px] font-mono text-cyan-400/90 space-y-1">
                <div>GPU: {preset.specs.gpu}</div>
                <div>CPU: {preset.specs.cpu}</div>
                <div>RAM: {preset.specs.ram}GB</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 4. HARDWARE SPECIFICATION FORM & LIVE RIG CARD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Specification Form (Left 7 Cols) */}
        <div className="lg:col-span-7 bg-[#0e1320] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
            <div>
              <h3 className="text-xl font-extrabold text-white">
                {isCreatingNew
                  ? 'Add New Cloud PC Profile'
                  : isAuthenticated && editingProfileId
                  ? `Edit Profile: ${formData.profileName}`
                  : 'Manual Hardware Entry'}
              </h3>
              <p className="text-xs text-slate-400">
                {isAuthenticated
                  ? 'Changes are automatically saved to your MongoDB Atlas profile.'
                  : 'Specify your system components for accurate benchmarking.'}
              </p>
            </div>
            {saveSuccess && (
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-3 py-1 rounded-xl flex items-center gap-1 animate-pulse">
                <IconCheck className="w-3.5 h-3.5" />
                {feedbackMessage || 'Saved!'}
              </span>
            )}
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            {/* Profile Name (if authenticated or custom) */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Rig Configuration Name
              </label>
              <input
                type="text"
                name="profileName"
                value={formData.profileName}
                onChange={handleChange}
                placeholder="e.g. Main Gaming Battlestation or ROG Strix Laptop"
                required
                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 text-sm focus:border-cyan-500 focus:outline-none"
              />
            </div>

            {/* Processor (CPU) */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Processor (CPU)
              </label>
              <input
                type="text"
                name="cpu"
                value={formData.cpu}
                onChange={handleChange}
                placeholder="e.g. Intel Core i7-12700 or AMD Ryzen 7 7800X3D"
                required
                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 text-sm focus:border-cyan-500 focus:outline-none"
              />
            </div>

            {/* Graphics Card (GPU) */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Graphics Card (GPU)
              </label>
              <input
                type="text"
                name="gpu"
                value={formData.gpu}
                onChange={handleChange}
                placeholder="e.g. NVIDIA GeForce RTX 3070 or AMD Radeon RX 6800 XT"
                required
                className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 text-sm focus:border-cyan-500 focus:outline-none"
              />
            </div>

            {/* RAM & Storage Type Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  System Memory (RAM in GB)
                </label>
                <select
                  name="ram"
                  value={formData.ram}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:border-cyan-500 focus:outline-none"
                >
                  <option value={8}>8 GB</option>
                  <option value={12}>12 GB</option>
                  <option value={16}>16 GB (Recommended)</option>
                  <option value={32}>32 GB</option>
                  <option value={64}>64 GB</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Primary Storage Type
                </label>
                <select
                  name="storageType"
                  value={formData.storageType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:border-cyan-500 focus:outline-none"
                >
                  <option value="NVMe SSD">NVMe M.2 SSD (Fastest)</option>
                  <option value="SATA SSD">SATA SSD</option>
                  <option value="HDD">Mechanical HDD</option>
                </select>
              </div>
            </div>

            {/* Available Storage Space & Operating System */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Available Free Storage (GB)
                </label>
                <input
                  type="number"
                  name="storageSpace"
                  value={formData.storageSpace}
                  onChange={handleChange}
                  placeholder="e.g. 500"
                  className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Operating System (OS)
                </label>
                <select
                  name="os"
                  value={formData.os}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:border-cyan-500 focus:outline-none"
                >
                  <option value="Windows 11 64-bit">Windows 11 64-bit</option>
                  <option value="Windows 10 64-bit">Windows 10 64-bit</option>
                  <option value="SteamOS / Linux">SteamOS / Linux</option>
                </select>
              </div>
            </div>

            {isAuthenticated && (
              <div className="pt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isDefaultCheckbox"
                  name="isDefault"
                  checked={formData.isDefault}
                  onChange={handleChange}
                  className="rounded border-white/20 bg-black/40 text-cyan-500 focus:ring-0"
                />
                <label htmlFor="isDefaultCheckbox" className="text-xs text-slate-300 font-medium cursor-pointer">
                  Set this configuration as my primary default PC profile
                </label>
              </div>
            )}

            {/* Form Actions */}
            <div className="pt-4 flex items-center justify-between">
              {isCreatingNew ? (
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="text-xs text-slate-400 hover:text-white font-semibold"
                >
                  Cancel New Rig
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => dispatch(clearSpecs())}
                  className="text-xs text-slate-400 hover:text-rose-400 font-semibold"
                >
                  Reset Form
                </button>
              )}

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-black font-extrabold text-sm hover:opacity-95 shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all cursor-pointer"
              >
                {loading
                  ? 'Saving to MongoDB...'
                  : isCreatingNew
                  ? 'Create New Cloud Rig'
                  : isAuthenticated
                  ? 'Save Changes to Cloud Profile'
                  : 'Save Local Rig Specs'}
              </button>
            </div>
          </form>
        </div>

        {/* Live Battlestation Summary Card (Right 5 Cols) */}
        <div className="lg:col-span-5 bg-[#0c101a] border border-cyan-500/20 rounded-3xl p-6 sm:p-7 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <IconShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-white font-extrabold text-lg">Active Rig Overview</h3>
                <span className="text-xs text-slate-400">Target for Compatibility Checks</span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase bg-cyan-500/20 text-cyan-300">
              Active
            </span>
          </div>

          {/* Specs List */}
          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-slate-400 font-medium">Profile Name:</span>
              <span className="text-cyan-300 font-bold">{currentSpecs.presetName || 'Custom Build'}</span>
            </div>
            <div className="py-2 border-b border-white/5 space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">GPU:</span>
                <span className="text-white font-bold">{currentSpecs.gpu || 'Not Set'}</span>
              </div>
              {matchedGpu && matchedGpu.tier && (
                <div className="flex justify-end items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                    Tier: {matchedGpu.tier}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Benchmark: <strong>{matchedGpu.benchmarkScore}/100</strong>
                  </span>
                </div>
              )}
            </div>
            <div className="py-2 border-b border-white/5 space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">CPU:</span>
                <span className="text-white font-bold">{currentSpecs.cpu || 'Not Set'}</span>
              </div>
              {matchedCpu && matchedCpu.tier && (
                <div className="flex justify-end items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950/80 text-purple-300 border border-purple-500/30">
                    Tier: {matchedCpu.tier}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Benchmark: <strong>{matchedCpu.benchmarkScore}/100</strong>
                  </span>
                </div>
              )}
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-slate-400 font-medium">RAM:</span>
              <span className="text-white font-bold">{currentSpecs.ram} GB</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-slate-400 font-medium">Storage:</span>
              <span className="text-white font-bold">
                {currentSpecs.storageType} ({currentSpecs.storageSpace} GB free)
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-slate-400 font-medium">OS:</span>
              <span className="text-white font-bold">{currentSpecs.os}</span>
            </div>
          </div>

          {/* Live Hardware Bottleneck & Balance Analyzer */}
          {rigBottleneck && rigBottleneck.available && (
            <div className="p-4 rounded-2xl bg-black/40 border border-cyan-500/20 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <IconMonitor className="w-4 h-4" />
                  Hardware Balance
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                    rigBottleneck.balanceRating === 'Great Balance'
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                      : rigBottleneck.balanceRating === 'Moderate Bottleneck'
                      ? 'bg-amber-950/80 text-amber-300 border border-amber-500/30'
                      : 'bg-rose-950/80 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {rigBottleneck.balanceRating} ({rigBottleneck.bottleneckPercentage}%)
                </span>
              </div>

              {/* Resolution Selector Tabs */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-400 font-medium">Target Resolution:</span>
                <div className="flex items-center gap-1 bg-black/60 p-0.5 rounded-lg border border-white/10">
                  {['1080p', '1440p', '4k'].map((res) => (
                    <button
                      key={res}
                      type="button"
                      onClick={() => setRigResolution(res)}
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                        rigResolution === res
                          ? 'bg-cyan-500 text-black shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {res.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed">
                {rigBottleneck.summary}
              </p>

              {rigBottleneck.resolutionImpact?.[rigResolution] && (
                <div className="p-2 rounded-lg bg-white/5 text-[10px] text-slate-300">
                  <strong className="text-cyan-300">
                    {rigBottleneck.resolutionImpact[rigResolution].characteristic}:
                  </strong>{' '}
                  {rigBottleneck.resolutionImpact[rigResolution].explanation}
                </div>
              )}
            </div>
          )}

          <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 text-xs text-cyan-300 leading-relaxed">
            💡 <strong>Multi-Rig Compatibility:</strong> PlayWise automatically uses your active rig profile above to compute real-time FPS estimates and compatibility badges across the entire game catalog.
          </div>
        </div>
      </div>

      {/* 5. INTERACTIVE GAME COMPATIBILITY TESTER */}
      <section className="bg-[#0e1320] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30">
              <IconGamepad className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-white">
                Live Game Benchmark Tester
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Test how your active rig ({currentSpecs.presetName || 'Active Rig'}) runs any game
              </p>
            </div>
          </div>

          {/* Game Selector Dropdown */}
          <div className="w-full sm:w-72">
            <select
              value={selectedGameId}
              onChange={(e) => setSelectedGameId(e.target.value)}
              className="w-full py-2.5 px-4 rounded-xl bg-black/50 border border-cyan-500/40 text-white text-sm focus:outline-none"
            >
              {mockGames.map((game) => (
                <option key={game.id} value={game.id}>
                  {game.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Game Benchmark Result Bar */}
        <SpecComparisonBar compatibility={compatibility} />
      </section>
    </div>
  );
};

export default MyPcPage;
