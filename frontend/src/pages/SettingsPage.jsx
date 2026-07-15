export default function SettingsPage() {
  return (
    <div className="main-content">
      {/* Top bar */}
      <div className="top-bar">
        <div className="top-bar-left">
          <div className="breadcrumb">
            <span>Control Panel</span>
            <span style={{ margin: '0 4px' }}>/</span>
            <span className="bc-current">Settings</span>
          </div>
        </div>
      </div>

      <div className="form-panel" style={{ width: '100%', maxWidth: '100%', padding: '24px' }}>
        <div className="form-panel-header" style={{ marginBottom: 20 }}>
          <h2>Representative & System Settings</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>
            Configure CRM variables, user details, and notification channels.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Rep Profile */}
          <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Representative Profile</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <div className="field">
                <label className="field-label">Representative Name</label>
                <input defaultValue="Harsh R." disabled />
              </div>
              <div className="field">
                <label className="field-label">Territory Region</label>
                <input defaultValue="North West Division" disabled />
              </div>
            </div>
          </div>

          {/* AI Settings */}
          <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>AI Agent Assistant (Sage)</h3>
            <div className="field" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="toggle-switch active" style={{ cursor: 'default' }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Enable Conversational Auto-Filling</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Allows Sage to extract entities from doctor notes and auto-log visits in the CRM.</div>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Notification Alerts</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                <input type="checkbox" defaultChecked style={{ width: 'auto' }} />
                Email digests for upcoming follow-ups
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                <input type="checkbox" defaultChecked style={{ width: 'auto' }} />
                Browser push notifications for successful AI logs
              </label>
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border-light)' }}>
          <button className="btn btn-primary">
            💾 Save Configurations
          </button>
        </div>
      </div>
    </div>
  )
}
