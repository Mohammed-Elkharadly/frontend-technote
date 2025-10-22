import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Public from './components/Public';
import Login from './features/auth/Login';
import DashLayout from './components/DashLayout';
import Welcome from './features/auth/Welcome';
import NoteList from './features/notes/NoteList';
import UsersList from './features/users/UsersList';
import EditUser from './features/users/EditUser';
import NewUserForm from './features/users/NewUserForm';
import EditNote from './features/notes/EditNote';
import NewNote from './features/notes/NewNote';
import Prefetch from './features/auth/Prefetch';
import PersistLogin from './features/auth/PersistLogin';
import RequiredAuth from './features/auth/RequiredAuth';
import { ROLES } from './config/roles';
import useTitle from './hooks/useTitle';

/**
 * The main application component that defines the overall routing structure.
 * This component uses React Router's <Routes> and <Route> components to map URLs to specific UI components.
 */
function App() {
  useTitle('Dan D. Repairs!');
  return (
    <Routes>
      {/* The top-level route uses a common layout for all pages */}
      <Route path="/" element={<Layout />}>
        {/* === Public Routes === */}
        {/* The index route corresponds to the homepage "/" */}
        <Route index element={<Public />} />
        {/* The route for the login page */}
        <Route path="login" element={<Login />} />

        {/* === Protected Routes === */}
        {/* A parent route for all protected routes, handled by the PersistLogin component. */}
        {/* The PersistLogin component will check for a token and handle refreshing it before rendering its <Outlet>. */}
        <Route element={<PersistLogin />}>
          {/** This route requires authentication and specific roles */}
          <Route
            element={<RequiredAuth allowedRoles={[...Object.values(ROLES)]} />}
          >
            {/* Prefetching is enabled here, running before any dashboard route is accessed. */}
            {/* This ensures data is loaded in the background for efficiency. */}
            <Route element={<Prefetch />}>
              {/* The dashboard route, which uses a specific dashboard layout. */}
              <Route path="dash" element={<DashLayout />}>
                {/* The index route for the dashboard ("dash"). This will be rendered in DashLayout's <Outlet>. */}
                <Route index element={<Welcome />} />

                {/* Only users with the Admin or Manager role can access the user management routes. */}
                {/** Wrap the user management routes in a RequiredAuth component */}
                {/** to restrict access based on user roles. */}
                <Route
                  element={
                    <RequiredAuth allowedRoles={[ROLES.Admin, ROLES.Manager]} />
                  }
                >
                  {/* Nested routes for managing users */}
                  <Route path="users">
                    {/** default route for users */}
                    <Route index element={<UsersList />} />
                    {/* Dynamic route for editing a specific user, identified by an ':id' parameter */}
                    <Route path=":id" element={<EditUser />} />
                    <Route path="new" element={<NewUserForm />} />
                  </Route>
                </Route>

                {/* Nested routes for managing notes */}
                <Route path="notes">
                  {/** default route for notes */}
                  <Route index element={<NoteList />} />
                  {/* Dynamic route for editing a specific note, identified by an ':id' parameter */}
                  <Route path=":id" element={<EditNote />} />
                  <Route path="new" element={<NewNote />} />
                </Route>
              </Route>
            </Route>
          </Route>
        </Route>
      </Route>
      {/* Fallback route for any undefined paths, rendering a simple 404 message */}
      <Route path="*" element={<h1>There's nothing here: 404!</h1>} />
    </Routes>
  );
}

export default App;
