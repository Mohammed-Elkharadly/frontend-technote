import { Outlet } from 'react-router-dom';
// Renders the matching child route of a parent route or nothing if no child route matches.
const Layout = () => {
  return <Outlet />;
};

export default Layout;
