// Import the core utility for configuring the Redux store from Redux Toolkit.
import { configureStore } from '@reduxjs/toolkit';
// Import the base API slice definition created by createApi.
import { apiSlice } from './api/apiSlice';
// Import the utility to set up event listeners for RTK Query.
import { setupListeners } from '@reduxjs/toolkit/query';
// Import the authentication slice reducer to manage user authentication state.
import authReducer from '../features/auth/authSlice';

// Create and export the Redux store using configureStore.
// This function automatically sets up a robust store with good default settings.
export const store = configureStore({
  // The `reducer` option defines the root reducer for the store.
  // It takes an object where each key corresponds to a slice of the state.
  reducer: {
    // [apiSlice.reducerPath]: This dynamically adds the RTK Query reducer
    // under its designated path (e.g., 'api'). It manages all API fetching and caching logic.
    [apiSlice.reducerPath]: apiSlice.reducer,
    // auth: This adds the reducer from the authSlice to manage authentication state
    // like the user's token.
    auth: authReducer,
  },
  // `middleware` is a function that customizes the store's middleware stack.
  middleware: (getDefaultMiddleware) =>
    // `getDefaultMiddleware()` includes useful standard middleware,
    // such as redux-thunk and checks for mutations.
    getDefaultMiddleware()
      // `concat(apiSlice.middleware)` adds the RTK Query-specific middleware.
      // This enables features like caching, invalidation, and polling.
      .concat(apiSlice.middleware),
  // `devTools: true` enables the Redux DevTools Extension,
  // providing a powerful browser tool for debugging state changes.
  devTools: false,
});

// `setupListeners` sets up event handlers for refetching data automatically.
// It listens for browser events like window focus and network reconnection.
// It is called with the store's `dispatch` method to enable this behavior.
setupListeners(store.dispatch);
