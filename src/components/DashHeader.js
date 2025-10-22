// Import Font Awesome components and the specific icon for the logout button.
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faRightFromBracket,
  faFileCirclePlus,
  faFilePen,
  faUserGear,
  faUserPlus,
} from '@fortawesome/free-solid-svg-icons';
// Import navigation hooks and components from `react-router-dom`.
import { useNavigate, Link, useLocation } from 'react-router-dom';


import useAuth from '../hooks/useAuth';

// Import the specific RTK Query mutation hook for logging out.
import { useSendLogoutMutation } from '../features/auth/authApiSlice';

// Define regular expressions for different dashboard paths.
const DASH_REGEX = /^\/dash(\/)?$/;
const NOTES_REGEX = /^\/dash\/notes(\/)?$/;
const USERS_REGEX = /^\/dash\/users(\/)?$/;

const DashHeader = () => {
  // `useAuth` is a custom hook that provides authentication status.
  // It returns boolean values indicating if the user is a manager or admin.
  const { isManager, isAdmin } = useAuth();
  // `useNavigate` is used for programmatic navigation.
  const navigate = useNavigate();
  // `useLocation` provides information about the current URL, such as the pathname.
  const { pathname } = useLocation();


  // `useSendLogoutMutation` provides the mutation trigger (`sendLogout`)
  // and state properties like `isLoading`, `isSuccess`, and `isError`.
  const [sendLogout, { isLoading, isError, error }] = useSendLogoutMutation();

  const onNewNoteClicked = () => navigate('/dash/notes/new');
  const onNewUserClicked = () => navigate('/dash/users/new');
  const onNotesClicked = () => navigate('/dash/notes');
  const onUsersClicked = () => navigate('/dash/users');

  // Determine the CSS class for the header container based on the current path.
  // This makes the header appear smaller on certain pages for a different layout.
  let dashClass = null;
  if (
    !DASH_REGEX.test(pathname) &&
    !NOTES_REGEX.test(pathname) &&
    !USERS_REGEX.test(pathname)
  ) {
    dashClass = 'dash-header__container--small';
  }

  let newNoteButton = null;
  if (NOTES_REGEX.test(pathname)) {
    newNoteButton = (
      <button
        className="icon-button"
        title="New Note"
        onClick={onNewNoteClicked}
      >
        <FontAwesomeIcon icon={faFileCirclePlus} />
      </button>
    );
  }

  let newUserButton = null;
  if (USERS_REGEX.test(pathname)) {
    newUserButton = (
      <button
        className="icon-button"
        title="New User"
        onClick={onNewUserClicked}
      >
        <FontAwesomeIcon icon={faUserPlus} />
      </button>
    );
  }

  let userButton = null;
  if (isManager || isAdmin) {
    if (!USERS_REGEX.test(pathname) && pathname.includes('/dash')) {
      userButton = (
        <button className="icon-button" title="Users" onClick={onUsersClicked}>
          <FontAwesomeIcon icon={faUserGear} />
        </button>
      );
    }
  }

  let notesButton = null;
  if (!NOTES_REGEX.test(pathname) && pathname.includes('/dash')) {
    notesButton = (
      <button className="icon-button" title="Notes" onClick={onNotesClicked}>
        <FontAwesomeIcon icon={faFilePen} />
      </button>
    );
  }

  const logOutUser = async () => {
    try {
      // unwrap() returns a promise that either resolves with the actual payload or throws an error
      await sendLogout().unwrap();
      navigate('/', { replace: true });
    } catch (err) {
      console.log(err, 'logout failed');
    }
  };

  // The JSX for the logout button.
  const logOutBtn = (
    <button className="icon-button" title="logout" onClick={logOutUser}>
      <FontAwesomeIcon icon={faRightFromBracket} />
    </button>
  );

  const errClass = isError ? 'errmsg' : 'offscreen';

  let buttonContent;
  if (isLoading) {
    buttonContent = <p>Logging out</p>;
  } else {
    buttonContent = (
      <>
        {newNoteButton}
        {newUserButton}
        {userButton}
        {notesButton}
        {logOutBtn}
      </>
    );
  }

  // The main JSX content for the header component.
  const content = (
    <>
      <p className={errClass}>{error?.data?.message}</p>

      <header className="dash-header">
        <div className={`dash-header__container ${dashClass}`}>
          <Link to="/dash">
            <h1 className="dash-header__title">techNotes</h1>
          </Link>
          <nav className="dash-header__nav">{buttonContent}</nav>
        </div>
      </header>
    </>
  );
  return content;
};

export default DashHeader;
