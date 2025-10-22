import { useGetNotesQuery } from './notesApiSlice';
import Note from './Note';
import useAuth from '../../hooks/useAuth';
import PulseLoader from 'react-spinners/PulseLoader';


const NoteList = () => {
  // Destructure the return value of `useAuth`.
  const { username, isManager, isAdmin } = useAuth();

  // Destructure the return value of `useGetNotesQuery`.
  const {
    data: notes,
    isLoading,
    isSuccess,
    isError,
    error,
  } = useGetNotesQuery('NotesList', {
    // subscriptions is a way to keep the data in the cache fresh
    // it will automatically re-fetch the data when the component mounts
    // or when the user focuses the window
    // subscribe to the query and refresh the data every 15 seconds
    pollingInterval: 15000, // refetch data every 15 seconds
    refetchOnFocus: true, // refetch data when window gets focused
    refetchOnMountOrArgChange: true, // refetch data when component mounts or arg changes
  });

  let content;

  if (isLoading) content = <PulseLoader color={'#FFF'} />;

  if (isError) {
    content = <p className="errmsg">{error?.message} Unauthorized</p>;
  }

  if (isSuccess) {
    const { ids, entities } = notes;

    // filter notes based on user role
    let filteredIds;
    // check if user is a manager or admin
    if (isManager || isAdmin) {
      // if true, then show all notes
      filteredIds = [...ids];
    } else {
      // else show only notes that belong to the user
      filteredIds = ids.filter(
        (noteId) => entities[noteId].username === username
      );
    }

    // Now we have the filteredIds array that contains
    // only the notes that belong to the user
    const tableContent =
      ids?.length &&
      filteredIds.map((noteId) => <Note key={noteId} noteId={noteId} />);

    content = (
      <table className="table table--notes">
        <thead className="table__thead">
          <tr>
            <th scope="col" className="table__th note__status">
              Username
            </th>
            <th scope="col" className="table__th note__created">
              Created
            </th>
            <th scope="col" className="table__th note__updated">
              Updated
            </th>
            <th scope="col" className="table__th note__title">
              Title
            </th>
            <th scope="col" className="table__th note__username">
              Owner
            </th>
            <th scope="col" className="table__th note__edit">
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
      <h1>NotesList</h1>
      {content}
    </section>
  );
};

export default NoteList;
