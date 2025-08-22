import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

// Thunk to fetch feed data
export const fetchFeed = createAsyncThunk(
  "feed/fetchFeed",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/user/feed`,
        { withCredentials: true }
      );
      return response.data?.users;
    } catch (error) {
      const message = error?.response?.data?.message || "Failed to load feed.";
      return rejectWithValue({ message, status: error?.response?.status });
    }
  }
);

const feedSlice = createSlice({
  name: "feed",
  initialState: {
    feed: [],
    loading: false,
    error: "",
  },
  reducers: {
    addFeed: (state, action) => {
      state.feed = action.payload;
    },
    removeFeed: (state, action) => {
      state.feed = state.feed.filter((user) => user._id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeed.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(fetchFeed.fulfilled, (state, action) => {
        state.loading = false;
        state.feed = action.payload;
      })
      .addCase(fetchFeed.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Something went wrong";
      });
  },
});

export const { addFeed, removeFeed } = feedSlice.actions;
export default feedSlice.reducer;
