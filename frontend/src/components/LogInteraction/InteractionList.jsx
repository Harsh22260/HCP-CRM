import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchInteractions, deleteInteraction } from '../../store/slices/interactionsSlice'

export default function InteractionList() {
  const dispatch = useDispatch()
  const { items, status } = useSelector((s) => s.interactions)

  useEffect(() => {
    dispatch(fetchInteractions())
  }, [dispatch])

  // Refresh when new items are added
  useEffect(() => {
    if (status === 'succeeded') {
      // already up to date
    }
  }, [status])

  const handleDelete = (id) => {
    if (window.confirm('Delete this interaction?')) {
      dispatch(deleteInteraction(id))
    }
  }

  if (items.length === 0 && status !== 'loading') {
    return (
      <div className="interaction-list">
        <div className="interaction-list-header">
          <h3>Recent Interactions</h3>
          <span className="interaction-count">0</span>
        </div>
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <div className="empty-state-text">No interactions logged yet</div>
          <div className="empty-state-sub">Use the form above or the AI assistant to log your first interaction</div>
        </div>
      </div>
    )
  }

  return (
    <div className="interaction-list">
      <div className="interaction-list-header">
        <h3>Recent Interactions</h3>
        <span className="interaction-count">{items.length}</span>
      </div>

      {status === 'loading' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 16, color: 'var(--text-muted)' }}>
          <span className="spinner" />
          Loading interactions...
        </div>
      )}

      {items.map((it) => (
        <div key={it.id} className="interaction-card">
          <div className="interaction-card-top">
            <span className="interaction-card-hcp">{it.hcp_name}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="interaction-card-type">{it.interaction_type || 'Meeting'}</span>
              <div className="interaction-card-actions">
                <button className="action-btn danger" onClick={() => handleDelete(it.id)} title="Delete">
                  🗑
                </button>
              </div>
            </div>
          </div>

          <div className="interaction-card-summary">
            {it.summary || it.raw_text || 'No notes recorded.'}
          </div>

          <div className="interaction-card-meta">
            {it.sentiment && (
              <span className={`sentiment-badge ${it.sentiment.toLowerCase()}`}>
                {it.sentiment.toLowerCase() === 'positive' ? '😊' : it.sentiment.toLowerCase() === 'negative' ? '😟' : '😐'} {it.sentiment}
              </span>
            )}
            {it.date && (
              <span className="meta-item">📅 {it.date}</span>
            )}
            {it.channel && (
              <span className="meta-item">
                {it.channel === 'chat' ? '💬' : '📝'} via {it.channel}
              </span>
            )}
            {it.follow_up_required === 'yes' && (
              <span className="meta-item" style={{ color: 'var(--warning)' }}>
                🔔 Follow-up{it.follow_up_date ? `: ${it.follow_up_date}` : ''}
              </span>
            )}
            {it.products_discussed?.length > 0 && (
              <span className="meta-item">💊 {it.products_discussed.join(', ')}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
