import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getSocket } from "../utils/socket";
import {
  updateConversationLastMessage,
  incrementUnread,
  resetUnread,
} from "../utils/redux/conversationSlice";
import {
  addMessage,
  markAsRead,
  deleteMessage,
} from "../utils/redux/messageSlice";
import {
  setOnlineUsers,
  setTyping,
  updateUserStatus,
} from "../utils/redux/chatUISlice";

const SocketProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);

  // Memoize handlers to prevent unnecessary re-renders
  const handleReceiveMessage = useCallback(
    (messageData) => {
      dispatch(
        addMessage({
          conversationId: messageData.conversationId,
          message: messageData,
        })
      );

      dispatch(
        updateConversationLastMessage({
          conversationId: messageData.conversationId,
          lastMessage: messageData,
        })
      );

      // Use current activeConversationId from the callback parameter
      dispatch((_, getState) => {
        const currentActiveId = getState().chatUI.activeConversationId;
        const currentUserId = getState().user.user?._id;

        if (
          currentActiveId !== messageData.conversationId &&
          messageData.receiver._id === currentUserId
        ) {
          dispatch(
            incrementUnread({ conversationId: messageData.conversationId })
          );
        }
      });
    },
    [dispatch]
  );

  const handleUserTyping = useCallback(
    ({ conversationId, userId, isTyping }) => {
      dispatch(setTyping({ conversationId, userId, isTyping }));
    },
    [dispatch]
  );

  const handleOnlineUsers = useCallback(
    (users) => {
      const userMap = {};
      users.forEach(({ userId, user: userData, isOnline, lastSeen }) => {
        userMap[userId] = {
          userId,
          user: userData,
          isOnline: isOnline ?? true,
          lastSeen,
        };
      });
      dispatch(setOnlineUsers(userMap));
    },
    [dispatch]
  );

  const handleUserStatusChange = useCallback(
    ({ userId, isOnline, lastSeen }) => {
      dispatch(updateUserStatus({ userId, isOnline, lastSeen }));
    },
    [dispatch]
  );

  const handleMessagesRead = useCallback(
    ({ conversationId, messageIds }) => {
      dispatch(markAsRead({ conversationId, messageIds }));
      dispatch(resetUnread({ conversationId }));
    },
    [dispatch]
  );

  const handleMessageDeleted = useCallback(
    ({ messageId, conversationId, deletedBy }) => {
      dispatch(deleteMessage({ conversationId, messageId, userId: deletedBy }));
    },
    [dispatch]
  );

  const handleError = useCallback(({ message }) => {
    console.error("Socket error:", message);
  }, []);

  useEffect(() => {
    if (!user) return;

    const socket = getSocket();

    // Ensure socket is connected
    if (!socket.connected) {
      socket.connect();
    }

    // Add a small delay to ensure connection is established
    const setupListeners = () => {
      // Request current online users immediately after connection
      socket.emit("requestOnlineUsers");

      // Setup all event listeners
      socket.on("receiveMessage", handleReceiveMessage);
      socket.on("userTyping", handleUserTyping);
      socket.on("onlineUsers", handleOnlineUsers);
      socket.on("userStatusChange", handleUserStatusChange);
      socket.on("messagesRead", handleMessagesRead);
      socket.on("messageDeleted", handleMessageDeleted);
      socket.on("error", handleError);

      // Listen for connection events to handle reconnections
      socket.on("connect", () => {
        console.log("Socket connected successfully");
        socket.emit("requestOnlineUsers"); // Re-request on reconnect
      });

      socket.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason);
      });
    };

    if (socket.connected) {
      setupListeners();
    } else {
      socket.once("connect", setupListeners);
    }

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("userTyping", handleUserTyping);
      socket.off("onlineUsers", handleOnlineUsers);
      socket.off("userStatusChange", handleUserStatusChange);
      socket.off("messagesRead", handleMessagesRead);
      socket.off("messageDeleted", handleMessageDeleted);
      socket.off("error", handleError);
      socket.off("connect");
      socket.off("disconnect");
    };
  }, [
    user,
    handleReceiveMessage,
    handleUserTyping,
    handleOnlineUsers,
    handleUserStatusChange,
    handleMessagesRead,
    handleMessageDeleted,
    handleError,
  ]);

  return children;
};

export default SocketProvider;
