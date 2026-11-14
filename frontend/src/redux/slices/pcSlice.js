import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import pcProfileService from '../../services/pcProfileService.js';

const STORAGE_KEY = 'playwise_pc_specs';

const defaultSpecs = {
  cpu: 'Intel Core i7-12700',
  gpu: 'NVIDIA GeForce RTX 3070',
  ram: 16,
  storageType: 'NVMe SSD',
  storageSpace: 500,
  os: 'Windows 11 64-bit',
  presetName: 'Custom Rig',
};

const loadInitialSpecs = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : defaultSpecs;
  } catch (e) {
    return defaultSpecs;
  }
};

export const PC_PRESETS = [
  {
    name: 'High-End 4K Rig',
    description: 'Crushes AAA games at 1440p / 4K Ultra with Ray Tracing',
    specs: {
      cpu: 'AMD Ryzen 7 7800X3D',
      gpu: 'NVIDIA GeForce RTX 4080',
      ram: 32,
      storageType: 'NVMe SSD',
      storageSpace: 1000,
      os: 'Windows 11 64-bit',
      presetName: 'High-End 4K Rig',
    },
  },
  {
    name: 'Mid-Tier 1440p Battlestation',
    description: 'Sweet spot for 1080p Ultra & 1440p High 60+ FPS',
    specs: {
      cpu: 'Intel Core i5-12400',
      gpu: 'NVIDIA GeForce RTX 3060',
      ram: 16,
      storageType: 'NVMe SSD',
      storageSpace: 500,
      os: 'Windows 11 64-bit',
      presetName: 'Mid-Tier 1440p Battlestation',
    },
  },
  {
    name: 'Budget 1080p Starter',
    description: 'Entry-level competitive & light AAA gaming setup',
    specs: {
      cpu: 'AMD Ryzen 5 1600',
      gpu: 'NVIDIA GeForce GTX 1650',
      ram: 8,
      storageType: 'SATA SSD',
      storageSpace: 250,
      os: 'Windows 10 64-bit',
      presetName: 'Budget 1080p Starter',
    },
  },
];

// Async thunks for MongoDB PC Profile management
export const fetchUserProfiles = createAsyncThunk(
  'pc/fetchUserProfiles',
  async (_, { rejectWithValue }) => {
    try {
      const data = await pcProfileService.getProfiles();
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch PC profiles');
    }
  }
);

export const createUserProfile = createAsyncThunk(
  'pc/createUserProfile',
  async (profileData, { rejectWithValue, dispatch }) => {
    try {
      const data = await pcProfileService.createProfile(profileData);
      dispatch(fetchUserProfiles());
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create PC profile');
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'pc/updateUserProfile',
  async ({ id, profileData }, { rejectWithValue, dispatch }) => {
    try {
      const data = await pcProfileService.updateProfile(id, profileData);
      dispatch(fetchUserProfiles());
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update PC profile');
    }
  }
);

export const deleteUserProfile = createAsyncThunk(
  'pc/deleteUserProfile',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await pcProfileService.deleteProfile(id);
      dispatch(fetchUserProfiles());
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete PC profile');
    }
  }
);

export const setDefaultUserProfile = createAsyncThunk(
  'pc/setDefaultUserProfile',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const data = await pcProfileService.setDefaultProfile(id);
      dispatch(fetchUserProfiles());
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to set default profile');
    }
  }
);

const pcSlice = createSlice({
  name: 'pc',
  initialState: {
    specs: loadInitialSpecs(),
    profiles: [],
    activeProfileId: null,
    loading: false,
    error: null,
    lastUpdated: new Date().toISOString(),
  },
  reducers: {
    setSpecs: (state, action) => {
      state.specs = { ...state.specs, ...action.payload };
      state.lastUpdated = new Date().toISOString();
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.specs));
      } catch (e) {}
    },
    setActiveProfile: (state, action) => {
      const profile = state.profiles.find((p) => p._id === action.payload);
      if (profile) {
        state.activeProfileId = profile._id;
        state.specs = {
          cpu: profile.cpu,
          gpu: profile.gpu,
          ram: profile.ram,
          storageType: profile.storageType,
          storageSpace: profile.storage,
          os: profile.operatingSystem,
          presetName: profile.profileName,
        };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(state.specs));
        } catch (e) {}
      }
    },
    applyPreset: (state, action) => {
      const preset = PC_PRESETS.find((p) => p.name === action.payload);
      if (preset) {
        state.specs = { ...preset.specs };
        state.lastUpdated = new Date().toISOString();
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(state.specs));
        } catch (e) {}
      }
    },
    clearSpecs: (state) => {
      state.specs = {
        cpu: '',
        gpu: '',
        ram: '',
        storageType: 'NVMe SSD',
        storageSpace: '',
        os: 'Windows 11 64-bit',
        presetName: 'Unconfigured',
      };
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {}
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Profiles
      .addCase(fetchUserProfiles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfiles.fulfilled, (state, action) => {
        state.loading = false;
        state.profiles = action.payload || [];

        // If user has profiles, synchronize the active specs with the default profile
        if (state.profiles.length > 0) {
          const defaultProfile =
            state.profiles.find((p) => p.isDefault) || state.profiles[0];
          state.activeProfileId = defaultProfile._id;
          state.specs = {
            cpu: defaultProfile.cpu,
            gpu: defaultProfile.gpu,
            ram: defaultProfile.ram,
            storageType: defaultProfile.storageType,
            storageSpace: defaultProfile.storage,
            os: defaultProfile.operatingSystem,
            presetName: defaultProfile.profileName,
          };
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state.specs));
          } catch (e) {}
        }
      })
      .addCase(fetchUserProfiles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setSpecs, setActiveProfile, applyPreset, clearSpecs } = pcSlice.actions;
export default pcSlice.reducer;
