import { useState, useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { sendChatMessage, addUserMessage } from '../../store/slices/chatSlice'
import { fetchInteractions } from '../../store/slices/interactionsSlice'

const WELCOME_MSG = {
  role: 'assistant',
  content:
    'Hi! I\'m Sage 🤖, your AI CRM assistant. I can help you:\n\n' +
    '• **Log interactions** — "Met Dr. Sharma, discussed Cardiavex 10mg, gave 2 samples"\n' +
    '• **Edit past entries** — "Edit interaction #3, change follow_up_date to 2025-06-01"\n' +
    '• **View HCP history** — "Show me history for Dr. Patel"\n' +
    '• **Schedule follow-ups** — "Set a follow-up for interaction #2 on July 15"\n' +
    '• **Get talking points** — "Suggest talking points for Dr. Kumar"\n\n' +
    'Just describe what you need in natural language!',
}

function formatTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function AiAssistant() {
  const dispatch = useDispatch()
  const { sessionId, messages, status } = useSelector((s) => s.chat)
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, status])

  const handleSend = async () => {
    if (!input.trim() || status === 'loading') return
    const msg = input.trim()
    setInput('')
    dispatch(addUserMessage(msg))
    try {
      await dispatch(sendChatMessage({ sessionId, message: msg })).unwrap()
      // Refresh interactions list after agent may have logged/edited something
      dispatch(fetchInteractions())
    } catch {
      // error handled in reducer
    }
  }

  const renderContent = (text) => {
    // Simple markdown-like rendering for bold
    return text.split('\n').map((line, i) => (
      <span key={i}>
        {line.split(/(\*\*.*?\*\*)/).map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={j}>{part.slice(2, -2)}</strong>
          }
          return part
        })}
        {i < text.split('\n').length - 1 && <br />}
      </span>
    ))
  }

  return (
    <div className="ai-panel">
      {/* Header */}
      <div className="ai-panel-header">
        <div className="ai-panel-header-left">
          <div className="ai-avatar">🤖</div>
          <div>
            <h2>AI Assistant — Sage</h2>
            <div className="ai-panel-subtitle">Log interactions via natural conversation</div>
          </div>
        </div>
        <div className="ai-status">
          <span className="ai-status-dot" />
          Online
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {/* Welcome message */}
        <div className="chat-msg-row">
          <div className="chat-msg-avatar ai">🤖</div>
          <div className="chat-bubble assistant">
            {renderContent(WELCOME_MSG.content)}
            <span className="msg-time">{formatTime()}</span>
          </div>
        </div>

        {/* Dynamic messages */}
        {messages.map((m, i) => (
          <div key={i} className={`chat-msg-row ${m.role}`}>
            {m.role === 'assistant' && <div className="chat-msg-avatar ai">🤖</div>}
            <div className={`chat-bubble ${m.role}`}>
              {renderContent(m.content)}
              {m.toolCalls?.length > 0 && (
                <div className="tool-calls">
                  {m.toolCalls.map((tc, j) => (
                    <span key={j} className="tool-badge">
                      🛠 {tc}
                    </span>
                  ))}
                </div>
              )}
              <span className="msg-time">{formatTime()}</span>
            </div>
            {m.role === 'user' && <div className="chat-msg-avatar user-av">HR</div>}
          </div>
        ))}

        {/* Typing indicator */}
        {status === 'loading' && (
          <div className="chat-msg-row">
            <div className="chat-msg-avatar ai">🤖</div>
            <div className="typing-indicator">
              <div className="typing-dot" />
              <div className="typing-dot" />
              <div className="typing-dot" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="chat-input-bar">
        <div className="chat-input-wrapper">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Describe your interaction or ask for help..."
            disabled={status === 'loading'}
          />
        </div>
        <button
          className="send-btn"
          onClick={handleSend}
          disabled={status === 'loading' || !input.trim()}
          title="Send message"
        >
          ➤
        </button>
      </div>
    </div>
  )
}
