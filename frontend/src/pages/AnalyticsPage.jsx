export default function AnalyticsPage() {
  return (
    <div className="main-content">
      {/* Top bar */}
      <div className="top-bar">
        <div className="top-bar-left">
          <div className="breadcrumb">
            <span>HCP Suite</span>
            <span style={{ margin: '0 4px' }}>/</span>
            <span className="bc-current">Analytics Dashboard</span>
          </div>
        </div>
        <div className="top-bar-right">
          <button className="btn btn-secondary btn-sm" style={{ marginRight: 8 }}>📅 Custom Range</button>
          <button className="btn btn-primary btn-sm">📥 Download PDF Report</button>
        </div>
      </div>

      <div className="form-panel" style={{ width: '100%', maxWidth: '100%', padding: '24px' }}>
        <div className="form-panel-header" style={{ marginBottom: 24 }}>
          <h2>Interaction Analytics & KPIs</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>
            Monitor doctor response rates, product interests, and field performance.
          </p>
        </div>

        {/* Metric Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
          <div style={{ background: 'var(--bg)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius)', padding: 18 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Total Visits</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text)', marginTop: 8 }}>48</div>
            <div style={{ fontSize: 11, color: 'var(--success)', marginTop: 6, fontWeight: 500 }}>📈 +12% vs last month</div>
          </div>
          <div style={{ background: 'var(--bg)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius)', padding: 18 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Positive Sentiment</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--success)', marginTop: 8 }}>82%</div>
            <div style={{ fontSize: 11, color: 'var(--success)', marginTop: 6, fontWeight: 500 }}>😊 Highly favorable feedback</div>
          </div>
          <div style={{ background: 'var(--bg)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius)', padding: 18 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Pending Follow-ups</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--warning)', marginTop: 8 }}>7</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>🔔 Requires representative action</div>
          </div>
          <div style={{ background: 'var(--bg)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius)', padding: 18 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Samples Dispatched</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--primary)', marginTop: 8 }}>134</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>💉 Units distributed</div>
          </div>
        </div>

        {/* Detailed Sections */}
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          {/* Sentiment Breakdown Chart */}
          <div style={{ flex: 1, minWidth: 320, background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20 }}>
            <h3 style={{ fontSize: 14, marginBottom: 16 }}>Sentiment Distribution</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span>Positive</span>
                  <strong>82%</strong>
                </div>
                <div style={{ height: 8, background: '#E2E8F0', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: '82%', height: '100%', background: 'var(--success)' }}></div>
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span>Neutral</span>
                  <strong>12%</strong>
                </div>
                <div style={{ height: 8, background: '#E2E8F0', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: '12%', height: '100%', background: 'var(--text-muted)' }}></div>
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span>Negative</span>
                  <strong>6%</strong>
                </div>
                <div style={{ height: 8, background: '#E2E8F0', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: '6%', height: '100%', background: 'var(--danger)' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Top Discussed Products */}
          <div style={{ flex: 1, minWidth: 320, background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20 }}>
            <h3 style={{ fontSize: 14, marginBottom: 16 }}>Top Discussed Products</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--bg)', borderRadius: 'var(--radius-xs)' }}>
                <span>💊 Cardiavex 10mg</span>
                <span className="tool-badge" style={{ background: 'var(--primary-ghost)', color: 'var(--primary)' }}>22 mentions</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--bg)', borderRadius: 'var(--radius-xs)' }}>
                <span>💊 Lipicure 20mg</span>
                <span className="tool-badge" style={{ background: 'var(--primary-ghost)', color: 'var(--primary)' }}>15 mentions</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--bg)', borderRadius: 'var(--radius-xs)' }}>
                <span>💊 Prodo-X</span>
                <span className="tool-badge" style={{ background: 'var(--primary-ghost)', color: 'var(--primary)' }}>11 mentions</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
