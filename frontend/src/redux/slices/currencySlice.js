import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api.js';

// Default currencies fallback
const DEFAULT_CURRENCIES = {
  USD: { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1.0 },
  EUR: { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.92 },
  GBP: { code: 'GBP', name: 'British Pound', symbol: '£', rate: 0.78 },
  INR: { code: 'INR', name: 'Indian Rupee', symbol: '₹', rate: 86.5 },
  CAD: { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', rate: 1.38 },
  AUD: { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', rate: 1.52 },
  JPY: { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rate: 155.0 },
};

export const fetchCurrencyRates = createAsyncThunk(
  'currency/fetchRates',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/deals/currencies');
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch currency rates');
    }
  }
);

const savedCurrency = typeof window !== 'undefined'
  ? localStorage.getItem('playwise_currency') || 'USD'
  : 'USD';

const initialState = {
  activeCurrency: savedCurrency,
  currencies: DEFAULT_CURRENCIES,
  disclaimer: 'All non-USD prices are real-time estimated conversions from USD. Actual regional pricing may vary by retailer.',
  loading: false,
  error: null,
};

const currencySlice = createSlice({
  name: 'currency',
  initialState,
  reducers: {
    setCurrency: (state, action) => {
      const code = action.payload?.toUpperCase();
      if (state.currencies[code]) {
        state.activeCurrency = code;
        if (typeof window !== 'undefined') {
          localStorage.setItem('playwise_currency', code);
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrencyRates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrencyRates.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.currencies) {
          state.currencies = action.payload.currencies;
        }
        if (action.payload?.disclaimer) {
          state.disclaimer = action.payload.disclaimer;
        }
      })
      .addCase(fetchCurrencyRates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setCurrency } = currencySlice.actions;

/**
 * Helper function to format USD prices into user's active currency
 * Returns an object with display label, raw value, and whether it's an estimate
 */
export const formatPriceEstimate = (usdPrice, activeCurrency = 'USD', currencies = DEFAULT_CURRENCIES) => {
  const numericUSD = typeof usdPrice === 'number' ? usdPrice : parseFloat(usdPrice);
  if (isNaN(numericUSD)) {
    return {
      formatted: 'N/A',
      usdDisplay: '$0.00',
      isEstimate: false,
      symbol: '$',
    };
  }

  // Free games
  if (numericUSD === 0) {
    return {
      formatted: 'FREE',
      usdDisplay: '$0.00',
      isEstimate: false,
      symbol: '$',
    };
  }

  const curr = currencies[activeCurrency] || currencies.USD || { symbol: '$', rate: 1.0 };
  const rate = curr.rate || 1.0;
  const converted = numericUSD * rate;

  if (activeCurrency === 'USD') {
    return {
      formatted: `$${numericUSD.toFixed(2)}`,
      usdDisplay: `$${numericUSD.toFixed(2)}`,
      isEstimate: false,
      symbol: '$',
      raw: numericUSD,
    };
  }

  // Formatter for non-USD currencies
  let formattedNumber;
  if (activeCurrency === 'JPY') {
    formattedNumber = Math.round(converted).toLocaleString('en-US');
  } else if (activeCurrency === 'INR') {
    formattedNumber = converted.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  } else {
    formattedNumber = converted.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  return {
    formatted: `Est. ${curr.symbol}${formattedNumber}`,
    usdDisplay: `$${numericUSD.toFixed(2)}`,
    isEstimate: true,
    symbol: curr.symbol,
    raw: converted,
  };
};

export default currencySlice.reducer;
