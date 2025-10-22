import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

import { useGetUsersQuery } from './usersApiSlice';
import { memo } from 'react';

const User = ({ userId }) => {
  // The state parameter represents the entire Redux store state,
  // which is a single JavaScript object containing all the data
  // managed by your Redux store. The useSelector hook (from react-redux)
  // allows you to extract specific data from this state, and the selectUserById
  // selector function retrieves a specific user from the state based on the provided userId

  // (selectFromResult) allows you to get a specific
  // segment from a query result in a performant manner.
  // When using this feature, the component will not
  // rerender unless the underlying data of the selected
  // item has changed. If the selected item is one
  // element in a larger collection, it will disregard
  // changes to elements in the same collection.
  const { user } = useGetUsersQuery('usersList', {
    selectFromResult: ({ data }) => ({
      user: data?.entities[userId],
    }),
  });

  const navigate = useNavigate();

  if (user) {
    const handleEdit = () => navigate(`/dash/users/${userId}`);
    const userRoleString = user.roles.toString().replaceAll(',', ', ');
    const cellStatus = user.active ? '' : 'table_cell--inactive';

    return (
      <tr className="table__row user">
        <td className={`table__cell ${cellStatus}`}>{user.username}</td>
        <td className={`table__cell ${cellStatus}`}>{userRoleString}</td>
        <td className={`table__cell ${cellStatus}`}>
          <button className="icon-button table__button" onClick={handleEdit}>
            <FontAwesomeIcon icon={faPenToSquare} />
          </button>
        </td>
      </tr>
    );
  } else return null;
};

const memoizedUser = memo(User);

export default memoizedUser;
