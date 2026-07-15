import { useState, useEffect, useRef } from 'react'
import { apiClient } from '../api/client'

/* ─── tiny pure-CSS bar chart ─────────────────────────────── */
function BarChart({ data, color = 'var(--primary)' }) {
  if (!data || data.length === 0)
    return <div style={{ color: 'var(--text-muted)', fontSize: 12, textAlign: 'center', padding: 20 }}>No data</div>
  const max = Math.max(...data.map(d => d.value))
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120, paddingTop: 8 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>{d.value}</div>
          <div style={{ width: '100%', height: max > 0 ? `${(d.value / max) * 90}px` : '4px', minHeight: 4, background: color, borderRadius: '4px 4px 0 0', transition: 'height 0.5s ease' }} />
          <div style={{ fontSize: 10, color: 'var(--text-secondary)', textAlign: 'center', wordBreak: 'break-word', maxWidth: 56 }}>{d.label}</div>
        </div>
      ))}
    </div>
  )
}

/* ─── pure-CSS donut chart ─────────────────────────────────── */
function DonutChart({ positive, neutral, negative, total }) {
  if (total === 0) return <div style={{ color: 'var(--text-muted)', fontSize: 12, textAlign: 'center', padding: 20 }}>No data yet</div>
  const pos = positive / total, neu = neutral / total, neg = negative / total
  const segments = [
    { pct: pos, color: '#22C55E', label: 'Positive', count: positive },
    { pct: neu, color: '#94A3B8', label: 'Neutral',  count: neutral },
    { pct: neg, color: '#EF4444', label: 'Negative', count: negative },
  ]

  // Build SVG path for each segment
  let cumulative = 0
  const radius = 48, cx = 60, cy = 60, strokeW = 18
  const circumference = 2 * Math.PI * radius

  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke="var(--border-light)" strokeWidth={strokeW} />
        {segments.map((seg, i) => {
          const dashLen = seg.pct * circumference
          const dashOffset = circumference - cumulative * circumference
          cumulative += seg.pct
          return (
            <circle
              key={i}
              cx={cx} cy={cy} r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeW}
              strokeDasharray={`${dashLen} ${circumference - dashLen}`}
              strokeDashoffset={dashOffset}
              style={{ transformOrigin: '60px 60px', transform: 'rotate(-90deg)', transition: 'stroke-dasharray 0.5s ease' }}
            />
          )
        })}
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize="18" fontWeight="800" fill="var(--text)">{total}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize="9" fill="var(--text-muted)">visits</text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {segments.map((seg, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: seg.color, flexShrink: 0 }} />
            <span style={{ color: 'var(--text-secondary)' }}>{seg.label}</span>
            <span style={{ fontWeight: 700, color: 'var(--text)', marginLeft: 'auto', paddingLeft: 16 }}>{seg.count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── line spark chart ─────────────────────────────────────── */
function LineChart({ trend }) {
  if (!trend || trend.length < 2)
    return <div style={{ color: 'var(--text-muted)', fontSize: 12, textAlign: 'center', padding: 20 }}>Need at least 2 months of data</div>
  const max = Math.max(...trend.map(t => t.visits))
  const W = 360, H = 80, pad = 12
  const pts = trend.map((t, i) => {
    const x = pad + (i / (trend.length - 1)) * (W - pad * 2)
    const y = H - pad - ((t.visits / (max || 1)) * (H - pad * 2))
    return { x, y, ...t }
  })
  const d = `M ${pts.map(p => `${p.x},${p.y}`).join(' L ')}`

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg width={W} height={H + 20} viewBox={`0 0 ${W} ${H + 20}`}>
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${d} L ${pts[pts.length - 1].x},${H} L ${pts[0].x},${H} Z`} fill="url(#lineGrad)" />
        <path d={d} fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={4} fill="var(--primary)" stroke="white" strokeWidth="1.5" />
            <text x={p.x} y={H + 16} textAnchor="middle" fontSize="9" fill="var(--text-muted)">{p.month}</text>
          </g>
        ))}
      </svg>
    </div>
  )
}

/* ─── KPI Target Bar ───────────────────────────────────────── */
function KpiBar({ label, actual, target, color = 'var(--primary)', unit = '' }) {
  const pct = target > 0 ? Math.min(100, Math.round((actual / target) * 100)) : 0
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
        <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ fontWeight: 700, color }}>
          {actual}{unit} / {target}{unit} &nbsp;
          <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({pct}%)</span>
        </span>
      </div>
      <div style={{ height: 8, background: 'var(--border-light)', borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 8, transition: 'width 0.6s ease' }} />
      </div>
    </div>
  )
}

/* ─── main component ───────────────────────────────────────── */
export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(false)

  // KPI Targets from localStorage
  const [targets, setTargets] = useState(() => {
    try { return JSON.parse(localStorage.getItem('kpi_targets') || '{}') } catch { return {} }
  })
  const visitTarget = Number(targets.monthly_visits || 20)
  const sentTarget  = Number(targets.positive_pct   || 70)

  const fetchMetrics = async () => {
    setLoading(true)
    try {
      const res = await apiClient.get('/api/interactions/dashboard/analytics')
      setMetrics(res.data)
    } catch (err) {
      console.error('Failed to load metrics', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchMetrics() }, [])

  if (loading || !metrics) {
    return (
      <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
        <span className="spinner" style={{ marginRight: 8 }} /> Loading metrics from database...
      </div>
    )
  }

  const { total_visits, positive_percentage, pending_follow_ups, samples_distributed, sentiment_breakdown, top_products, monthly_trend } = metrics

  // Derive current month visit count from trend
  const now = new Date()
  const curMonthKey = now.toLocaleString('en-US', { month: 'short' }) + ' ' + now.getFullYear()
  const thisMonthVisits = (monthly_trend || []).find(t => t.month === curMonthKey)?.visits || 0

  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const daysLeft    = daysInMonth - now.getDate()

  return (
    <div className="main-content">
      {/* Top bar */}
      <div className="top-bar">
        <div className="top-bar-left">
          <div className="breadcrumb">
            <span>HCP Suite</span><span style={{ margin: '0 4px' }}>/</span>
            <span className="bc-current">Analytics Dashboard</span>
          </div>
        </div>
        <div className="top-bar-right">
          <button className="btn btn-primary btn-sm" onClick={fetchMetrics}>🔄 Refresh</button>
        </div>
      </div>

      <div className="form-panel" style={{ width: '100%', maxWidth: '100%', padding: '24px' }}>
        <div className="form-panel-header" style={{ marginBottom: 24 }}>
          <h2>Interaction Analytics &amp; KPIs</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>
            Monitor doctor response rates, product interests, and field performance in real time.
          </p>
        </div>

        {/* ── KPI Cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
          {[
            { label: 'Total Visits',       value: total_visits,         sub: 'Logged interactions', color: 'var(--text)',    icon: '📋' },
            { label: 'Positive Sentiment', value: `${positive_percentage}%`, sub: '😊 Favorable visits',  color: 'var(--success)', icon: '✅' },
            { label: 'Pending Follow-ups', value: pending_follow_ups,   sub: '🔔 Action required',  color: 'var(--warning)', icon: '⏳' },
            { label: 'Samples Dispatched', value: samples_distributed,  sub: '💉 Units distributed', color: 'var(--primary)', icon: '🧪' },
          ].map(card => (
            <div key={card.label} style={{ background: 'var(--bg)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius)', padding: 18 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{card.label}</div>
              <div style={{ fontSize: 30, fontWeight: 800, color: card.color, marginTop: 8 }}>{card.icon} {card.value}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>{card.sub}</div>
            </div>
          ))}
        </div>

        {/* ── Monthly KPI Targets ── */}
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700 }}>📊 Monthly KPI Progress</h3>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg)', padding: '3px 10px', borderRadius: 99, border: '1px solid var(--border-light)' }}>
              {daysLeft} days left this month
            </span>
          </div>
          <KpiBar label="Visits This Month" actual={thisMonthVisits} target={visitTarget} color="var(--primary)" />
          <KpiBar label="Positive Sentiment Target" actual={positive_percentage} target={sentTarget} color="var(--success)" unit="%" />
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
            ⚙️ Adjust monthly targets in <strong>Settings → KPI Targets</strong>
          </p>
        </div>

        {/* ── Charts Row ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 24 }}>
          {/* Donut - Sentiment */}
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>😊 Sentiment Distribution</h3>
            <DonutChart
              positive={sentiment_breakdown.positive}
              neutral={sentiment_breakdown.neutral}
              negative={sentiment_breakdown.negative}
              total={total_visits}
            />
          </div>

          {/* Bar - Products */}
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>💊 Top Discussed Products</h3>
            {top_products.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: 12, textAlign: 'center', padding: 20 }}>No products logged yet.</div>
            ) : (
              <BarChart
                data={top_products.map(p => ({ label: p.name, value: p.count }))}
                color="var(--primary)"
              />
            )}
          </div>

          {/* Line - Monthly trend */}
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20, gridColumn: '1 / -1' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>📈 Monthly Visit Trend</h3>
            <LineChart trend={monthly_trend} />
          </div>
        </div>
      </div>
    </div>
  )
}
