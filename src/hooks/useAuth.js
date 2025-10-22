import { useSelector } from 'react-redux';
import { selectCurrentToken } from '../features/auth/authSlice';
import { jwtDecode } from 'jwt-decode';

// Custom hook to access authentication state and user information.

const useAuth = () => {
  // Use a Redux selector to get the current token from the auth state.
  const token = useSelector(selectCurrentToken);

  // Initialize role flags and status with default values.
  let isManager = false;
  let isAdmin = false;
  let status = 'Employee'; // Default status for authenticated users

  // Check if a token exists in the Redux store.
  if (token) {
    // If a token is present, decode it to access the payload.
    // NOTE: This library only decodes the token; it does not verify its authenticity.
    const decoded = jwtDecode(token);

    // Destructure user information (username and roles) from the decoded payload.
    const { username, roles } = decoded.userInfo;

    // Determine user permissions by checking for specific roles.
    isManager = roles.includes('Manager');
    isAdmin = roles.includes('Admin');

    // Set the user's status based on their highest-level role.
    if (isManager) status = 'Manager';
    if (isAdmin) status = 'Admin';

    // Return the authenticated user's information.
    return { username, roles, isManager, isAdmin, status };
  }

  // If no token exists, the user is not authenticated.
  // Return default values representing an unauthenticated state.
  return { username: '', roles: [], isManager, isAdmin, status };
};

export default useAuth;
