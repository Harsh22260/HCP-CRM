import { useState, useEffect } from 'react'
import { apiClient } from '../api/client'

export default function ProductsPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState('by_product')

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await apiClient.get('/api/interactions/samples/summary')
      setData(res.data)
    } catch (err) {
      console.error('Failed to load sample data', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  if (loading || !data) {
    return (
      <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
        <span className="spinner" style={{ marginRight: 8 }} /> Loading sample inventory...
      </div>
    )
  }

  const { by_product, by_doctor, total_products_tracked } = data
  const totalUnits = by_product.reduce((s, p) => s + p.total_qty, 0)

  return (
    <div className="main-content">
      <div className="top-bar">
        <div className="top-bar-left">
          <div className="breadcrumb">
            <span>Product Suite</span><span style={{ margin: '0 4px' }}>/</span>
            <span className="bc-current">Sample Inventory Tracker</span>
          </div>
        </div>
        <div className="top-bar-right">
          <button className="btn btn-primary btn-sm" onClick={fetchData}>🔄 Refresh</button>
        </div>
      </div>

      <div className="form-panel" style={{ width: '100%', maxWidth: '100%', padding: '24px' }}>
        <div className="form-panel-header" style={{ marginBottom: 20 }}>
          <h2>💊 Sample Distribution Tracker</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>
            Aggregated view of all samples distributed across doctors and products.
          </p>
        </div>

        {/* Summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
          <div style={{ background: 'var(--bg)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius)', padding: 18 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Products Tracked</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--primary)', marginTop: 8 }}>💊 {total_products_tracked}</div>
          </div>
          <div style={{ background: 'var(--bg)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius)', padding: 18 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Total Units Given</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--success)', marginTop: 8 }}>🧪 {totalUnits}</div>
          </div>
          <div style={{ background: 'var(--bg)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius)', padding: 18 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Doctors Reached</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--warning)', marginTop: 8 }}>👥 {by_doctor.length}</div>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--bg)', padding: 4, borderRadius: 'var(--radius)', width: 'fit-content', border: '1px solid var(--border-light)' }}>
          {[['by_product', '💊 By Product'], ['by_doctor', '👤 By Doctor']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{ padding: '6px 16px', fontSize: 12, fontWeight: 600, borderRadius: 'var(--radius-xs)', background: tab === key ? 'var(--primary)' : 'transparent', color: tab === key ? 'white' : 'var(--text-secondary)', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>
              {label}
            </button>
          ))}
        </div>

        {/* By Product Table */}
        {tab === 'by_product' && (
          by_product.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              🧪 No samples distributed yet. Log an interaction with samples to see data here.
            </div>
          ) : (
            <div style={{ overflowX: 'auto', background: 'var(--bg)', borderRadius: 'var(--radius)', border: '1px solid var(--border-light)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.5)' }}>
                    {['Product Name', 'Total Units Given', 'Doctors Reached', 'Distributed To'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {by_product.map((prod, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border-light)', background: 'var(--card-bg)' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text)' }}>💊 {prod.product}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ background: 'var(--primary-ghost)', color: 'var(--primary)', fontSize: 13, fontWeight: 700, padding: '3px 10px', borderRadius: 99 }}>{prod.total_qty} units</span>
                      </td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>👥 {prod.doctor_count}</td>
                      <td style={{ padding: '14px 16px', fontSize: 12, color: 'var(--text-muted)' }}>{prod.doctors.join(', ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {/* By Doctor Table */}
        {tab === 'by_doctor' && (
          by_doctor.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              No samples distributed to doctors yet.
            </div>
          ) : (
            <div style={{ overflowX: 'auto', background: 'var(--bg)', borderRadius: 'var(--radius)', border: '1px solid var(--border-light)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.5)' }}>
                    {['Doctor Name', 'Products Received', 'Units Breakdown'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {by_doctor.map((doc, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border-light)', background: 'var(--card-bg)' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text)' }}>👤 {doc.hcp_name}</td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{doc.samples.length} product(s)</td>
                      <td style={{ padding: '14px 16px', fontSize: 12, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {doc.samples.map((s, j) => (
                          <span key={j} style={{ background: 'var(--primary-ghost)', color: 'var(--primary)', padding: '2px 8px', borderRadius: 99, fontWeight: 600 }}>
                            {s.product}: {s.qty}
                          </span>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  )
}
