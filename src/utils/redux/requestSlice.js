// utils/requestSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { removeFeed } from "./feedSlice";

// Thunk for sending a request
export const sendUserRequest = createAsyncThunk(
  "requests/send",
  async ({ status, userId }, { rejectWithValue }) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/requests/send/${userId}`,
        { status },
        { withCredentials: true }
      );
      return userId;
    } catch (error) {
      const message =
        error?.response?.data?.message || "Request failed. Please try again.";
      return rejectWithValue(message);
    }
  }
);

//Thunk for fetchRequests
export const fetchRequests = createAsyncThunk(
  "requests/fetchRequests",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/user/requests`,
        { withCredentials: true }
      );
      return res?.data?.data;
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || "Failed to fetch requests";
      return rejectWithValue(errorMessage);
    }
  }
);

// Review a request (accept/reject)
export const reviewRequest = createAsyncThunk(
  "requests/review",
  async ({ status, requestId }, thunkAPI) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL}/api/requests/review/${requestId}`,
        { status },
        { withCredentials: true }
      );

      // Access current state to find connected user ID
      const state = thunkAPI.getState();
      const request = state.requests.requests.find(
        (req) => req._id === requestId
      );

      // Remove request
      thunkAPI.dispatch(removeRequest(requestId));

      // If accepted, remove user from feed
      if (status === "accepted") {
        const connectedUserId = request?.fromUserId?._id;
        if (connectedUserId) {
          thunkAPI.dispatch(removeFeed(connectedUserId));
        }
      }

      return requestId;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || "Failed to review request"
      );
    }
  }
);

const requestSlice = createSlice({
  name: "requests",
  initialState: {
    requests: [],
    loading: false,
    error: null,
  },
  reducers: {
    removeRequest: (state, action) => {
      state.requests = state.requests.filter(
        (req) => req._id !== action.payload
      );
    },
  },
  extraReducers: (builder) => {
    builder
      //Send Request or Ignore Profile
      .addCase(sendUserRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendUserRequest.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(sendUserRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      //fetchRequests
      .addCase(fetchRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = action.payload;
      })
      .addCase(fetchRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      //review
      .addCase(reviewRequest.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { removeRequest } = requestSlice.actions;
export default requestSlice.reducer;
