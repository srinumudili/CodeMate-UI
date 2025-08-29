// src/utils/redux/connectionSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Async thunk to fetch accepted connections
export const fetchConnections = createAsyncThunk(
  "connections/fetchConnections",
  async ({ page = 1, limit = 20 } = {}, { rejectWithValue }) => {
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/api/chat/connections?page=${page}&limit=${limit}`,
        { withCredentials: true }
      );
      return res.data; // { connections: [], meta: {} }
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

const connectionSlice = createSlice({
  name: "connections",
  initialState: {
    list: [],
    meta: { page: 1, limit: 20, total: 0 },
    loading: false,
    error: null,
    hasInitiallyFetched: false,
  },
  reducers: {
    addConnection: (state, action) => {
      const newConnection = action.payload;
      if (!state.list.find((c) => c._id === newConnection._id)) {
        state.list.push(newConnection);
        state.meta.total += 1;
      }
    },
    removeConnection: (state, action) => {
      const connectionId = action.payload;
      state.list = state.list.filter((c) => c._id !== connectionId);
      state.meta.total -= 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConnections.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConnections.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.connections;
        state.meta = action.payload.meta;
        state.hasInitiallyFetched = true;
      })
      .addCase(fetchConnections.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.hasInitiallyFetched = true;
      });
  },
});

export const { addConnection, removeConnection } = connectionSlice.actions;

export default connectionSlice.reducer;
