// Import the createSlice utility from Redux Toolkit.
// This function helps simplify the process of defining reducers,
// actions, and initial state all in one place.
import { createSlice } from '@reduxjs/toolkit';

// Create a new slice for authentication state using `createSlice`.
// It takes an object of options as its argument.
const authSlice = createSlice({
  // `name`: This is a string name for the slice.
  // It is used as a prefix for the generated action types (e.g., 'auth/setCredentials').
  name: 'auth',

  // `initialState`: The initial state for this slice of the store.
  // Here, the authentication token is initially null, meaning no user is logged in.
  initialState: { token: null },

  // `reducers`: An object where each key is a reducer function that handles a specific action.
  // `createSlice` automatically generates action creators with the same names.
  reducers: {
    // `setCredentials`: A reducer function to handle setting user credentials upon login.
    // It receives the current state and the action object.
    setCredentials: (state, action) => {
      // Destructure the `accessToken` from `action.payload`.
      const { accessToken } = action.payload;
      // Use Immer (built into Redux Toolkit) to safely "mutate" the state.
      // This looks like direct mutation but is handled immutably behind the scenes.
      state.token = accessToken;
    },

    // `logOut`: A reducer function to handle user log out.
    // It resets the token to null, effectively clearing the user's session.
    logOut: (state, action) => {
      state.token = null;
    },
  },
});

// Destructure and export the generated action creators from `authSlice.actions`.
// These functions (`setCredentials()` and `logOut()`) are called by components
// to dispatch actions that update the state.
export const { setCredentials, logOut } = authSlice.actions;

// Export the reducer function for this slice as the default export.
// This reducer will be added to the Redux store's root reducer.
export default authSlice.reducer;

// Create and export a "selector" function.
// A selector is a simple function used to retrieve specific data from the Redux state.
// This selector returns the current authentication token from the state.
export const selectCurrentToken = (state) => state.auth.token;
