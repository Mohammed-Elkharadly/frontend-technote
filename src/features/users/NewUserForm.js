import { useState, useEffect } from 'react';
import { useAddNewUserMutation } from './usersApiSlice';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave } from '@fortawesome/free-solid-svg-icons';
import { ROLES } from '../../config/roles';

const USER_REGEX = /^[A-z]{3,20}$/;
const PASS_REGEX = /^[A-z0-9!@#$%]{4,20}$/;

const NewUserForm = () => {
  const [addNewUser, { isLoading, isError, error, isSuccess }] =
    useAddNewUserMutation();

  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [validUsername, setValidUsername] = useState(false);
  const [password, setPassword] = useState('');
  const [validPassword, setValidPassword] = useState(false);
  const [roles, setRoles] = useState(['Employee']);

  useEffect(() => {
    setValidUsername(USER_REGEX.test(username));
  }, [username]); // while username is changing the useEffect is re-render

  useEffect(() => {
    setValidPassword(PASS_REGEX.test(password));
  }, [password]);

  useEffect(() => {
    if (isSuccess) {
      setUsername('');
      setPassword('');
      setRoles([]);
      navigate('/dash/users', { replace: true });
    }
  }, [isSuccess, navigate]);

  const onUsernameChange = (e) => setUsername(e.target.value);
  const onPasswordChange = (e) => setPassword(e.target.value);

  const onRolesChange = (e) => {
    const values = Array.from(
      e.target.selectedOptions, // HTML colection // Gets only selected options
      (option) => option.value // Extract the 'value' property of each option
    );
    setRoles(values);
  };

  const options = Object.values(ROLES).map((role) => {
    return (
      <option key={role} value={role}>
        {role}
      </option>
    );
  });

  const canSave =
    [roles.length, validUsername, validPassword].every(Boolean) && !isLoading;

  const onSaveUserClicked = async (e) => {
    e.preventDefault();
    if (canSave) {
      await addNewUser({ username, password, roles });
    }
  };

  const errClass = isError ? 'errmsg' : 'offscreen';
  const validUserClass = !validUsername ? 'form__input--incomplete' : '';
  const validPassClass = !validPassword ? 'form__input--incomplete' : '';
  const validRRolesClass = !Boolean(roles.length)
    ? 'form__input--incomplete'
    : '';

  const content = (
    <>
      <p className={errClass}>{error?.data?.message}</p>
      <form className="form" onSubmit={onSaveUserClicked}>
        <div className="form__title-row">
          <h2>New User</h2>
          <div className="form__action-buttons">
            <button className="icon-button" title="save" disabled={!canSave}>
              <FontAwesomeIcon icon={faSave} />
            </button>
          </div>
        </div>

        <label className="form__label" htmlFor="username">
          Username: <span className="nowrap">[3-20 letters]</span>
        </label>
        <input
          type="text"
          className={`form__input ${validUserClass}`}
          id="username"
          name="username"
          autoComplete="off"
          value={username}
          onChange={onUsernameChange}
        />

        <label className="form__label" htmlFor="password">
          Password: <span className="nowrap">[4-12 chars incl. !@#$%]</span>
        </label>
        <input
          type="password"
          className={`form__input ${validPassClass}`}
          id="password"
          name="password"
          autoComplete="off"
          value={password}
          onChange={onPasswordChange}
        />

        <label className="form__label" htmlFor="roles">
          Assigned Roles:
        </label>
        <select
          name="roles"
          id="roles"
          className={`form__select ${validRRolesClass}`}
          multiple={true} // allow multiple select
          size="3"
          value={roles}
          onChange={onRolesChange}
        >
          {options}
        </select>
      </form>
    </>
  );

  return content;
};

export default NewUserForm;
