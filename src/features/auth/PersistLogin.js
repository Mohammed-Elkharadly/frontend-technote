import { Outlet, Link } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { useRefreshMutation } from './authApiSlice';
import { useSelector } from 'react-redux';
import { selectCurrentToken } from './authSlice';
import usePersist from '../../hooks/usePersist'; // Custom hook for persistent state
import PulseLoader from 'react-spinners/PulseLoader';


/**
 * A layout component that handles refreshing the auth token and provides persistent login functionality.
 * This component acts as a protective layer, ensuring that routes nested within it are only accessible
 * if the user is authenticated (or a refresh attempt is pending).
 */
const PersistLogin = () => {
  // Check if the user has opted for persistent login, retrieving the value from localStorage
  const [persist] = usePersist();
  // Get the current token from the Redux store
  const token = useSelector(selectCurrentToken);
  // Using useRef to track if the useEffect has run once, preventing multiple calls in development
  const effectRan = useRef(false);

  // State to track if the refresh token was successfully verified
  const [trueSuccess, setTrueSuccess] = useState(false);

  // RTK Query mutation hook for refreshing the access token.
  // isUninitialized: Has not been called yet.
  // isLoading: Request is in progress.
  // isSuccess: Request was successful.
  // isError: Request failed.
  // error: The error object from a failed request.
  const [refresh, { isUninitialized, isLoading, isSuccess, isError, error }] =
    useRefreshMutation();

  /**
   * useEffect to verify the refresh token. This effect runs once on component mount.
   * It is responsible for making the initial request to get a new access token if needed.
   * The effectRan.current check and environment variable prevent this from running twice in React's strict mode.
   */
  useEffect(() => {
    // This condition ensures the effect runs only once in strict mode and not in production
    if (effectRan.current === true || process.env.NODE_ENV !== 'development') {
      const verifyRefreshToken = async () => {
        console.log('verifying refresh token');
        try {
          // Attempt to refresh the token
          await refresh();
          // If successful, set the trueSuccess flag to enable access to protected routes
          setTrueSuccess(true);
        } catch (err) {
          console.error(err);
        }
      };
      // Only run the verification if there is no current token but the user has enabled persistent login
      if (!token && persist) verifyRefreshToken();
    }
    // Cleanup function to set effectRan to true after the first run
    return () => (effectRan.current = true);
    // Suppress linting for the empty dependency array. This hook is intentionally designed
    // to run only once on mount to avoid infinite loops during token refresh.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Content to be rendered based on the authentication and refresh status
  let content;

  // Case 1: Persistent login is not enabled
  if (!persist) {
    console.log('no persist');
    // Render the nested routes directly, as token persistence is not expected
    content = <Outlet />;
    // Case 2: Currently loading (waiting for the refresh token request)
  } else if (isLoading) {
    console.log('loading');
    content = <PulseLoader color={'#FFF'} />;
    // Case 3: Error occurred during the token refresh request
  } else if (isError) {
    console.log('error');
    content = (
      <p>
        {/* Display the error message from the API */}
        {error?.data?.message}
        {/* Provide a link for the user to manually log in again */}
        <Link to="/login"> Please login again</Link>
      </p>
    );
    // Case 4: Refresh request was successful and the trueSuccess flag is set
  } else if (isSuccess && trueSuccess) {
    console.log('success');
    // Allow access to the nested routes
    content = <Outlet />;
    // Case 5: A token exists but the refresh request has not yet been initiated
  } else if (token && isUninitialized) {
    console.log('token and uninit');
    // Allow immediate access, as a valid token is already present
    content = <Outlet />;
  }

  return content;
};

export default PersistLogin;
