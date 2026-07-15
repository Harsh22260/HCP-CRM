import InteractionForm from '../components/LogInteraction/InteractionForm'
import InteractionList from '../components/LogInteraction/InteractionList'
import AiAssistant from '../components/Chat/AiAssistant'

export default function LogInteractionPage() {
  return (
    <div className="main-content">
      {/* Top bar */}
      <div className="top-bar">
        <div className="top-bar-left">
          <div className="breadcrumb">
            <span>HCP Module</span>
            <span style={{ margin: '0 4px' }}>/</span>
            <span className="bc-current">Log Interaction</span>
          </div>
        </div>
        <div className="top-bar-right">
          <button className="top-bar-btn">
            📥 Export
          </button>
        </div>
      </div>

      {/* Split panel: Form left, AI right */}
      <div className="split-panel">
        <InteractionForm />
        <AiAssistant />
      </div>
    </div>
  )
}
