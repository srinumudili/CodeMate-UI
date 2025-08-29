import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { useSelector, useDispatch } from "react-redux";
import { getSocket } from "../utils/socket";
import { fetchMessages, markAsRead } from "../utils/redux/messageSlice";
import { resetUnread } from "../utils/redux/conversationSlice";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import isToday from "dayjs/plugin/isToday";
import isYesterday from "dayjs/plugin/isYesterday";
import { ArrowLeft, Check, Trash2 } from "lucide-react";

dayjs.extend(relativeTime);
dayjs.extend(isToday);
dayjs.extend(isYesterday);

const ChatWindow = ({ conversationId, onBackToList, isMobile }) => {
  const dispatch = useDispatch();
  const socket = getSocket();
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);

  const { user } = useSelector((state) => state.user);
  const { list: conversations } = useSelector((state) => state.conversations);
  const messageData = useSelector(
    (state) => state.messages.byConversation[conversationId]
  );
  const { onlineUsers, typingByConversationId } = useSelector(
    (state) => state.chatUI
  );

  const [messageText, setMessageText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const conversation = conversations.find((c) => c._id === conversationId);
  const otherParticipant = conversation?.participants.find(
    (p) => p._id !== user._id
  );

  // Ensure messages is always an array
  const messages = useMemo(() => messageData?.list || [], [messageData]);
  const loading = messageData?.loading || false;

  const isOtherUserOnline =
    onlineUsers[otherParticipant?._id]?.isOnline || false;
  const otherUserLastSeen = onlineUsers[otherParticipant?._id]?.lastSeen;

  // Typing status of other user
  const isOtherUserTyping = useMemo(() => {
    if (!conversationId || !otherParticipant) return false;
    return !!typingByConversationId?.[conversationId]?.[otherParticipant._id];
  }, [typingByConversationId, conversationId, otherParticipant]);

  // WhatsApp-like Last Seen Formatter
  const formatLastSeen = (lastSeenTimestamp) => {
    if (!lastSeenTimestamp) return "last seen a long time ago";

    const lastSeen = dayjs(lastSeenTimestamp);
    const now = dayjs();
    const diffInMinutes = now.diff(lastSeen, "minute");
    const diffInHours = now.diff(lastSeen, "hour");
    const diffInDays = now.diff(lastSeen, "day");

    // Just now (less than 1 minute)
    if (diffInMinutes < 1) {
      return "last seen just now";
    }

    // Minutes ago (1-59 minutes)
    if (diffInMinutes < 60) {
      return `last seen ${diffInMinutes} minute${
        diffInMinutes > 1 ? "s" : ""
      } ago`;
    }

    // Hours ago (1-23 hours)
    if (diffInHours < 24) {
      return `last seen ${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
    }

    // Today
    if (lastSeen.isToday()) {
      return `last seen today at ${lastSeen.format("h:mm A")}`;
    }

    // Yesterday
    if (lastSeen.isYesterday()) {
      return `last seen yesterday at ${lastSeen.format("h:mm A")}`;
    }

    // This week (within 7 days)
    if (diffInDays <= 7) {
      return `last seen ${lastSeen.format("dddd")} at ${lastSeen.format(
        "h:mm A"
      )}`;
    }

    // More than a week ago
    return `last seen ${lastSeen.format("MM/DD/YYYY")} at ${lastSeen.format(
      "h:mm A"
    )}`;
  };

  // Get user status text
  const getUserStatusText = () => {
    if (isOtherUserTyping) {
      return "typing...";
    }

    if (isOtherUserOnline) {
      return "online";
    }

    return formatLastSeen(otherUserLastSeen);
  };

  // Get status color based on online status
  const getStatusColor = () => {
    if (isOtherUserTyping) {
      return "text-blue-500"; // Blue for typing
    }

    if (isOtherUserOnline) {
      return "text-green-500"; // Green for online
    }

    return "text-base-content/50"; // Gray for offline/last seen
  };

  // Load messages when conversation changes
  useEffect(() => {
    if (!conversationId) return;

    dispatch(fetchMessages({ conversationId, page: 1, limit: 30 }));
    dispatch(resetUnread({ conversationId }));
  }, [conversationId, dispatch]);

  // Auto mark messages as read whenever messages change
  useEffect(() => {
    if (!conversationId || !socket) return;

    // Safe access to messages
    const unreadMessages = (messages || [])
      .filter((msg) => !msg.isRead && msg.receiver._id === user._id)
      .map((msg) => msg._id);

    if (unreadMessages.length > 0) {
      socket.emit("markAsRead", { conversationId, messageIds: unreadMessages });
      dispatch(markAsRead({ conversationId, messageIds: unreadMessages }));
      dispatch(resetUnread({ conversationId }));
    }
  }, [messages, conversationId, socket, dispatch, user._id]);

  // Typing indicator
  const handleTyping = (text) => {
    setMessageText(text);

    if (!isTyping && text.trim()) {
      setIsTyping(true);
      socket?.emit("typing", { conversationId, isTyping: true });
    }

    if (typingTimeout) clearTimeout(typingTimeout);

    const newTimeout = setTimeout(() => {
      setIsTyping(false);
      socket?.emit("typing", { conversationId, isTyping: false });
    }, 1000);

    setTypingTimeout(newTimeout);

    if (!text.trim() && isTyping) {
      setIsTyping(false);
      socket?.emit("typing", { conversationId, isTyping: false });
    }
  };

  // Scroll to bottom (target the messages container, not the page)
  const scrollToBottom = useCallback((smooth = true) => {
    const el = messagesContainerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
  }, []);

  useEffect(() => {
    scrollToBottom(true);
  }, [messages?.length, isOtherUserTyping, scrollToBottom]);

  // when switching conversations, snap to bottom without page scroll
  useEffect(() => {
    scrollToBottom(false);
  }, [conversationId, scrollToBottom]);

  // Handle scroll: pagination & markAsRead
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;

    // Mark messages as read if near bottom
    const unreadMessages = (messages || [])
      .filter((msg) => !msg.isRead && msg.receiver._id === user._id)
      .map((msg) => msg._id);

    if (
      scrollHeight - scrollTop - clientHeight < 50 &&
      unreadMessages.length > 0
    ) {
      socket.emit("markAsRead", {
        conversationId,
        messageIds: unreadMessages,
      });
      dispatch(markAsRead({ conversationId, messageIds: unreadMessages }));
      dispatch(resetUnread({ conversationId }));
    }

    // Pagination for older messages
    if (scrollTop === 0 && !isLoadingMore && messageData?.meta?.page > 1) {
      setIsLoadingMore(true);
      dispatch(
        fetchMessages({
          conversationId,
          page: messageData.meta.page + 1,
          limit: 30,
        })
      ).finally(() => setIsLoadingMore(false));
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim() || !socket || !otherParticipant) return;

    const text = messageText.trim();
    setMessageText("");
    setIsTyping(false);
    socket.emit("typing", { conversationId, isTyping: false });

    socket.emit("sendMessage", {
      conversationId,
      receiverId: otherParticipant._id,
      text,
      attachments: [],
    });

    inputRef.current?.focus();
  };

  const handleDeleteMessage = (messageId) => {
    if (socket) {
      socket.emit("deleteMessage", { messageId, conversationId });
    }
  };

  const formatMessageTime = (timestamp) => dayjs(timestamp).format("h:mm A");

  const formatDateHeader = (timestamp) => {
    const date = dayjs(timestamp);
    if (date.isToday()) return "Today";
    if (date.isYesterday()) return "Yesterday";
    return date.format("MMMM DD, YYYY");
  };

  // Deduplicate messages by _id
  const uniqueMessages = useMemo(() => {
    const seen = new Map();
    return (messages || []).filter((msg) => {
      if (seen.has(msg._id)) return false;
      seen.set(msg._id, true);
      return true;
    });
  }, [messages]);

  // Group messages by date
  const groupedMessages = useMemo(() => {
    const groups = [];
    let currentDate = null;
    let currentGroup = [];

    (uniqueMessages || []).forEach((message) => {
      const messageDate = dayjs(message.createdAt).format("YYYY-MM-DD");

      if (messageDate !== currentDate) {
        if (currentGroup.length > 0) {
          groups.push({ date: currentDate, messages: currentGroup });
        }
        currentDate = messageDate;
        currentGroup = [message];
      } else {
        currentGroup.push(message);
      }
    });

    if (currentGroup.length > 0) {
      groups.push({ date: currentDate, messages: currentGroup });
    }

    return groups;
  }, [uniqueMessages]);

  const MessageBubble = ({ message, showAvatar = false, isMobile }) => {
    const [showDelete, setShowDelete] = useState(false);
    const isOwnMessage = message.sender._id === user._id;
    const isDeleted = message.deletedFor?.includes(user._id);

    // Timer for long-press
    const longPressTimer = useRef(null);

    const handleTouchStart = () => {
      longPressTimer.current = setTimeout(() => {
        setShowDelete(true); // reveal delete on long press
      }, 600); // 600ms long press threshold
    };

    const handleTouchEnd = () => {
      clearTimeout(longPressTimer.current);
    };

    if (isDeleted) {
      return (
        <div
          className={`flex ${
            isOwnMessage ? "justify-end" : "justify-start"
          } mb-2`}
        >
          {showAvatar && !isOwnMessage && (
            <img
              src={message.sender.profileUrl}
              alt={message.sender.firstName}
              className="w-6 h-6 rounded-full mr-2 self-end"
            />
          )}
          <div className="max-w-xs lg:max-w-md relative">
            <div className="px-3 py-2 rounded-2xl bg-base-200 text-base-content/60 italic">
              This message was deleted
            </div>
            {/* Time only (no ticks for deleted messages) */}
            <div className="flex justify-end mt-1 text-[10px] text-base-content/40">
              {formatMessageTime(message.createdAt)}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        className={`flex ${
          isOwnMessage ? "justify-end" : "justify-start"
        } mb-2 group`}
        onTouchStart={isMobile ? handleTouchStart : undefined}
        onTouchEnd={isMobile ? handleTouchEnd : undefined}
      >
        {showAvatar && !isOwnMessage && (
          <img
            src={message.sender.profileUrl}
            alt={message.sender.firstName}
            className="w-8 h-8 rounded-full mr-2 self-end"
          />
        )}
        <div className="max-w-xs lg:max-w-md relative">
          <div
            className={`px-3 py-2 rounded-2xl break-words ${
              isOwnMessage
                ? "bg-accent text-accent-content ml-auto"
                : "bg-base-200 text-base-content"
            }`}
          >
            {message.text}

            {/* Time + ticks inside bubble */}
            <div className="flex items-center justify-end mt-1 space-x-1 text-[10px] text-base-content/60">
              <span>{formatMessageTime(message.createdAt)}</span>
              {isOwnMessage &&
                (message.isRead ? (
                  <div className="flex -space-x-1">
                    <Check size={12} className="text-blue-500" />
                    <Check size={12} className="text-blue-500" />
                  </div>
                ) : (
                  <Check size={12} className="text-gray-400" />
                ))}
            </div>
          </div>

          {/* Delete button (own messages only) */}
          {isOwnMessage && (
            <button
              onClick={() => handleDeleteMessage(message._id)}
              className={`${
                isMobile
                  ? showDelete
                    ? "opacity-100"
                    : "opacity-0"
                  : "opacity-0 group-hover:opacity-100"
              } transition-opacity btn btn-ghost btn-xs absolute -left-6 top-1/2 -translate-y-1/2`}
              title="Delete message"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    );
  };

  if (!conversation || !otherParticipant) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-base-100">
      {/* Fixed Header */}
      <div className="flex items-center p-4 border-b border-base-300 bg-base-100 z-20 flex-shrink-0">
        {isMobile && (
          <button
            onClick={onBackToList}
            className="btn btn-ghost btn-sm btn-circle mr-3"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <div className="relative">
          <div className="avatar">
            <div className="w-10 rounded-full">
              <img
                src={otherParticipant.profileUrl}
                alt={`${otherParticipant.firstName} ${otherParticipant.lastName}`}
              />
            </div>
          </div>
          {isOtherUserOnline && (
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
          )}
        </div>
        <div className="ml-3 flex-1">
          <div className="font-semibold">
            {otherParticipant.firstName} {otherParticipant.lastName}
          </div>
          <div
            className={`text-xs ${getStatusColor()} transition-colors duration-200`}
          >
            {getUserStatusText()}
          </div>
        </div>
      </div>

      {/* Scrollable Messages - This will expand/contract with keyboard */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto overscroll-contain px-4 space-y-2 bg-base-100"
        style={{
          minHeight: 0, // Important for proper flex behavior
        }}
      >
        {loading && <div className="loading loading-spinner loading-md"></div>}
        {groupedMessages.map((group) => (
          <div key={group.date} className="space-y-2">
            <div className="flex justify-center my-4">
              <span className="badge badge-outline text-xs">
                {formatDateHeader(group.date)}
              </span>
            </div>

            {group.messages.map((msg, idx) => {
              const nextMsg = group.messages[idx + 1];
              const isOwnMessage = msg.sender._id === user._id;
              const showAvatar =
                !isOwnMessage &&
                (!nextMsg || nextMsg.sender._id !== msg.sender._id);

              return (
                <MessageBubble
                  key={`${msg._id}-${msg.createdAt}`}
                  message={msg}
                  showAvatar={showAvatar}
                />
              );
            })}
          </div>
        ))}
        {isOtherUserTyping && (
          <div className="flex items-center mb-2 animate-fade-in">
            <img
              src={otherParticipant.profileUrl}
              alt={otherParticipant.firstName}
              className="w-6 h-6 rounded-full mr-2 self-end"
            />
            <div className="px-3 py-2 rounded-2xl bg-base-200 text-base-content flex space-x-1">
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Fixed Input - Will stay at bottom even with keyboard */}
      <form
        onSubmit={handleSendMessage}
        className="flex items-center space-x-2 p-3 border-t border-base-300 bg-base-100 z-20 flex-shrink-0"
        style={{
          paddingBottom: isMobile ? "env(safe-area-inset-bottom)" : "12px",
        }}
      >
        <input
          ref={inputRef}
          type="text"
          placeholder="Type a message..."
          value={messageText}
          onChange={(e) => handleTyping(e.target.value)}
          className="input input-bordered input-sm flex-1"
        />
        <button type="submit" className="btn btn-primary btn-sm">
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
