import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { 
  LayoutDashboard, 
  FolderKanban, 
  CheckSquare, 
  Users, 
  LogOut,
  Rocket
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/dashboard',  icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
  { to: '/projects',   icon: <FolderKanban size={20} />,    label: 'Projects'  },
  { to: '/tasks',      icon: <CheckSquare size={20} />,     label: 'My Tasks'  },
];

const ADMIN_ITEMS = [
  { to: '/team',       icon: <Users size={20} />,           label: 'Team'      },
];

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Rocket size={24} color="#fff" />
        </div>
        <span className="sidebar-logo-text">TTM</span>
      </div>

      {/* Main Nav */}
      <span className="sidebar-section-label">Main Menu</span>
      {NAV_ITEMS.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
        >
          <span className="nav-icon">{item.icon}</span>
          {item.label}
        </NavLink>
      ))}

      {/* Admin Nav */}
      {isAdmin && (
        <>
          <span className="sidebar-section-label">Admin</span>
          {ADMIN_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </>
      )}

      {/* Footer */}
      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', marginBottom: '0.75rem', background: 'var(--bg-primary)', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <div
            className="avatar avatar-sm"
            style={{ 
              background: 'var(--accent-gradient)',
              boxShadow: '0 4px 10px rgba(245, 158, 11, 0.2)'
            }}
          >
            {user?.name?.[0]}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }} className="truncate">{user?.name}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--accent-orange)', fontWeight: 700, textTransform: 'uppercase' }}>{user?.role}</div>
          </div>
        </div>
        <button onClick={handleLogout} className="sidebar-nav-item" style={{ color: '#ef4444', width: '100%' }}>
          <span className="nav-icon"><LogOut size={18} /></span>
          Logout
        </button>
      </div>
    </aside>
  );
}
