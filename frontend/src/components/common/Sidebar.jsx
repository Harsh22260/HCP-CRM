import { NavLink } from 'react-router-dom'

export default function Sidebar() {
  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">⚕</div>
        <div className="sidebar-brand-text">
          <span className="brand-name">HCP CRM</span>
          <span className="brand-sub">Pharma Suite</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Main Menu</div>
        <NavLink 
          to="/log-interaction" 
          className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
        >
          <span className="item-icon">📝</span>
          <span>Log Interaction</span>
        </NavLink>
        <NavLink 
          to="/hcp-directory" 
          className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
        >
          <span className="item-icon">👤</span>
          <span>HCP Directory</span>
        </NavLink>
        <NavLink 
          to="/analytics" 
          className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
        >
          <span className="item-icon">📊</span>
          <span>Analytics</span>
        </NavLink>
        <NavLink 
          to="/follow-ups" 
          className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
        >
          <span className="item-icon">📅</span>
          <span>Follow-ups</span>
        </NavLink>

        <div className="sidebar-section-label">Management</div>
        <NavLink 
          to="/products" 
          className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
        >
          <span className="item-icon">💊</span>
          <span>Products</span>
        </NavLink>
        <NavLink 
          to="/reports" 
          className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
        >
          <span className="item-icon">📋</span>
          <span>Reports</span>
        </NavLink>
        <NavLink 
          to="/settings" 
          className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
        >
          <span className="item-icon">⚙️</span>
          <span>Settings</span>
        </NavLink>
      </nav>

      {/* Footer — user info */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">H</div>
          <div className="sidebar-user-info">
            <span className="user-name">Harsh</span>
            <span className="user-role">Field Representative</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
