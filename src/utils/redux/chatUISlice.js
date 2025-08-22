// src/utils/redux/chatUISlice.js
import { createSlice } from "@reduxjs/toolkit";

const chatUISlice = createSlice({
  name: "chatUI",
  initialState: {
    activeConversationId: null,
    typingByConversationId: {},
    onlineUsers: {},
  },
  reducers: {
    setActiveConversation: (state, action) => {
      state.activeConversationId = action.payload;
    },
    setTyping: (state, action) => {
      const { conversationId, userId, isTyping } = action.payload;
      if (!state.typingByConversationId[conversationId]) {
        state.typingByConversationId[conversationId] = {};
      }

      if (isTyping) {
        state.typingByConversationId[conversationId][userId] = true;
      } else {
        delete state.typingByConversationId[conversationId][userId];
        if (
          Object.keys(state.typingByConversationId[conversationId]).length === 0
        ) {
          delete state.typingByConversationId[conversationId];
        }
      }
    },

    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    updateUserStatus: (state, action) => {
      const { userId, isOnline, lastSeen } = action.payload;

      state.onlineUsers[userId] = {
        ...(state.onlineUsers[userId] || { userId }),
        isOnline,
        lastSeen: isOnline ? null : lastSeen || new Date().toISOString(),
      };
    },

    resetChatUI: (state) => {
      state.activeConversationId = null;
      state.typingByConversationId = {};
      state.onlineUsers = {};
    },
  },
});

export const {
  setActiveConversation,
  setTyping,
  setOnlineUsers,
  updateUserStatus,
  resetChatUI,
} = chatUISlice.actions;

export default chatUISlice.reducer;
