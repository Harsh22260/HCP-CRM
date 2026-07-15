import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { apiClient } from '../../api/client'

export const fetchInteractions = createAsyncThunk(
  'interactions/fetchAll',
  async () => {
    const res = await apiClient.get('/api/interactions/')
    return res.data
  }
)

export const createInteraction = createAsyncThunk(
  'interactions/create',
  async (payload) => {
    const res = await apiClient.post('/api/interactions/', payload)
    return res.data
  }
)

export const updateInteraction = createAsyncThunk(
  'interactions/update',
  async ({ id, ...payload }) => {
    const res = await apiClient.put(`/api/interactions/${id}`, payload)
    return res.data
  }
)

export const deleteInteraction = createAsyncThunk(
  'interactions/delete',
  async (id) => {
    await apiClient.delete(`/api/interactions/${id}`)
    return id
  }
)

const interactionsSlice = createSlice({
  name: 'interactions',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInteractions.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchInteractions.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchInteractions.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
      .addCase(createInteraction.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(createInteraction.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items.unshift(action.payload)
      })
      .addCase(createInteraction.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
      .addCase(updateInteraction.fulfilled, (state, action) => {
        const idx = state.items.findIndex((i) => i.id === action.payload.id)
        if (idx !== -1) state.items[idx] = action.payload
      })
      .addCase(deleteInteraction.fulfilled, (state, action) => {
        state.items = state.items.filter((i) => i.id !== action.payload)
      })
  },
})

export default interactionsSlice.reducer
