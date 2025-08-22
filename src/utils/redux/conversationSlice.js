import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

//Thunk for fetchConversations
export const fetchConversations = createAsyncThunk(
  "conversations/fetchConversations",
  async ({ page = 1, limit = 20 }, { rejectWithValue }) => {
    try {
      const res = await axios.get(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/api/chat/conversations?page=${page}&limit=${limit}`,
        { withCredentials: true }
      );
      return res.data; // { conversations, meta }
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

// Create or get conversation with a connection
export const createConversation = createAsyncThunk(
  "conversations/createConversation",
  async ({ participantId }, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/chat/conversation`,
        { participantId },
        { withCredentials: true }
      );
      return res.data;
    } catch (error) {
      const message =
        error?.response?.data?.error || "Failed to create conversation";
      return rejectWithValue({ message });
    }
  }
);

const conversationSlice = createSlice({
  name: "conversations",
  initialState: {
    list: [],
    meta: { page: 1, limit: 20, total: 0 },
    loading: false,
    error: null,
    creatingConversation: false,
    totalUnread: 0,
  },
  reducers: {
    addConversation: (state, action) => {
      const newConversation = action.payload;

      if (!state.list.some((conv) => conv._id === newConversation._id)) {
        state.list.unshift(newConversation);
      }
    },
    updateConversationLastMessage: (state, action) => {
      const { conversationId, lastMessage } = action.payload;

      const conversation = state.list.find(
        (convo) => convo._id === conversationId
      );

      if (conversation) {
        // Update message and timestamp
        conversation.lastMessage = lastMessage;
        conversation.updatedAt = lastMessage.createdAt;

        //Move to top
        state.list = [
          conversation,
          ...state.list.filter((c) => c._id !== conversationId),
        ];
      }
    },
    incrementUnread: (state, action) => {
      const { conversationId } = action.payload;

      const conversation = state.list.find((c) => c._id === conversationId);
      if (conversation) {
        conversation.unreadCount = (conversation.unreadCount || 0) + 1;
        state.totalUnread = state.list.reduce(
          (total, c) => total + (c.unreadCount || 0),
          0
        );
      }
    },
    resetUnread: (state, action) => {
      const { conversationId } = action.payload;

      const conversation = state.list.find((c) => c._id === conversationId);
      if (conversation) {
        conversation.unreadCount = 0;
      }
      state.totalUnread = state.list.reduce(
        (total, c) => total + (c.unreadCount || 0),
        0
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.conversations.map((c) => ({
          ...c,
          unreadCount: c.unreadCount || 0,
        }));
        state.meta = action.payload.meta;
        state.totalUnread = state.list.reduce(
          (total, c) => total + (c.unreadCount || 0),
          0
        );
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // createConversation
      .addCase(createConversation.pending, (state) => {
        state.creatingConversation = true;
        state.error = null;
      })
      .addCase(createConversation.fulfilled, (state, action) => {
        state.creatingConversation = false;
        // optionally auto-add the created conversation if backend returns it
        if (action.payload?.conversation) {
          const newConv = action.payload.conversation;
          if (!state.list.some((conv) => conv._id === newConv._id)) {
            state.list.unshift(newConv);
          }
        }
      })
      .addCase(createConversation.rejected, (state, action) => {
        state.creatingConversation = false;
        state.error = action.payload;
      });
  },
});

export const {
  addConversation,
  updateConversationLastMessage,
  incrementUnread,
  resetUnread,
} = conversationSlice.actions;

export default conversationSlice.reducer;
