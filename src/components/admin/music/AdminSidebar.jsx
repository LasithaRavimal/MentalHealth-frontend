import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { 
  MdDashboard,
  MdMusicNote,
  MdPeople,
  MdAnalytics
} from 'react-icons/md';

const AdminSidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { path: '/admin', icon: MdDashboard, label: 'Dashboard' },
    { path: '/admin/songs', icon: MdMusicNote, label: 'Song Management' },
    { path: '/admin/users', icon: MdPeople, label: 'User Management' },
    { path: '/admin/analytics', icon: MdAnalytics, label: 'Analytics' },
  ];

  return (
    <div className="w-64 bg-spotify-black border-r border-spotify-light-gray h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-spotify-light-gray">
        <h1 className="text-2xl font-bold text-white">
          <span className="text-spotify-green">M</span>_Track
        </h1>
        <p className="text-xs text-text-gray mt-1">Admin Panel</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-spotify-green text-white font-medium'
                    : 'text-white hover:bg-spotify-dark-gray'
                }`}
              >
                <item.icon className="text-2xl" />
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-spotify-light-gray mt-auto">
        <div className="flex items-center gap-3 mb-3 px-4 py-2 rounded-lg hover:bg-spotify-dark-gray cursor-pointer">
          {user?.profile_picture ? (
            <img
              src={user.profile_picture}
              alt={user.email}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-spotify-green flex items-center justify-center text-white font-semibold text-sm">
              {user?.email?.[0]?.toUpperCase() || 'A'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">
              {user?.email || 'Admin'}
            </div>
            <div className="text-xs text-text-gray">Admin</div>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full px-4 py-2 text-sm text-text-gray hover:text-white hover:bg-spotify-dark-gray rounded-lg transition-colors text-left"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;

