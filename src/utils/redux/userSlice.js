import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

// Thunks (unchanged)
export const loginUser = createAsyncThunk(
  "user/loginUser",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/login`,
        formData,
        { withCredentials: true }
      );
      return res.data?.data;
    } catch (error) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data ||
        "Login failed. Please try again.";
      return rejectWithValue(errorMsg);
    }
  }
);

export const registerUser = createAsyncThunk(
  "user/registerUser",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/signup`,
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
        },
        { withCredentials: true }
      );
      return res.data?.data;
    } catch (error) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data ||
        "Signup failed. Please try again.";
      return rejectWithValue(errorMsg);
    }
  }
);

export const logoutUser = createAsyncThunk(
  "user/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/logout`,
        {},
        { withCredentials: true }
      );
      return true;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Logout failed";
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  "user/fetchUserProfile",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/profile/view`,
        { withCredentials: true }
      );
      return res.data;
    } catch (error) {
      const status = error?.response?.status;
      const message =
        error?.response?.data?.message || "Failed to fetch user profile";
      return rejectWithValue({ status, message });
    }
  }
);

export const updateProfile = createAsyncThunk(
  "user/updateProfile",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL}/api/profile/edit`,
        payload,
        { withCredentials: true }
      );
      return res.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update profile"
      );
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState: {
    user: null,
    loading: false,
    error: null,
  },
  reducers: {
    addUser: (state, action) => {
      return action.payload;
    },
    removeUser: () => null,
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.loading = false;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch user";
        if (action.payload?.status === 401) {
          state.user = null;
        }
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { addUser, removeUser, clearError } = userSlice.actions;
export default userSlice.reducer;
