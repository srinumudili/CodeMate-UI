import { useEffect } from "react";
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
  const { activeConversationId } = useSelector((state) => state.chatUI);

  useEffect(() => {
    if (!user) return;

    const socket = getSocket();
    if (!socket.connected) socket.connect();

    /** 🔹 Setup listeners once after login */
    const handleReceiveMessage = (messageData) => {
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

      // increment unread if not active chat
      if (
        activeConversationId !== messageData.conversationId &&
        messageData.receiver._id === user._id
      ) {
        dispatch(
          incrementUnread({ conversationId: messageData.conversationId })
        );
      }
    };

    const handleUserTyping = ({ conversationId, userId, isTyping }) => {
      dispatch(setTyping({ conversationId, userId, isTyping }));
    };

    const handleOnlineUsers = (users) => {
      const userMap = {};
      users.forEach(({ userId }) => {
        userMap[userId] = { userId, isOnline: true, lastSeen: null };
      });
      dispatch(setOnlineUsers(userMap));
    };

    const handleUserStatusChange = ({ userId, isOnline, lastSeen }) => {
      dispatch(updateUserStatus({ userId, isOnline, lastSeen }));
    };

    const handleMessagesRead = ({ conversationId, messageIds }) => {
      dispatch(markAsRead({ conversationId, messageIds }));
      dispatch(resetUnread({ conversationId }));
    };

    const handleMessageDeleted = ({ messageId, conversationId, deletedBy }) => {
      dispatch(deleteMessage({ conversationId, messageId, userId: deletedBy }));
    };

    const handleError = ({ message }) => {
      console.error("Socket error:", message);
    };

    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("userTyping", handleUserTyping);
    socket.on("onlineUsers", handleOnlineUsers);
    socket.on("userStatusChange", handleUserStatusChange);
    socket.on("messagesRead", handleMessagesRead);
    socket.on("messageDeleted", handleMessageDeleted);
    socket.on("error", handleError);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("userTyping", handleUserTyping);
      socket.off("onlineUsers", handleOnlineUsers);
      socket.off("userStatusChange", handleUserStatusChange);
      socket.off("messagesRead", handleMessagesRead);
      socket.off("messageDeleted", handleMessageDeleted);
      socket.off("error", handleError);
    };
  }, [user, activeConversationId, dispatch]);

  return children;
};

export default SocketProvider;
