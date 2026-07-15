import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchInteractions } from '../store/slices/interactionsSlice'
import { apiClient } from '../api/client'

export default function FollowUpsPage() {
  const dispatch = useDispatch()
  const { items } = useSelector((s) => s.interactions)
  const [loading, setLoading] = useState(false)

  // Draft follow-up state
  const [draftLoading, setDraftLoading] = useState(null) // interaction id being drafted
  const [draftModal, setDraftModal] = useState(null)     // { id, draft }
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setLoading(true)
    dispatch(fetchInteractions()).finally(() => setLoading(false))
  }, [dispatch])

  const followUpInteractions = items.filter(it => it.follow_up_required === 'yes')

  const handleDraft = async (id) => {
    setDraftLoading(id)
    try {
      const res = await apiClient.post(`/api/interactions/${id}/draft-followup`)
      setDraftModal({ id, draft: res.data.draft })
    } catch (err) {
      setDraftModal({ id, draft: '⚠️ Failed to generate draft. Please try again.' })
    } finally {
      setDraftLoading(null)
    }
  }

  const handleCopy = () => {
    if (!draftModal?.draft) return
    navigator.clipboard.writeText(draftModal.draft)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="main-content">
      {/* Top bar */}
      <div className="top-bar">
        <div className="top-bar-left">
          <div className="breadcrumb">
            <span>Rep Actions</span><span style={{ margin: '0 4px' }}>/</span>
            <span className="bc-current">Scheduled Follow-ups</span>
          </div>
        </div>
        <div className="top-bar-right">
          <span style={{ fontSize: 12, color: 'var(--text-muted)', background: 'var(--bg)', padding: '4px 12px', borderRadius: 99, border: '1px solid var(--border-light)' }}>
            {followUpInteractions.length} pending
          </span>
        </div>
      </div>

      {/* Draft Modal */}
      {draftModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 28, maxWidth: 560, width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>🤖 AI-Generated Follow-up Draft</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setDraftModal(null)}>✕ Close</button>
            </div>
            <div style={{ background: 'var(--bg)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', padding: 16, fontSize: 13, lineHeight: 1.7, color: 'var(--text)', whiteSpace: 'pre-wrap', marginBottom: 16, minHeight: 100, maxHeight: 300, overflowY: 'auto' }}>
              {draftModal.draft}
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setDraftModal(null)}>Dismiss</button>
              <button className="btn btn-primary btn-sm" onClick={handleCopy}>
                {copied ? '✅ Copied!' : '📋 Copy to Clipboard'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="form-panel" style={{ width: '100%', maxWidth: '100%', padding: '24px' }}>
        <div className="form-panel-header" style={{ marginBottom: 20 }}>
          <h2>Scheduled Follow-up Reminders</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>
            Tracks all commitments made during doctor visits. Use <strong>Draft Message 🤖</strong> to auto-generate a professional follow-up.
          </p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', padding: '20px 0' }}>
            <span className="spinner" /> Loading follow-ups...
          </div>
        ) : followUpInteractions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔔</div>
            <div className="empty-state-text">No follow-ups scheduled</div>
            <div className="empty-state-sub">Everything is up-to-date! Set follow-up requirements when logging visits.</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', background: 'var(--bg)', borderRadius: 'var(--radius)', border: '1px solid var(--border-light)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 900 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.5)' }}>
                  {['HCP Name', 'Type', 'Follow-up Date', 'Follow-up Notes / Objective', 'Status', 'AI Draft'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {followUpInteractions.map((it) => (
                  <tr key={it.id} style={{ borderBottom: '1px solid var(--border-light)', background: 'var(--card-bg)' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text)' }}>👤 {it.hcp_name}</td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                      <span className="interaction-card-type" style={{ fontSize: 10 }}>{it.interaction_type || 'Meeting'}</span>
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--warning)' }}>
                      📅 {it.follow_up_date || 'TBD'}
                    </td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-secondary)', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={it.follow_up_notes}>
                      📝 {it.follow_up_notes || 'No notes provided'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontSize: 10, background: 'var(--warning-bg, #FEF3C7)', color: 'var(--warning)', fontWeight: 700, padding: '3px 10px', borderRadius: 99, border: '1px solid #FDE68A' }}>
                        ● Pending
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: 11, whiteSpace: 'nowrap' }}
                        disabled={draftLoading === it.id}
                        onClick={() => handleDraft(it.id)}
                      >
                        {draftLoading === it.id ? <><span className="spinner" style={{ display: 'inline-block', marginRight: 4 }} /> Generating…</> : '🤖 Draft Message'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
