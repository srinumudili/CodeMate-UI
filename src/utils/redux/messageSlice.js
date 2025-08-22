// src/utils/redux/messageSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Async thunk to fetch messages for a conversation
export const fetchMessages = createAsyncThunk(
  "messages/fetchMessages",
  async ({ conversationId, page = 1, limit = 30 }, { rejectWithValue }) => {
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/api/chat/messages/${conversationId}?page=${page}&limit=${limit}`,
        { withCredentials: true }
      );
      return { conversationId, ...res.data }; // { messages, meta }
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

const messageSlice = createSlice({
  name: "messages",
  initialState: {
    byConversation: {}, // { conversationId: { list: [], meta: {}, loading, error } }
  },
  reducers: {
    addMessage: (state, action) => {
      const { conversationId, message } = action.payload;
      if (!state.byConversation[conversationId]) {
        state.byConversation[conversationId] = {
          list: [],
          meta: { page: 1, limit: 30, total: 0 },
          loading: false,
          error: null,
        };
      }
      state.byConversation[conversationId].list.push(message);
    },
    markAsRead: (state, action) => {
      const { conversationId, messageIds } = action.payload;
      const conversation = state.byConversation[conversationId];
      if (!conversation) return;

      conversation.list = conversation.list.map((msg) =>
        messageIds.includes(msg._id) ? { ...msg, isRead: true } : msg
      );
    },

    deleteMessage: (state, action) => {
      const { conversationId, messageId, userId } = action.payload;
      const conversation = state.byConversation[conversationId];
      if (!conversation) return;

      conversation.list = conversation.list.map((msg) => {
        if (msg._id === messageId) {
          return {
            ...msg,
            deletedFor: msg.deletedFor
              ? Array.isArray(msg.deletedFor)
                ? [...msg.deletedFor, userId]
                : [msg.deletedFor, userId]
              : [userId],
          };
        }
        return msg;
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.pending, (state, action) => {
        const { conversationId } = action.meta.arg;
        if (!state.byConversation[conversationId]) {
          state.byConversation[conversationId] = {
            list: [],
            meta: { page: 1, limit: 30, total: 0 },
            loading: false,
            error: null,
          };
        }
        state.byConversation[conversationId].loading = true;
        state.byConversation[conversationId].error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        const { conversationId, messages, meta } = action.payload;
        state.byConversation[conversationId].loading = false;
        // Replace list for first page, append for others
        if (meta.page === 1) {
          state.byConversation[conversationId].list = messages;
        } else {
          state.byConversation[conversationId].list = [
            ...messages,
            ...state.byConversation[conversationId].list,
          ];
        }
        state.byConversation[conversationId].meta = meta;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        const { conversationId } = action.meta.arg;
        state.byConversation[conversationId].loading = false;
        state.byConversation[conversationId].error = action.payload;
      });
  },
});

export const { addMessage, markAsRead, deleteMessage } = messageSlice.actions;

export default messageSlice.reducer;
