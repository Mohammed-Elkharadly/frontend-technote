import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setCredentials } from '../../features/auth/authSlice';

const baseQuery = fetchBaseQuery({
  baseUrl: 'https://technotes-api.onrender.com',
  credentials: 'include', // Always include cookies with every request
  // prepareHeaders allows you to modify request headers before sending
  // getState() gives access to the entire Redux store state
  // headers represents the HTTP request headers
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token; // Get JWT token from auth slice
    if (token) {
      // If token exists, attach it as Authorization header
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers; // Must return updated headers object
  },
});

// This is a custom baseQuery function that adds automatic re-authentication logic.
// It wraps your standard baseQuery and is designed to handle expired access tokens gracefully.
const baseQueryWithReAuth = async (args, api, extraOptions) => {
  // Log the arguments to the console for debugging purposes.
  // `args` contains the details of the original API request (e.g., URL, method, body).
  console.log(args);

  // Log the API object to the console, which gives access to the Redux store's state and dispatcher.
  // It includes `signal` (for request cancellation), `dispatch`, and `getState()`.
  console.log(api);

  // Log any custom options passed for a specific endpoint to the console.
  console.log(extraOptions);

  // Execute the original API request using the standard `baseQuery` (e.g., fetchBaseQuery).
  // The result is stored in a `let` variable because it might be overwritten later.
  let result = await baseQuery(args, api, extraOptions);

  // This check handles cases where the initial request fails with a 403 status code.
  // 403 Forbidden often indicates an expired or invalid access token.
  if (result?.error?.status === 403) {
    // Log a message to indicate that the re-authentication process is starting.
    console.log('sending refresh token');

    // Make a new request to the server's refresh token endpoint.
    // The `baseQuery` is used again, this time with a hardcoded refresh URL.
    const refreshResult = await baseQuery('/auth/refresh', api, extraOptions);

    // Check if the refresh token request was successful (contains data).
    if (refreshResult?.data) {
      // If a new access token was received, dispatch an action to update the Redux store.
      // `setCredentials` stores the new token, making it available for future requests.
      api.dispatch(setCredentials({ ...refreshResult.data }));

      // Retry the original request using the newly obtained access token.
      // The `result` variable is updated with the outcome of this retried request.
      result = await baseQuery(args, api, extraOptions);
    } else {
      // This block executes if the refresh token request itself failed.
      // It handles the scenario where the user's refresh token has also expired.
      if (refreshResult?.error?.status === 403) {
        // If the refresh token request returns a 403, customize the error message.
        // This provides a more specific and helpful message to the user.
        refreshResult.error.data.message = 'your login has expired. ';
      }
      // Return the error from the failed refresh request.
      // This will cause the endpoint's promise to reject and the user might be logged out.
      return refreshResult;
    }
  }

  // Return the final result, either from the initial successful request,
  // or the successful retried request after re-authentication.
  return result;
};

export const apiSlice = createApi({
  baseQuery: baseQueryWithReAuth,
  tagTypes: ['Note', 'User'],
  endpoints: (builder) => ({}),
});
