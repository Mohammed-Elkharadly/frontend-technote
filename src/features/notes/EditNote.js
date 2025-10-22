import { useParams } from 'react-router-dom';
import EditNoteForm from './EditNoteForm';
import { useGetNotesQuery } from './notesApiSlice';
import { useGetUsersQuery } from '../users/usersApiSlice';
import useAuth from '../../hooks/useAuth';
import PulseLoader from 'react-spinners/PulseLoader';

const EditNote = () => {
  const { id } = useParams();
  const { isAdmin, isManager, username } = useAuth();

  // notesList is the cache key for notes
  const { note } = useGetNotesQuery('notesList', {
    // data is coming from useGetNotesQuery cache
    selectFromResult: ({ data }) => ({
      note: data?.entities[id],
    }),
  });

  // usersList is the cache key for users
  const { users } = useGetUsersQuery('usersList', {
    // data is coming from useGetUsersQuery cache
    selectFromResult: ({ data }) => ({
      // ids is an array of all user IDs
      users: data?.ids.map((id) => data?.entities[id]),
    }),
  });

  if (!note || !users.length) return <PulseLoader color={'#FFF'} />;

  if (!isAdmin && !isManager) {
    if (note.username !== username) {
      return (
        <p className="errmsg">You are not authorized to edit this note.</p>
      );
    }
  }

  const content = <EditNoteForm note={note} users={users} />;

  return content;
};

export default EditNote;
