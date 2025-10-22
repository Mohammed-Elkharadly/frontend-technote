import { useGetUsersQuery } from './usersApiSlice';
import User from './User';
import PulseLoader from 'react-spinners/PulseLoader';


const UsersList = () => {
  const {
    data: users, // rename the returned data
    isLoading,
    isSuccess,
    isError,
    error,
  } = useGetUsersQuery('UsersList', {
    pollingInterval: 60000, // refetch data every 60 seconds
    refetchOnFocus: true, // refetch data when window gets focused
    refetchOnMountOrArgChange: true, // refetch data when component mounts or arg changes
  });

  let content;

  if (isLoading) {
    content = <PulseLoader color={'#FFF'} />;
  }

  if (isError) {
    content = <p className="errmsg">{error?.data?.message}</p>;
  }

  if (isSuccess) {
    const { ids } = users;

    // console.log(users); // result {ids: Array(2), entities: {…}}
    // console.log(ids); // result 68c4ba9b007aa1318ca6accd, 68c4baf1007aa1318ca6acd1

    const tableContent = ids?.length
      ? ids.map((userId) => <User key={userId} userId={userId} />)
      : null;

    content = (
      <table className="table table--users">
        <thead className="table__thead">
          <tr>
            <th scope="col" className="table__th user__username">
              Username
            </th>
            <th scope="col" className="table__th user__roles">
              Roles
            </th>
            <th scope="col" className="table__th user__edit">
              Edit
            </th>
          </tr>
        </thead>
        <tbody>{tableContent}</tbody>
      </table>
    );
  }

  return (
    <section>
      <h1>UsersList</h1>
      {content}
    </section>
  );
};

export default UsersList;
