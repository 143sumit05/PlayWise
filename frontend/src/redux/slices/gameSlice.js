import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import gameService from '../../services/gameService.js';

// Async thunk to fetch catalog games with pagination, genre, search, and sorting
export const fetchCatalogGames = createAsyncThunk(
  'games/fetchCatalogGames',
  async (params, { rejectWithValue }) => {
    try {
      const data = await gameService.getGames(params);
      return data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch catalog games');
    }
  }
);

// Async thunk to fetch curated homepage sections
export const fetchFeaturedSections = createAsyncThunk(
  'games/fetchFeaturedSections',
  async (_, { rejectWithValue }) => {
    try {
      const data = await gameService.getFeaturedSections();
      return data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch featured sections');
    }
  }
);

// Async thunk to fetch single game details by ID or slug
export const fetchGameDetails = createAsyncThunk(
  'games/fetchGameDetails',
  async (id, { rejectWithValue }) => {
    try {
      const data = await gameService.getGameById(id);
      return data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch game details');
    }
  }
);

// Async thunk to fetch genre list
export const fetchGenres = createAsyncThunk(
  'games/fetchGenres',
  async (_, { rejectWithValue }) => {
    try {
      const data = await gameService.getGenres();
      return data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch genres');
    }
  }
);

const gameSlice = createSlice({
  name: 'games',
  initialState: {
    // Search & Filter state
    searchQuery: '',
    selectedGenre: 'All',
    sortBy: 'popularity', // 'popularity', 'rating', 'releaseDate', 'name'
    currentPage: 1,

    // Catalog state
    catalog: {
      count: 0,
      page: 1,
      pageSize: 20,
      totalPages: 1,
      hasNext: false,
      hasPrevious: false,
      results: [],
      loading: false,
      error: null,
    },

    // Curated Homepage sections
    featuredSections: {
      featured: [],
      trending: [],
      popular: [],
      recent: [],
      loading: false,
      error: null,
    },

    // Single Game Details state
    currentGame: {
      data: null,
      loading: false,
      error: null,
    },

    // Genres
    genresList: [],
  },
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
      state.currentPage = 1;
    },
    setSelectedGenre: (state, action) => {
      state.selectedGenre = action.payload;
      state.currentPage = 1;
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
      state.currentPage = 1;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    resetFilters: (state) => {
      state.searchQuery = '';
      state.selectedGenre = 'All';
      state.sortBy = 'popularity';
      state.currentPage = 1;
    },
    clearCurrentGame: (state) => {
      state.currentGame = { data: null, loading: false, error: null };
    },
  },
  extraReducers: (builder) => {
    builder
      // Catalog
      .addCase(fetchCatalogGames.pending, (state) => {
        state.catalog.loading = true;
        state.catalog.error = null;
      })
      .addCase(fetchCatalogGames.fulfilled, (state, action) => {
        state.catalog.loading = false;
        state.catalog.results = action.payload.results || [];
        state.catalog.count = action.payload.count || 0;
        state.catalog.page = action.payload.page || 1;
        state.catalog.pageSize = action.payload.pageSize || 20;
        state.catalog.totalPages = action.payload.totalPages || 1;
        state.catalog.hasNext = action.payload.hasNext || false;
        state.catalog.hasPrevious = action.payload.hasPrevious || false;
      })
      .addCase(fetchCatalogGames.rejected, (state, action) => {
        state.catalog.loading = false;
        state.catalog.error = action.payload;
      })

      // Featured Sections
      .addCase(fetchFeaturedSections.pending, (state) => {
        state.featuredSections.loading = true;
        state.featuredSections.error = null;
      })
      .addCase(fetchFeaturedSections.fulfilled, (state, action) => {
        state.featuredSections.loading = false;
        state.featuredSections.featured = action.payload.featured || [];
        state.featuredSections.trending = action.payload.trending || [];
        state.featuredSections.popular = action.payload.popular || [];
        state.featuredSections.recent = action.payload.recent || [];
      })
      .addCase(fetchFeaturedSections.rejected, (state, action) => {
        state.featuredSections.loading = false;
        state.featuredSections.error = action.payload;
      })

      // Game Details
      .addCase(fetchGameDetails.pending, (state) => {
        state.currentGame.loading = true;
        state.currentGame.error = null;
      })
      .addCase(fetchGameDetails.fulfilled, (state, action) => {
        state.currentGame.loading = false;
        state.currentGame.data = action.payload;
      })
      .addCase(fetchGameDetails.rejected, (state, action) => {
        state.currentGame.loading = false;
        state.currentGame.error = action.payload;
      })

      // Genres
      .addCase(fetchGenres.fulfilled, (state, action) => {
        state.genresList = action.payload || [];
      });
  },
});

export const {
  setSearchQuery,
  setSelectedGenre,
  setSortBy,
  setCurrentPage,
  resetFilters,
  clearCurrentGame,
} = gameSlice.actions;

export default gameSlice.reducer;
