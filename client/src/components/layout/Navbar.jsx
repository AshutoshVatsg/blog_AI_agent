import { Link, useNavigate, useLocation } from 'react-router-dom';
import { HiOutlinePencilSquare, HiOutlineChartBar } from 'react-icons/hi2';
import useAuth from '../../hooks/useAuth';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate('/'); };
  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">✦ TrustBlog</Link>
      <div className="navbar-links">
        <Link to="/" className={isActive('/')}>Home</Link>
        {user && <Link to="/create" className={isActive('/create')}><HiOutlinePencilSquare /> Write</Link>}
        {user && <Link to="/dashboard" className={isActive('/dashboard')}><HiOutlineChartBar /> Dashboard</Link>}
        {user?.role === 'admin' && <Link to="/admin" className={isActive('/admin')}>Admin</Link>}
      </div>
      <div className="nav-user">
        {user ? (
          <>
            <Link to={`/profile/${user._id}`} className="nav-avatar">{user.name?.[0]?.toUpperCase()}</Link>
            <button className="btn btn-white btn-sm" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-white btn-sm">Sign In</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
};
export default Navbar;
