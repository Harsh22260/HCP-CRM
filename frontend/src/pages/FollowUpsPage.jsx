import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchInteractions } from '../store/slices/interactionsSlice'

export default function FollowUpsPage() {
  const dispatch = useDispatch()
  const { items } = useSelector((s) => s.interactions)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    dispatch(fetchInteractions()).finally(() => setLoading(false))
  }, [dispatch])

  // Filter interactions that require a follow-up
  const followUpInteractions = items.filter(it => it.follow_up_required === 'yes')

  return (
    <div className="main-content">
      {/* Top bar */}
      <div className="top-bar">
        <div className="top-bar-left">
          <div className="breadcrumb">
            <span>Rep Actions</span>
            <span style={{ margin: '0 4px' }}>/</span>
            <span className="bc-current">Scheduled Follow-ups</span>
          </div>
        </div>
      </div>

      <div className="form-panel" style={{ width: '100%', maxWidth: '100%', padding: '24px' }}>
        <div className="form-panel-header" style={{ marginBottom: 20 }}>
          <h2>Scheduled Follow-up Reminders</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>
            Tracks all commitments made during doctor visits that require a future call or meeting.
          </p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', padding: '20px 0' }}>
            <span className="spinner" />
            Loading follow-ups...
          </div>
        ) : followUpInteractions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔔</div>
            <div className="empty-state-text">No follow-ups scheduled</div>
            <div className="empty-state-sub">Everything is up-to-date! Set new follow-up requirements when logging visits.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {followUpInteractions.map(it => (
              <div key={it.id} className="interaction-card" style={{ cursor: 'default' }}>
                <div className="interaction-card-top">
                  <span className="interaction-card-hcp" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    👤 {it.hcp_name}
                    <span className="tool-badge" style={{ background: 'var(--warning-bg)', color: 'var(--warning)', fontSize: 10 }}>
                      Due: {it.follow_up_date || 'TBD'}
                    </span>
                  </span>
                  <span className="interaction-card-type">{it.interaction_type || 'Meeting'}</span>
                </div>

                <div style={{ fontSize: 13, color: 'var(--text)', margin: '8px 0 4px', fontWeight: 600 }}>
                  Follow-up Notes / Objective:
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', padding: '8px 12px', background: 'var(--bg)', borderRadius: 'var(--radius-xs)', borderLeft: '3px solid var(--warning)' }}>
                  {it.follow_up_notes || 'No specific follow-up description provided.'}
                </div>

                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                  Linked visit summary: {it.summary || it.raw_text || 'None'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
