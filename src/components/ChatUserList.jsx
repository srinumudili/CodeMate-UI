// ChatUserList.jsx - Sidebar component with conversations and connections
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  createConversation,
  fetchConversations,
} from "../utils/redux/conversationSlice";
import { fetchConnections } from "../utils/redux/connectionSlice";
import { setActiveConversation } from "../utils/redux/chatUISlice";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { MessageSquare, Search } from "lucide-react";

dayjs.extend(relativeTime);

const ChatUserList = ({ onConversationSelect }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const { list: conversations, loading: conversationsLoading } = useSelector(
    (state) => state.conversations
  );
  const { list: connections, loading: connectionsLoading } = useSelector(
    (state) => state.connections
  );

  const { activeConversationId, onlineUsers } = useSelector(
    (state) => state.chatUI
  );

  const [activeTab, setActiveTab] = useState("conversations");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (activeTab === "conversations" && conversations.length === 0) {
      dispatch(fetchConversations({ page: 1, limit: 20 }));
    } else if (activeTab === "connections" && connections.length === 0) {
      dispatch(fetchConnections({ page: 1, limit: 20 }));
    }
  }, [activeTab, dispatch, conversations.length, connections.length]);

  const handleStartConversation = async (connectionId) => {
    try {
      if (!user?._id) return;

      const existingConv = conversations.find((conv) => {
        const participantIds = conv.participants.map((p) => p._id.toString());
        return (
          participantIds.includes(user._id.toString()) &&
          participantIds.includes(connectionId.toString()) &&
          participantIds.length === 2
        );
      });

      if (existingConv) {
        onConversationSelect(existingConv._id);
        dispatch(setActiveConversation(existingConv._id));
        setActiveTab("conversations");
      } else {
        const result = await dispatch(
          createConversation({ participantId: connectionId })
        ).unwrap();

        if (result?.conversation) {
          onConversationSelect(result.conversation._id);
          dispatch(setActiveConversation(result.conversation._id));
          setActiveTab("conversations");
          dispatch(fetchConversations({ page: 1, limit: 20 }));
        }
      }
    } catch (error) {
      console.error("Failed to start conversation:", error);
    }
  };
  const filteredConversations = searchTerm.trim()
    ? conversations.filter((conv) => {
        const otherParticipant = conv.participants.find(
          (p) => p._id !== user._id
        );
        const fullName =
          `${otherParticipant?.firstName} ${otherParticipant?.lastName}`.toLowerCase();
        return fullName.includes(searchTerm.toLowerCase());
      })
    : conversations;

  const filteredConnections = searchTerm.trim()
    ? connections.filter((conn) => {
        const fullName = `${conn.firstName} ${conn.lastName}`.toLowerCase();
        return fullName.includes(searchTerm.toLowerCase());
      })
    : connections;

  const uniqueConversations = Array.from(
    new Map(filteredConversations.map((conv) => [conv._id, conv])).values()
  );

  const uniqueConnections = Array.from(
    new Map(filteredConnections.map((conn) => [conn._id, conn])).values()
  );

  const formatLastMessage = (message) => {
    if (!message) return "";

    if (message.text) {
      return message.text.length > 40
        ? `${message.text.substring(0, 40)}...`
        : message.text;
    }

    if (message.attachments?.length > 0) {
      return `📎 ${message.attachments.length} attachment${
        message.attachments.length > 1 ? "s" : ""
      }`;
    }

    return "";
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";

    const now = dayjs();
    const msgTime = dayjs(timestamp);

    if (msgTime.isSame(now, "day")) {
      return msgTime.format("h:mm A");
    } else if (msgTime.isSame(now.subtract(1, "day"), "day")) {
      return "Yesterday";
    } else if (msgTime.isAfter(now.subtract(1, "week"))) {
      return msgTime.format("ddd");
    } else {
      return msgTime.format("MM/DD/YY");
    }
  };

  const getOnlineStatus = (userId) => {
    const userStatus = onlineUsers[userId];
    return userStatus?.isOnline || false;
  };

  const getLastSeen = (userId) => {
    const userStatus = onlineUsers[userId];
    if (userStatus?.isOnline) return "Online";
    if (userStatus?.lastSeen) {
      return `Last seen ${dayjs(userStatus.lastSeen).fromNow()}`;
    }
    return "";
  };

  const ConversationItem = ({ conversation }) => {
    const otherParticipant = conversation.participants.find(
      (p) => p._id !== user._id
    );
    const isActive = activeConversationId === conversation._id;
    const isOnline = getOnlineStatus(otherParticipant?._id);
    const unreadCount = conversation.unreadCount || 0;

    const getUnreadLabel = () => {
      if (unreadCount === 1) {
        return formatLastMessage(conversation.lastMessage);
      } else if (unreadCount > 1 && unreadCount <= 4) {
        return `${unreadCount} new message${unreadCount > 1 ? "s" : ""}`;
      } else if (unreadCount > 4) {
        return "4+ new messages";
      } else {
        return formatLastMessage(conversation.lastMessage);
      }
    };

    return (
      <div
        className={`flex items-center gap-3 p-3 cursor-pointer rounded-xl transition-all duration-200
        ${
          isActive
            ? "bg-primary/10 border-l-4 border-primary"
            : "hover:bg-base-200"
        }`}
        onClick={() => onConversationSelect(conversation._id)}
      >
        <div className="relative">
          <div className="avatar">
            <div className="w-12 h-12 rounded-full ring-1 ring-base-300 shadow-sm">
              <img
                src={otherParticipant?.profileUrl}
                alt={`${otherParticipant?.firstName} ${otherParticipant?.lastName}`}
              />
            </div>
          </div>
          <div
            className={`absolute bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-base-100 ${
              isOnline ? "bg-green-500" : "bg-gray-400"
            }`}
          ></div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4
              className={`truncate text-sm ${
                unreadCount > 0
                  ? "font-semibold text-base-content"
                  : "font-medium text-base-content/90"
              }`}
            >
              {otherParticipant?.firstName} {otherParticipant?.lastName}
            </h4>
            <span className="text-xs text-base-content/60 flex-shrink-0">
              {formatTimestamp(conversation.updatedAt)}
            </span>
          </div>

          <p
            className={`text-xs truncate ${
              unreadCount > 0
                ? "font-semibold text-base-content"
                : "text-base-content/60"
            }`}
          >
            {getUnreadLabel()}
          </p>
        </div>
      </div>
    );
  };

  const ConnectionItem = ({ connection }) => {
    const isOnline = getOnlineStatus(connection._id);
    const lastSeen = getLastSeen(connection._id);

    return (
      <div
        className="flex items-center gap-3 p-3 cursor-pointer rounded-xl transition-all duration-200 hover:bg-base-200"
        onClick={() => handleStartConversation(connection._id)}
      >
        <div className="relative">
          <div className="avatar">
            <div className="w-12 h-12 rounded-full ring-1 ring-base-300 shadow-sm">
              <img
                src={connection.profileUrl}
                alt={`${connection.firstName} ${connection.lastName}`}
              />
            </div>
          </div>
          <div
            className={`absolute bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-base-100 ${
              isOnline ? "bg-green-500" : "bg-gray-400"
            }`}
          ></div>
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium truncate">
            {connection.firstName} {connection.lastName}
          </h4>
          <p className="text-xs text-base-content/60 truncate">{lastSeen}</p>
        </div>

        <div className="flex-shrink-0 text-base-content/40">
          <MessageSquare className="w-5 h-5 text-base-content/40" />
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full font-sans">
      {/* Header + Search + Tabs pinned */}
      <div className="sticky top-0 z-10 bg-base-100 border-b border-base-300">
        <div className="p-4">
          <h2 className="text-lg font-bold tracking-tight">Messages</h2>

          {/* Search */}
          <div className="relative mt-3">
            <input
              type="text"
              placeholder="Search..."
              className="input input-bordered input-sm w-full pl-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-base-content/60" />
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs tabs-box tabs-sm justify-center px-2 pb-2">
          <button
            className={`tab px-4 ${
              activeTab === "conversations" ? "tab-active font-semibold" : ""
            }`}
            onClick={() => setActiveTab("conversations")}
          >
            Chats
          </button>
          <button
            className={`tab px-4 ${
              activeTab === "connections" ? "tab-active font-semibold" : ""
            }`}
            onClick={() => setActiveTab("connections")}
          >
            Connections
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-2">
        {activeTab === "conversations" ? (
          <div>
            {conversationsLoading ? (
              <div className="flex justify-center py-8">
                <div className="loading loading-spinner loading-md text-primary"></div>
              </div>
            ) : uniqueConversations.length > 0 ? (
              <div className="space-y-1">
                {uniqueConversations.map((conversation) => (
                  <ConversationItem
                    key={conversation._id}
                    conversation={conversation}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 px-4">
                <p className="text-base-content/60 text-sm">
                  {searchTerm
                    ? "No conversations found"
                    : "No conversations yet"}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div>
            {connectionsLoading ? (
              <div className="flex justify-center py-8">
                <div className="loading loading-spinner loading-md text-primary"></div>
              </div>
            ) : uniqueConnections.length > 0 ? (
              <div className="space-y-1">
                {uniqueConnections.map((connection) => (
                  <ConnectionItem
                    key={connection._id}
                    connection={connection}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 px-4">
                <p className="text-base-content/60 text-sm">
                  {searchTerm ? "No connections found" : "No connections yet"}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatUserList;
