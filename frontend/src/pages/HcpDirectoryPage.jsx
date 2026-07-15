import { useState, useEffect } from 'react'
import { apiClient } from '../api/client'

const SENTIMENT_COLORS = { positive: '#22C55E', neutral: '#94A3B8', negative: '#EF4444' }
const SENTIMENT_EMOJI  = { positive: '😊', neutral: '😐', negative: '😟' }

export default function HcpDirectoryPage() {
  const [hcps, setHcps] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newSpecialty, setNewSpecialty] = useState('')
  const [newHospital, setNewHospital] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [priorities, setPriorities] = useState({})

  // Timeline state
  const [openTimelineId, setOpenTimelineId] = useState(null)
  const [timeline, setTimeline] = useState([])
  const [timelineLoading, setTimelineLoading] = useState(false)

  const fetchHcps = async () => {
    setLoading(true)
    try {
      const res = await apiClient.get('/api/hcps/')
      setHcps(res.data)
      // Fetch priorities in parallel
      res.data.forEach(hcp => fetchPriority(hcp.id))
    } catch (err) {
      console.error('Failed to load HCPs', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchPriority = async (id) => {
    try {
      const res = await apiClient.get(`/api/hcps/${id}/priority`)
      setPriorities(prev => ({ ...prev, [id]: res.data }))
    } catch {}
  }

  const fetchTimeline = async (hcpId) => {
    if (openTimelineId === hcpId) { setOpenTimelineId(null); return }
    setOpenTimelineId(hcpId)
    setTimelineLoading(true)
    try {
      const res = await apiClient.get(`/api/hcps/${hcpId}/interactions`)
      setTimeline(res.data)
    } catch {
      setTimeline([])
    } finally {
      setTimelineLoading(false)
    }
  }

  useEffect(() => { fetchHcps() }, [])

  const handleCreateHcp = async (e) => {
    e.preventDefault()
    if (!newName.trim()) return
    setErrorMsg('')
    try {
      await apiClient.post('/api/hcps/', {
        name: newName.trim(),
        specialty: newSpecialty.trim() || 'General Practitioner',
        hospital: newHospital.trim() || 'General Hospital',
        email: newEmail.trim() || null,
        phone: newPhone.trim() || null,
      })
      setNewName(''); setNewSpecialty(''); setNewHospital(''); setNewEmail(''); setNewPhone('')
      setShowAddForm(false)
      fetchHcps()
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'HCP already exists or invalid data')
    }
  }

  const filteredHcps = hcps.filter(hcp =>
    hcp.name.toLowerCase().includes(search.toLowerCase()) ||
    (hcp.specialty && hcp.specialty.toLowerCase().includes(search.toLowerCase())) ||
    (hcp.hospital && hcp.hospital.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="main-content">
      <div className="top-bar">
        <div className="top-bar-left">
          <div className="breadcrumb">
            <span>HCP Module</span><span style={{ margin: '0 4px' }}>/</span>
            <span className="bc-current">HCP Directory</span>
          </div>
        </div>
        <div className="top-bar-right">
          <button className="btn btn-primary btn-sm" onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? '✕ Close' : '➕ Add New HCP'}
          </button>
        </div>
      </div>

      <div className="form-panel" style={{ width: '100%', maxWidth: '100%', padding: '24px' }}>
        <div className="form-panel-header" style={{ marginBottom: 20 }}>
          <h2>Healthcare Professionals Directory</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>
            Manage profiles, AI priority scores, and interaction timelines.
          </p>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <form onSubmit={handleCreateHcp} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 18, marginBottom: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Create New HCP Record</h3>
            {errorMsg && <div style={{ color: 'var(--danger)', fontSize: 12, marginBottom: 10 }}>⚠️ {errorMsg}</div>}
            <div className="form-row">
              <div className="field"><label className="field-label">Full Name *</label><input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Dr. Jane Doe" required /></div>
              <div className="field"><label className="field-label">Specialty</label><input value={newSpecialty} onChange={e => setNewSpecialty(e.target.value)} placeholder="Cardiologist" /></div>
            </div>
            <div className="form-row">
              <div className="field"><label className="field-label">Hospital/Clinic</label><input value={newHospital} onChange={e => setNewHospital(e.target.value)} placeholder="City Hospital" /></div>
            </div>
            <div className="form-row">
              <div className="field"><label className="field-label">Email</label><input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="jane.doe@email.com" /></div>
              <div className="field"><label className="field-label">Phone</label><input value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="+91 98765..." /></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary btn-sm">Save Profile</button>
            </div>
          </form>
        )}

        {/* Search */}
        <div style={{ marginBottom: 20 }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, specialty, or clinic..." style={{ width: '100%' }} />
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto', background: 'var(--bg)', borderRadius: 'var(--radius)', border: '1px solid var(--border-light)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 900 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.5)' }}>
                {['HCP Name', 'Specialty', 'Hospital/Clinic', 'Contact Info', 'Priority Score', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}><span className="spinner" style={{ display: 'inline-block', marginRight: 8 }} /> Loading...</td></tr>
              ) : filteredHcps.length === 0 ? (
                <tr><td colSpan="6" style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>No HCP profiles found.</td></tr>
              ) : (
                filteredHcps.map(hcp => {
                  const pri = priorities[hcp.id]
                  const isOpen = openTimelineId === hcp.id
                  return (
                    <>
                      <tr key={hcp.id} style={{ borderBottom: isOpen ? 'none' : '1px solid var(--border-light)', background: isOpen ? 'var(--primary-ghost)' : 'var(--card-bg)', cursor: 'default' }}>
                        <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text)' }}>👤 {hcp.name}</td>
                        <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{hcp.specialty || '—'}</td>
                        <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>🏥 {hcp.hospital || '—'}</td>
                        <td style={{ padding: '14px 16px', fontSize: 12 }}>
                          {hcp.email && <div>📧 {hcp.email}</div>}
                          {hcp.phone && <div style={{ color: 'var(--text-muted)', marginTop: 2 }}>📞 {hcp.phone}</div>}
                          {!hcp.email && !hcp.phone && <span style={{ color: 'var(--text-muted)' }}>No contact info</span>}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          {pri ? (
                            <span style={{ background: `${pri.color}20`, color: pri.color, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, border: `1px solid ${pri.color}40` }}>
                              {pri.label} ({pri.score}/10)
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>Computing…</span>
                          )}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <button className="btn btn-secondary btn-sm" style={{ fontSize: 11 }} onClick={() => fetchTimeline(hcp.id)}>
                            {isOpen ? '▲ Hide Timeline' : '📜 View Timeline'}
                          </button>
                        </td>
                      </tr>

                      {/* ── Timeline Panel ── */}
                      {isOpen && (
                        <tr key={`${hcp.id}-timeline`} style={{ borderBottom: '1px solid var(--border-light)' }}>
                          <td colSpan="6" style={{ padding: '0 16px 16px 32px', background: 'var(--primary-ghost)' }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', marginBottom: 12, marginTop: 8 }}>
                              📜 Interaction Timeline — {hcp.name}
                            </div>
                            {timelineLoading ? (
                              <div style={{ color: 'var(--text-muted)', fontSize: 12 }}><span className="spinner" style={{ display: 'inline-block', marginRight: 6 }} /> Loading timeline…</div>
                            ) : timeline.length === 0 ? (
                              <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>No interactions logged yet.</div>
                            ) : (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {timeline.map((it, idx) => (
                                  <div key={it.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: SENTIMENT_COLORS[(it.sentiment || 'neutral').toLowerCase()] + '25', border: `2px solid ${SENTIMENT_COLORS[(it.sentiment || 'neutral').toLowerCase()]}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
                                        {SENTIMENT_EMOJI[(it.sentiment || 'neutral').toLowerCase()] || '😐'}
                                      </div>
                                      {idx < timeline.length - 1 && <div style={{ width: 2, flex: 1, minHeight: 20, background: 'var(--border-light)', marginTop: 4 }} />}
                                    </div>
                                    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', flex: 1, fontSize: 12 }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                        <span style={{ fontWeight: 700, color: 'var(--text)' }}>{it.interaction_type || 'Meeting'}</span>
                                        <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{it.created_at ? new Date(it.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</span>
                                      </div>
                                      <div style={{ color: 'var(--text-secondary)' }}>{it.summary || it.topics_discussed || 'No summary available'}</div>
                                      {it.products_discussed?.length > 0 && (
                                        <div style={{ marginTop: 6 }}>
                                          {it.products_discussed.map(p => (
                                            <span key={p} style={{ fontSize: 10, background: 'var(--primary-ghost)', color: 'var(--primary)', padding: '2px 7px', borderRadius: 99, marginRight: 4 }}>💊 {p}</span>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
