import { createSlice } from '@reduxjs/toolkit';
import { mockGames } from '../../data/mockGames.js';

const STORAGE_KEY = 'playwise_wishlist_items';

const initialDefaultItems = mockGames.slice(0, 2).map((g) => ({
  id: g.id,
  title: g.title,
  coverImage: g.coverImage,
  price: g.price,
  salePrice: g.salePrice,
  discount: g.discount,
  rating: g.rating,
  genres: g.genres,
  developer: g.developer,
  releaseDate: g.releaseDate,
}));

const loadInitialItems = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
    return initialDefaultItems;
  } catch (e) {
    return initialDefaultItems;
  }
};

const initialItems = loadInitialItems();

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: initialItems,
    gameIds: initialItems.map((item) => (typeof item === 'string' ? item : item.id)),
  },
  reducers: {
    toggleWishlist: (state, action) => {
      const payload = action.payload;
      const id = typeof payload === 'object' && payload !== null ? payload.id : payload;

      const existingIndex = state.items.findIndex((item) =>
        (typeof item === 'string' ? item : item.id) === id
      );

      if (existingIndex >= 0) {
        state.items.splice(existingIndex, 1);
        state.gameIds = state.gameIds.filter((gid) => gid !== id);
      } else {
        const itemToSave =
          typeof payload === 'object' && payload !== null
            ? {
                id: payload.id,
                title: payload.title,
                coverImage: payload.coverImage,
                price: payload.price || 59.99,
                salePrice: payload.salePrice || payload.price || 59.99,
                discount: payload.discount || 0,
                rating: payload.rating || 8.5,
                genres: payload.genres || ['Action'],
                developer: payload.developer || 'Featured Studio',
                releaseDate: payload.releaseDate || '2023',
              }
            : {
                id,
                title: id.replace(/-/g, ' ').toUpperCase(),
                coverImage:
                  'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
                price: 59.99,
                salePrice: 59.99,
                discount: 0,
                rating: 8.5,
                genres: ['Action'],
                developer: 'Featured Studio',
                releaseDate: '2023',
              };

        state.items.push(itemToSave);
        if (!state.gameIds.includes(id)) {
          state.gameIds.push(id);
        }
      }

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
      } catch (e) {}
    },

    removeFromWishlist: (state, action) => {
      const id = action.payload;
      state.items = state.items.filter((item) => (typeof item === 'string' ? item : item.id) !== id);
      state.gameIds = state.gameIds.filter((gid) => gid !== id);

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
      } catch (e) {}
    },

    clearWishlist: (state) => {
      state.items = [];
      state.gameIds = [];

      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {}
    },
  },
});

export const { toggleWishlist, removeFromWishlist, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
