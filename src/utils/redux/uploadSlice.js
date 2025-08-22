// utils/uploadSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// POST: Upload profile image
export const uploadProfileImage = createAsyncThunk(
  "upload/profileImage",
  async (formDataFile, thunkAPI) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/upload/upload-profile`,
        formDataFile,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 30000,
        }
      );

      const profileUrl =
        res.data.data?.profileUrl || res.data.profileUrl || res.data.data || "";

      if (!profileUrl) {
        throw new Error("No profile URL returned from server");
      }

      return profileUrl;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message ||
          (error.response?.status === 413
            ? "File too large"
            : error.code === "ECONNABORTED"
            ? "Upload timeout"
            : "Image upload failed")
      );
    }
  }
);

const uploadSlice = createSlice({
  name: "upload",
  initialState: {
    profileUrl: "",
    loading: false,
    error: null,
  },
  reducers: {
    clearUploadState: (state) => {
      state.profileUrl = "";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadProfileImage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadProfileImage.fulfilled, (state, action) => {
        state.loading = false;
        state.profileUrl = action.payload;
      })
      .addCase(uploadProfileImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearUploadState } = uploadSlice.actions;
export default uploadSlice.reducer;
