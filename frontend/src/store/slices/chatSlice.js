import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { apiClient } from '../../api/client'

export const sendChatMessage = createAsyncThunk(
  'chat/send',
  async ({ sessionId, message }) => {
    const res = await apiClient.post('/api/chat/', { session_id: sessionId, message })
    return res.data
  }
)

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    sessionId: `session-${Date.now()}`,
    messages: [], // {role: 'user'|'assistant', content}
    status: 'idle',
  },
  reducers: {
    addUserMessage: (state, action) => {
      state.messages.push({ role: 'user', content: action.payload })
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendChatMessage.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.messages.push({
          role: 'assistant',
          content: action.payload.reply,
          toolCalls: action.payload.tool_calls,
        })
      })
      .addCase(sendChatMessage.rejected, (state) => {
        state.status = 'failed'
        state.messages.push({
          role: 'assistant',
          content: 'Sorry, something went wrong reaching the agent.',
        })
      })
  },
})

export const { addUserMessage } = chatSlice.actions
export default chatSlice.reducer
