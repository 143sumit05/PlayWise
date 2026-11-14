import { configureStore } from '@reduxjs/toolkit';
import pcReducer from './slices/pcSlice.js';
import wishlistReducer from './slices/wishlistSlice.js';
import authReducer from './slices/authSlice.js';
import gameReducer from './slices/gameSlice.js';
import currencyReducer from './slices/currencySlice.js';

export const store = configureStore({
  reducer: {
    pc: pcReducer,
    wishlist: wishlistReducer,
    auth: authReducer,
    games: gameReducer,
    currency: currencyReducer,
  },
});

export default store;
