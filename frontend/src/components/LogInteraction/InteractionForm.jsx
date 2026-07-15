import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { createInteraction } from '../../store/slices/interactionsSlice'
import InteractionList from './InteractionList'

const TODAY = new Date().toISOString().split('T')[0]
const NOW = new Date().toTimeString().slice(0, 5)

const INITIAL_FORM = {
  hcp_name: '',
  interaction_type: 'Meeting',
  date: TODAY,
  time: NOW,
  attendees: '',
  raw_text: '',
  products_discussed: [],
  samples_distributed: [],
  materials_shared: [],
  outcomes: '',
  follow_up_required: 'no',
  follow_up_date: '',
  follow_up_notes: '',
}

export default function InteractionForm() {
  const dispatch = useDispatch()
  const status = useSelector((s) => s.interactions.status)
  const [form, setForm] = useState({ ...INITIAL_FORM })
  const [productInput, setProductInput] = useState('')
  const [materialInput, setMaterialInput] = useState('')
  const [sampleProduct, setSampleProduct] = useState('')
  const [sampleQty, setSampleQty] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const toggleFollowUp = () => {
    setForm({
      ...form,
      follow_up_required: form.follow_up_required === 'yes' ? 'no' : 'yes',
    })
  }

  const addProduct = () => {
    if (!productInput.trim()) return
    setForm({ ...form, products_discussed: [...form.products_discussed, productInput.trim()] })
    setProductInput('')
  }

  const removeProduct = (idx) => {
    setForm({
      ...form,
      products_discussed: form.products_discussed.filter((_, i) => i !== idx),
    })
  }

  const addMaterial = () => {
    if (!materialInput.trim()) return
    setForm({ ...form, materials_shared: [...form.materials_shared, materialInput.trim()] })
    setMaterialInput('')
  }

  const removeMaterial = (idx) => {
    setForm({
      ...form,
      materials_shared: form.materials_shared.filter((_, i) => i !== idx),
    })
  }

  const addSample = () => {
    if (!sampleProduct.trim()) return
    setForm({
      ...form,
      samples_distributed: [
        ...form.samples_distributed,
        { product: sampleProduct.trim(), qty: parseInt(sampleQty) || 1 },
      ],
    })
    setSampleProduct('')
    setSampleQty('')
  }

  const removeSample = (idx) => {
    setForm({
      ...form,
      samples_distributed: form.samples_distributed.filter((_, i) => i !== idx),
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.hcp_name.trim()) return
    try {
      await dispatch(createInteraction({ ...form, channel: 'form' })).unwrap()
      setForm({ ...INITIAL_FORM })
      setSubmitted(true)
      setTimeout(() => setSubmitted(false), 3000)
    } catch {
      // handled by Redux
    }
  }

  return (
    <div className="form-panel">
      <div className="form-panel-header">
        <h2>Log HCP Interaction</h2>
      </div>

      <form onSubmit={handleSubmit}>
        {/* ── Interaction Details ── */}
        <div className="form-section">
          <div className="form-section-title">
            <span className="section-icon">📋</span>
            Interaction Details
          </div>

          <div className="form-row">
            <div className="field">
              <label className="field-label">
                HCP Name <span className="required">*</span>
              </label>
              <input
                name="hcp_name"
                value={form.hcp_name}
                onChange={handleChange}
                placeholder="Search or select HCP..."
                required
              />
            </div>
            <div className="field">
              <label className="field-label">Interaction Type</label>
              <select
                name="interaction_type"
                value={form.interaction_type}
                onChange={handleChange}
              >
                <option value="Meeting">Meeting</option>
                <option value="Phone Call">Phone Call</option>
                <option value="Email">Email</option>
                <option value="Conference">Conference</option>
                <option value="In-person Visit">In-person Visit</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="field">
              <label className="field-label">Date</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
              />
            </div>
            <div className="field">
              <label className="field-label">Time</label>
              <input
                type="time"
                name="time"
                value={form.time}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="field">
            <label className="field-label">Attendees</label>
            <input
              name="attendees"
              value={form.attendees}
              onChange={handleChange}
              placeholder="Enter names or search..."
            />
          </div>
        </div>

        {/* ── Discussion Notes ── */}
        <div className="form-section">
          <div className="form-section-title">
            <span className="section-icon">💬</span>
            Discussion Notes
          </div>

          <div className="field">
            <label className="field-label">Topics Discussed</label>
            <textarea
              name="raw_text"
              rows={4}
              value={form.raw_text}
              onChange={handleChange}
              placeholder="Enter key discussion points..."
            />
          </div>

          <div className="voice-note-link">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="23"/>
              <line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
            Summarize from Voice Note (Requires Consent)
          </div>
        </div>

        {/* ── Products Discussed ── */}
        <div className="form-section">
          <div className="form-section-title">
            <span className="section-icon">💊</span>
            Products Discussed
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <input
              value={productInput}
              onChange={(e) => setProductInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addProduct())}
              placeholder="Add product name..."
              style={{ flex: 1 }}
            />
            <button type="button" className="btn btn-secondary btn-sm" onClick={addProduct}>
              + Add
            </button>
          </div>

          {form.products_discussed.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
              {form.products_discussed.map((p, i) => (
                <span key={i} className="tool-badge" style={{ fontSize: 12, padding: '4px 10px', cursor: 'pointer' }}
                      onClick={() => removeProduct(i)}>
                  {p} ✕
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ── Materials & Samples ── */}
        <div className="form-section">
          <div className="form-section-title">
            <span className="section-icon">📦</span>
            Materials Shared / Samples Distributed
          </div>

          {/* Materials */}
          <div className="field">
            <label className="field-label">Materials Shared</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input
                value={materialInput}
                onChange={(e) => setMaterialInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addMaterial())}
                placeholder="Brochure, flyer, study data..."
                style={{ flex: 1 }}
              />
              <button type="button" className="btn btn-secondary btn-sm" onClick={addMaterial}>
                + Add
              </button>
            </div>
            {form.materials_shared.length === 0 ? (
              <div className="materials-empty">No materials added.</div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {form.materials_shared.map((m, i) => (
                  <span key={i} className="tool-badge" style={{ fontSize: 12, padding: '4px 10px', cursor: 'pointer' }}
                        onClick={() => removeMaterial(i)}>
                    📄 {m} ✕
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Samples */}
          <div className="field">
            <label className="field-label">Samples Distributed</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input
                value={sampleProduct}
                onChange={(e) => setSampleProduct(e.target.value)}
                placeholder="Product name..."
                style={{ flex: 1 }}
              />
              <input
                value={sampleQty}
                onChange={(e) => setSampleQty(e.target.value)}
                placeholder="Qty"
                type="number"
                min="1"
                style={{ width: 70 }}
              />
              <button type="button" className="btn btn-secondary btn-sm" onClick={addSample}>
                + Add
              </button>
            </div>
            {form.samples_distributed.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {form.samples_distributed.map((s, i) => (
                  <span key={i} className="tool-badge" style={{ fontSize: 12, padding: '4px 10px', cursor: 'pointer' }}
                        onClick={() => removeSample(i)}>
                    💉 {s.product} × {s.qty} ✕
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Outcomes & Follow-up ── */}
        <div className="form-section">
          <div className="form-section-title">
            <span className="section-icon">🎯</span>
            Outcomes & Follow-up
          </div>

          <div className="field">
            <label className="field-label">Outcomes / Agreements</label>
            <textarea
              name="outcomes"
              rows={2}
              value={form.outcomes}
              onChange={handleChange}
              placeholder="Summary of outcomes, next steps, agreements made..."
            />
          </div>

          <div className="follow-up-row">
            <div className="toggle-group">
              <div
                className={`toggle-switch ${form.follow_up_required === 'yes' ? 'active' : ''}`}
                onClick={toggleFollowUp}
              />
              <span className="toggle-label">Follow-up Required</span>
            </div>
          </div>

          {form.follow_up_required === 'yes' && (
            <>
              <div className="form-row">
                <div className="field">
                  <label className="field-label">Follow-up Date</label>
                  <input
                    type="date"
                    name="follow_up_date"
                    value={form.follow_up_date}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="field">
                <label className="field-label">Follow-up Notes</label>
                <textarea
                  name="follow_up_notes"
                  rows={2}
                  value={form.follow_up_notes}
                  onChange={handleChange}
                  placeholder="What needs to be followed up on..."
                />
              </div>
            </>
          )}
        </div>

        {/* ── Actions ── */}
        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setForm({ ...INITIAL_FORM })}
          >
            Reset
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={status === 'loading' || !form.hcp_name.trim()}
          >
            {status === 'loading' ? (
              <>
                <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
                Logging...
              </>
            ) : (
              '📝 Log Interaction'
            )}
          </button>
        </div>
      </form>

      {/* Toast */}
      {submitted && (
        <div className="toast">
          <span className="toast-icon">✅</span>
          Interaction logged successfully!
        </div>
      )}

      {/* Recent interactions list below the form */}
      <InteractionList />
    </div>
  )
}
