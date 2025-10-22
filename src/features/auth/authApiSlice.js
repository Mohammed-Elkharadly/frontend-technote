// Import the shared API slice that was created with createApi.
// All endpoints are injected into this central API definition for consistency.
import { apiSlice } from '../../app/api/apiSlice';
import { setCredentials } from './authSlice';

// Import the logOut action creator from our authSlice.
// This action will be dispatched to clear the authentication token from the Redux store.
import { logOut } from './authSlice';

// Inject authentication-related endpoints into the core API slice.
// This is a pattern for code-splitting a large API definition across multiple files.
export const authApiSlice = apiSlice.injectEndpoints({
  // `endpoints` is a function that receives a `builder` object.
  endpoints: (builder) => ({
    // Defines a `login` endpoint as a mutation (for state-changing actions).
    login: builder.mutation({
      // `query` is a function that accepts credentials and returns the API request details.
      query: (credentials) => ({
        url: '/auth', // The endpoint URL for the login request.
        method: 'POST', // The HTTP method for the request.
        body: { ...credentials }, // The request body, which includes the user's credentials.
      }),
    }),

    // Defines a `sendLogout` endpoint, also a mutation.
    sendLogout: builder.mutation({
      // `query` for this endpoint makes a POST request to the logout URL.
      query: () => ({
        url: '/auth/logout', // The endpoint URL for logging out.
        method: 'POST', // The HTTP method for the request.
      }),

      // `onQueryStarted` is a lifecycle hook that runs when the mutation begins.
      // This is the perfect place to handle side effects like state cleanup.
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          // `await queryFulfilled` waits for the API request to successfully complete.
          const { data } = await queryFulfilled;
          // Log the response from the server for debugging.
          console.log(data);

          // Dispatch the `logOut` action to clear the token in our auth slice.
          dispatch(logOut());

          // Dispatch the utility action `resetApiState` to clear RTK Query's entire cache.
          // This is a crucial step to remove all user-specific data from the cache upon logout.
          // fix 48 line with setTimeout to avoid clean the cache before the logOut action is processed
          setTimeout(() => {
            dispatch(apiSlice.util.resetApiState());
          }, 1000);
        } catch (err) {
          // Log any errors that occur during the logout process.
          console.log(err);
        }
      },
    }),

    // Defines a `refresh` endpoint as a mutation.
    // This is used by the `baseQueryWithReAuth` to get a new access token.
    refresh: builder.mutation({
      query: () => ({
        url: '/auth/refresh', // The endpoint URL for refreshing the token.
        method: 'GET', // The HTTP method for the refresh token request.
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          console.log(data);
          const { accessToken } = data;
          // Dispatch the `setCredentials` action to update the token in our auth slice.
          dispatch(setCredentials({ accessToken }));
        } catch (error) {
          console.error(error);
        }
      },
    }),
  }),
});

// RTK Query automatically generates React hooks for each endpoint.
// We export these hooks so components can easily interact with the API endpoints.
export const { useLoginMutation, useSendLogoutMutation, useRefreshMutation } =
  authApiSlice;
