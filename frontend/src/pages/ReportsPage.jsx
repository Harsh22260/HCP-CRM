const MOCK_EXPORTS = [
  { id: 1, name: 'HCP_Interactions_Q2_2026.csv', size: '24 KB', date: 'Yesterday at 4:32 PM', status: 'Completed' },
  { id: 2, name: 'Sample_Distribution_Audit_June.xlsx', size: '112 KB', date: 'June 30, 2026', status: 'Completed' },
  { id: 3, name: 'Doctor_Feedback_Sentiment_Summary.pdf', size: '1.2 MB', date: 'June 15, 2026', status: 'Archived' },
]

export default function ReportsPage() {
  return (
    <div className="main-content">
      {/* Top bar */}
      <div className="top-bar">
        <div className="top-bar-left">
          <div className="breadcrumb">
            <span>Management</span>
            <span style={{ margin: '0 4px' }}>/</span>
            <span className="bc-current">Reports & Exports</span>
          </div>
        </div>
      </div>

      <div className="form-panel" style={{ width: '100%', maxWidth: '100%', padding: '24px' }}>
        <div className="form-panel-header" style={{ marginBottom: 20 }}>
          <h2>Reports & Audit Logs</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>
            Export physician visit details, sample audits, and feedback summaries to excel or CSV.
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: 12, background: 'var(--bg)', padding: 16, borderRadius: 'var(--radius)', border: '1px solid var(--border-light)', marginBottom: 24, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label className="field-label" style={{ marginBottom: 6 }}>Export Scope</label>
            <select style={{ width: '100%', background: 'var(--card-bg)' }}>
              <option>All Interactions Log</option>
              <option>Samples Distribution Audit</option>
              <option>Pending Follow-ups Report</option>
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 140 }}>
            <label className="field-label" style={{ marginBottom: 6 }}>Format</label>
            <select style={{ width: '100%', background: 'var(--card-bg)' }}>
              <option>CSV Spreadsheet (.csv)</option>
              <option>Excel Worksheet (.xlsx)</option>
              <option>Acrobat Document (.pdf)</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button className="btn btn-primary" style={{ height: 38 }}>
              ⚙️ Generate Export
            </button>
          </div>
        </div>

        {/* History List */}
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Export History</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {MOCK_EXPORTS.map((exp) => (
              <div key={exp.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 20 }}>📁</span>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: 13 }}>{exp.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                      {exp.size} • Generated {exp.date}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span className="sentiment-badge positive" style={{ fontSize: 10 }}>
                    {exp.status}
                  </span>
                  <button className="btn btn-secondary btn-sm" style={{ padding: '6px 12px' }}>
                    ⬇️ Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
