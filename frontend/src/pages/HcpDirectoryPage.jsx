import { useState } from 'react'

const MOCK_HCPS = [
  { id: 1, name: 'Dr. Priya Sharma', specialty: 'Cardiologist', hospital: 'Apollo Heart Institute', email: 'priya.sharma@apollo.com', phone: '+91 98765 43210', lastVisited: '2 days ago', status: 'Active' },
  { id: 2, name: 'Dr. Ananya Patel', specialty: 'Diabetologist', hospital: 'Medanta Medicity', email: 'ananya.patel@medanta.org', phone: '+91 87654 32109', lastVisited: '1 week ago', status: 'Active' },
  { id: 3, name: 'Dr. Rajesh Kumar', specialty: 'Pediatrician', hospital: 'Fortis Healthcare', email: 'rajesh.kumar@fortis.com', phone: '+91 76543 21098', lastVisited: '3 days ago', status: 'On Leave' },
  { id: 4, name: 'Dr. Sarah Johnson', specialty: 'Oncologist', hospital: 'Max Super Speciality', email: 'sarah.johnson@max.in', phone: '+91 65432 10987', lastVisited: '2 weeks ago', status: 'Active' },
  { id: 5, name: 'Dr. Amit Mehta', specialty: 'Neurologist', hospital: 'Kokilaben Dhirubhai Ambani Hospital', email: 'amit.mehta@kokilaben.com', phone: '+91 54321 09876', lastVisited: 'Just now', status: 'Active' },
]

export default function HcpDirectoryPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')

  const filteredHcps = MOCK_HCPS.filter(hcp => {
    const matchesSearch = hcp.name.toLowerCase().includes(search.toLowerCase()) || 
                          hcp.specialty.toLowerCase().includes(search.toLowerCase()) ||
                          hcp.hospital.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'All' || hcp.status === filter
    return matchesSearch && matchesFilter
  })

  return (
    <div className="main-content">
      {/* Top bar */}
      <div className="top-bar">
        <div className="top-bar-left">
          <div className="breadcrumb">
            <span>HCP Module</span>
            <span style={{ margin: '0 4px' }}>/</span>
            <span className="bc-current">HCP Directory</span>
          </div>
        </div>
        <div className="top-bar-right">
          <button className="btn btn-primary btn-sm">
            ➕ Add New HCP
          </button>
        </div>
      </div>

      <div className="form-panel" style={{ width: '100%', maxWidth: '100%', padding: '24px' }}>
        <div className="form-panel-header" style={{ marginBottom: 20 }}>
          <h2>Healthcare Professionals Directory</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>
            Manage profiles, specialties, and contact logs for medical representatives.
          </p>
        </div>

        {/* Filter / Search Row */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, specialty, or clinic..."
            style={{ flex: 1, minWidth: 260 }}
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ width: 160 }}
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="On Leave">On Leave</option>
          </select>
        </div>

        {/* Directory Table */}
        <div style={{ overflowX: 'auto', background: 'var(--bg)', borderRadius: 'var(--radius)', border: '1px solid var(--border-light)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 800 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.5)' }}>
                <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>HCP Name</th>
                <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>Specialty</th>
                <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>Hospital/Clinic</th>
                <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>Contact Info</th>
                <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>Last Interaction</th>
                <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredHcps.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>
                    No HCPs match your search query.
                  </td>
                </tr>
              ) : (
                filteredHcps.map((hcp) => (
                  <tr key={hcp.id} style={{ borderBottom: '1px solid var(--border-light)', background: 'var(--card-bg)', transition: 'background 0.2s' }} className="hcp-row">
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text)' }}>
                      👤 {hcp.name}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                      {hcp.specialty}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                      🏥 {hcp.hospital}
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: 12 }}>
                      <div>📧 {hcp.email}</div>
                      <div style={{ color: 'var(--text-muted)', marginTop: 2 }}>📞 {hcp.phone}</div>
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>
                      🕒 {hcp.lastVisited}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span className={`sentiment-badge ${hcp.status === 'Active' ? 'positive' : 'neutral'}`} style={{ fontSize: 10 }}>
                        {hcp.status === 'Active' ? '● Active' : '○ On Leave'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
