import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Layout({ title, children, actions }) {
  const { user, logout } = useAuth();
  const isAgent = user?.role === 'agent';

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">Support Desk</div>
        {isAgent ? (
          <>
            <NavLink to="/agent" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Agent Dashboard
            </NavLink>
            <NavLink to="/agent/tickets" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              All Tickets
            </NavLink>
          </>
        ) : (
          <>
            <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              My Tickets
            </NavLink>
            <NavLink to="/tickets/new" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Create Ticket
            </NavLink>
          </>
        )}
        <button className="btn secondary" style={{ width: '100%', marginTop: 24 }} onClick={logout}>
          Logout
        </button>
      </aside>
      <main className="main">
        <div className="topbar">
          <div>
            <h1 style={{ margin: 0 }}>{title}</h1>
            <div className="muted">{user?.name} · {user?.role}</div>
          </div>
          <div className="row">{actions}</div>
        </div>
        {children}
      </main>
    </div>
  );
}
