import { useRef, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from './authSlice';
import { useLoginMutation } from './authApiSlice';
import PulseLoader from 'react-spinners/PulseLoader';

import usePersist from '../../hooks/usePersist';

const Login = () => {
  const userRef = useRef();
  const errRef = useRef();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errMsg, setErrMsg] = useState('');

  const [persist, setPersist] = usePersist();

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [login, { isLoading }] = useLoginMutation();

  const errClass = errMsg ? 'errmsg' : 'offscreen';

  useEffect(() => {
    userRef.current.focus();
  }, []);

  useEffect(() => {
    setErrMsg(''); // setErrMsg to empty '' while user is typing
  }, [username, password]);

  const handleUserInput = (e) => setUsername(e.target.value);
  const handlePasswordInput = (e) => setPassword(e.target.value);
  const handleToggle = () => setPersist((prev) => !prev);
  // Define an asynchronous function to handle the login form submission.
  // `e` is the event object, representing the form submission event.
  const handleSubmit = async (e) => {
    // Prevent the default browser behavior of refreshing the page on form submission.
    e.preventDefault();
    try {
      // Call the `login` mutation hook with the username and password.
      // `.unwrap()` handles the promise, returning the payload if successful or throwing an error if not.
      // The payload is destructured to get the `accessToken` from the server's response.
      const { accessToken } = await login({ username, password }).unwrap();

      // Dispatch the `setCredentials` action to save the new accessToken in the Redux store.
      dispatch(setCredentials({ accessToken }));

      // Clear the username input field for the next use.
      setUsername('');
      // Clear the password input field for the next use.
      setPassword('');

      // Navigate the user to the dashboard page upon successful login.
      navigate('/dash');
    } catch (error) {
      // Catch any errors thrown by the login mutation or other parts of the `try` block.
      // Use a series of `if/else if` statements to provide specific error messages based on the API response status.
      if (!error.status) {
        // If there's no status, it indicates a network error (server is down).
        setErrMsg('No server response');
      } else if (error.status === 400) {
        // Handle a 400 Bad Request status, which usually means invalid input.
        setErrMsg('Missing username or password');
      } else if (error.status === 401) {
        // Handle a 401 Unauthorized status, which indicates incorrect credentials.
        setErrMsg('Unauthorized');
      } else {
        // For all other errors, display the specific message from the server's response data.
        setErrMsg(error?.data?.message);
      }

      // If there's an error reference (`errRef`), focus on that element.
      // This is often used for accessibility, to direct the user's attention to the error message.
      if (errRef.current) {
        errRef.current.focus();
      }
    }
  };

  if (isLoading) return <PulseLoader color={'#FFF'} />;

  const content = (
    <section className="public">
      <header>
        <h1>Employee Login</h1>
      </header>
      <main className="login">
        <p className={errClass} ref={errRef} aria-live="assertive">
          {errMsg}
        </p>
        <form className="form" onSubmit={handleSubmit}>
          <label htmlFor="username">Username:</label>
          <input
            className="form__input"
            type="text"
            id="username"
            ref={userRef}
            value={username}
            onChange={handleUserInput}
            autoComplete="off"
            required
          />
          <label htmlFor="password">Password:</label>
          <input
            className="form__input"
            type="password"
            id="password"
            value={password}
            onChange={handlePasswordInput}
            autoComplete="off"
            required
          />
          <button type="submit" className="form__submit-button">
            Login
          </button>
          <label htmlFor="persist" className='form__persist'>
            <input
              type="checkbox"
              className="form__checkbox"
              id="persist"
              onChange={handleToggle}
              checked={persist}
            />
            Trust This Device
          </label>
        </form>
      </main>
      <footer>
        <Link to="/">Back to Home</Link>
      </footer>
    </section>
  );

  return content;
};

export default Login;
