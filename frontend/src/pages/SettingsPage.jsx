import { useState } from 'react'

export default function SettingsPage() {
  // Load KPI targets from localStorage
  const [targets, setTargets] = useState(() => {
    try { return JSON.parse(localStorage.getItem('kpi_targets') || '{}') } catch { return {} }
  })
  const [saved, setSaved] = useState(false)

  const handleTargetChange = (key, val) => {
    setTargets(prev => ({ ...prev, [key]: val }))
  }

  const handleSave = () => {
    localStorage.setItem('kpi_targets', JSON.stringify(targets))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="main-content">
      <div className="top-bar">
        <div className="top-bar-left">
          <div className="breadcrumb">
            <span>Control Panel</span><span style={{ margin: '0 4px' }}>/</span>
            <span className="bc-current">Settings</span>
          </div>
        </div>
      </div>

      <div className="form-panel" style={{ width: '100%', maxWidth: '100%', padding: '24px' }}>
        <div className="form-panel-header" style={{ marginBottom: 20 }}>
          <h2>Representative &amp; System Settings</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>
            Configure CRM variables, user details, KPI targets and notification channels.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {/* ── Rep Profile ── */}
          <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>👤 Representative Profile</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <div className="field">
                <label className="field-label">Representative Name</label>
                <input defaultValue="Harsh" disabled />
              </div>
              <div className="field">
                <label className="field-label">Territory Region</label>
                <input defaultValue="North West Division" disabled />
              </div>
            </div>
          </div>

          {/* ── KPI Targets ── */}
          <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>📊 Monthly KPI Targets</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 16 }}>
              These targets appear on the Analytics Dashboard as progress bars.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <div className="field">
                <label className="field-label">Monthly Visit Target</label>
                <input
                  type="number"
                  min="1"
                  max="200"
                  value={targets.monthly_visits || 20}
                  onChange={e => handleTargetChange('monthly_visits', e.target.value)}
                  placeholder="e.g. 20"
                />
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Visits per month goal</div>
              </div>
              <div className="field">
                <label className="field-label">Positive Sentiment Target (%)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={targets.positive_pct || 70}
                  onChange={e => handleTargetChange('positive_pct', e.target.value)}
                  placeholder="e.g. 70"
                />
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>% of visits with positive sentiment</div>
              </div>
            </div>
          </div>

          {/* ── AI Settings ── */}
          <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>🤖 AI Agent Assistant (Sage)</h3>
            <div className="field" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="toggle-switch active" style={{ cursor: 'default' }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Enable Conversational Auto-Filling</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Sage extracts entities from notes and auto-logs visits, creates doctor profiles, and drafts follow-ups.</div>
              </div>
            </div>
          </div>

          {/* ── Notifications ── */}
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>🔔 Notification Alerts</h3>
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

        {/* Save */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border-light)' }}>
          <button className="btn btn-primary" onClick={handleSave}>
            {saved ? '✅ Saved!' : '💾 Save Configurations'}
          </button>
        </div>
      </div>
    </div>
  )
}
