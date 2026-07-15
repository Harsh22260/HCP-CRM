const MOCK_PRODUCTS = [
  { id: 1, name: 'Cardiavex 10mg', category: 'Cardiovascular', description: 'Next-generation ACE inhibitor for managing hypertension and chronic heart failure patients.', samplesInStock: 45, status: 'In Stock' },
  { id: 2, name: 'Lipicure 20mg', category: 'Statin / Cholesterol', description: 'High-efficacy atorvastatin compound designed to lower LDL cholesterol levels rapidly.', samplesInStock: 120, status: 'In Stock' },
  { id: 3, name: 'Prodo-X', category: 'Proton Pump Inhibitor', description: 'Advanced acid reflux and peptic ulcer relief tablet with 24-hour slow release formula.', samplesInStock: 0, status: 'Out of Stock' },
  { id: 4, name: 'Asthmacure Inhaler', category: 'Respiratory', description: 'Bronchodilator aerosol for relief of acute asthma attacks and chronic respiratory conditions.', samplesInStock: 18, status: 'Low Stock' },
]

export default function ProductsPage() {
  return (
    <div className="main-content">
      {/* Top bar */}
      <div className="top-bar">
        <div className="top-bar-left">
          <div className="breadcrumb">
            <span>Portfolio</span>
            <span style={{ margin: '0 4px' }}>/</span>
            <span className="bc-current">Products Suite</span>
          </div>
        </div>
      </div>

      <div className="form-panel" style={{ width: '100%', maxWidth: '100%', padding: '24px' }}>
        <div className="form-panel-header" style={{ marginBottom: 20 }}>
          <h2>Pharmaceutical Product Catalog</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>
            Overview of items currently distributed as physician samples or detailed in presentations.
          </p>
        </div>

        {/* Product Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {MOCK_PRODUCTS.map((prod) => (
            <div key={prod.id} style={{ background: 'var(--bg)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius)', padding: 18, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span className="tool-badge" style={{ background: 'var(--primary-ghost)', color: 'var(--primary)', fontWeight: 600, fontSize: 10 }}>
                    {prod.category}
                  </span>
                  <span className={`sentiment-badge ${prod.status === 'In Stock' ? 'positive' : prod.status === 'Low Stock' ? 'neutral' : 'negative'}`} style={{ fontSize: 9 }}>
                    ● {prod.status}
                  </span>
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
                  💊 {prod.name}
                </h3>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 16 }}>
                  {prod.description}
                </p>
              </div>
              
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Samples Available:</span>
                <strong style={{ fontSize: 14, color: prod.samplesInStock > 0 ? 'var(--text)' : 'var(--danger)' }}>
                  {prod.samplesInStock} units
                </strong>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
