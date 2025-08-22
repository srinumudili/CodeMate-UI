import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./userSlice.js";
import feedSlice from "./feedSlice.js";
import connectionSlice from "./connectionSlice.js";
import requestSlice from "./requestSlice.js";
import uploadSlice from "./uploadSlice.js";
import conversationSlice from "./conversationSlice.js";
import chatUISlice from "./chatUISlice.js";
import messageSlice from "./messageSlice";

const appStore = configureStore({
  reducer: {
    user: userSlice,
    feed: feedSlice,
    connections: connectionSlice,
    requests: requestSlice,
    upload: uploadSlice,
    conversations: conversationSlice,
    messages: messageSlice,
    chatUI: chatUISlice,
  },
});

export default appStore;
