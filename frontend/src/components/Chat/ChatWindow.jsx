import { useState, useRef, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { sendChatMessage, addUserMessage } from '../../store/slices/chatSlice'

export default function ChatWindow() {
  const dispatch = useDispatch()
  const { sessionId, messages, status } = useSelector((s) => s.chat)
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (!input.trim()) return
    dispatch(addUserMessage(input))
    dispatch(sendChatMessage({ sessionId, message: input }))
    setInput('')
  }

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '65vh' }}>
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: 8 }}>
        {messages.length === 0 && (
          <p style={{ color: 'var(--text-muted)' }}>
            Try: "Met Dr. Sharma today, discussed Cardiavex 10mg, gave 2 samples, follow up next month"
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
              marginBottom: 10,
            }}
          >
            <div
              style={{
                background: m.role === 'user' ? 'var(--primary)' : '#f1f3f5',
                color: m.role === 'user' ? 'white' : 'var(--text)',
                padding: '10px 14px',
                borderRadius: 12,
                maxWidth: '75%',
              }}
            >
              {m.content}
              {m.toolCalls?.length > 0 && (
                <div style={{ fontSize: 11, opacity: 0.7, marginTop: 4 }}>
                  🛠 tools used: {m.toolCalls.join(', ')}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Describe your interaction with the HCP..."
        />
        <button className="btn btn-primary" onClick={handleSend} disabled={status === 'loading'}>
          {status === 'loading' ? '...' : 'Send'}
        </button>
      </div>
    </div>
  )
}
