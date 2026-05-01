import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';

export default function AppLayout({ children, title }) {
  const { isAdmin } = useAuth();

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content content-with-sidebar">
        <header className="topbar">
          <div>
            <h2 className="topbar-title">{title}</h2>
          </div>
          <div className="topbar-right">
            {isAdmin && (
              <span className="badge badge-admin">👑 Admin</span>
            )}
          </div>
        </header>
        <main className="page">
          {children}
        </main>
      </div>
    </div>
  );
}
