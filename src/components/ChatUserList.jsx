// ChatUserList.jsx
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  createConversation,
  fetchConversations,
  addConversation,
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

  const getOnlineStatus = (userId) => onlineUsers[userId]?.isOnline || false;
  const getLastSeen = (userId) => {
    const userStatus = onlineUsers[userId];
    if (userStatus?.isOnline) return "Online";
    if (userStatus?.lastSeen) {
      return `Last seen ${dayjs(userStatus.lastSeen).fromNow()}`;
    }
    return "";
  };

  // ✅ Conversation item
  const ConversationItem = ({ conversation }) => {
    const otherParticipant = conversation.participants.find(
      (p) => p._id !== user._id
    );
    if (!otherParticipant) return null;

    const isActive = activeConversationId === conversation._id;
    const isOnline = getOnlineStatus(otherParticipant._id);
    const unreadCount = conversation.unreadCount || 0;

    return (
      <div
        onClick={() => onConversationSelect(conversation._id)}
        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200
        ${
          isActive
            ? "bg-primary/15 border-l-4 border-primary shadow-sm"
            : "hover:bg-base-200"
        }`}
      >
        {/* Avatar */}
        <div className="relative">
          <div className="avatar">
            <div className="w-12 h-12 rounded-full ring ring-base-300 overflow-hidden">
              <img
                src={otherParticipant.profileUrl}
                alt={`${otherParticipant.firstName}`}
                onError={(e) => {
                  e.target.src = "";
                }}
              />
            </div>
          </div>
          {/* Online dot */}
          <span
            className={`absolute bottom-1 right-0 w-3.5 h-3.5 rounded-full border-2 border-base-100 ${
              isOnline ? "bg-green-500" : "bg-gray-400"
            }`}
          ></span>
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4
              className={`truncate text-sm ${
                unreadCount > 0
                  ? "font-semibold text-base-content"
                  : "font-medium text-base-content/80"
              }`}
            >
              {otherParticipant.firstName} {otherParticipant.lastName}
            </h4>
            <span className="text-xs text-base-content/60 flex-shrink-0">
              {dayjs(conversation.updatedAt).format("h:mm A")}
            </span>
          </div>
          <p
            className={`truncate text-xs ${
              unreadCount > 0
                ? "font-semibold text-base-content"
                : "text-base-content/60"
            }`}
          >
            {conversation.lastMessage?.text || "No messages yet"}
          </p>
        </div>
      </div>
    );
  };

  // ✅ Connection item
  const ConnectionItem = ({ connection }) => {
    const isOnline = getOnlineStatus(connection._id);
    const lastSeen = getLastSeen(connection._id);

    return (
      <div
        onClick={() =>
          dispatch(createConversation({ participantId: connection._id }))
        }
        className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 hover:bg-base-200"
      >
        {/* Avatar */}
        <div className="relative">
          <div className="avatar">
            <div className="w-12 h-12 rounded-full ring ring-base-300 overflow-hidden">
              <img
                src={connection.profileUrl}
                alt={`${connection.firstName}`}
                onError={(e) => {
                  e.target.src = "";
                }}
              />
            </div>
          </div>
          <span
            className={`absolute bottom-1 right-0 w-3.5 h-3.5 rounded-full border-2 border-base-100 ${
              isOnline ? "bg-green-500" : "bg-gray-400"
            }`}
          ></span>
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium truncate">
            {connection.firstName} {connection.lastName}
          </h4>
          <p className="text-xs text-base-content/60 truncate">{lastSeen}</p>
        </div>

        <MessageSquare className="w-5 h-5 text-base-content/40" />
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full font-sans">
      {/* ✅ Header */}
      <div className="sticky top-0 z-10 bg-base-100 border-b border-base-300">
        <div className="px-4 py-3">
          <h2 className="text-lg font-bold">Messages</h2>

          {/* Search */}
          <div className="relative mt-3">
            <input
              type="text"
              placeholder="Search..."
              className="input input-bordered input-sm w-full pl-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/60" />
          </div>
        </div>

        {/* ✅ Tabs */}
        <div className="tabs tabs-box tabs-sm justify-center px-2 pb-2">
          <button
            className={`tab ${
              activeTab === "conversations" ? "tab-active font-semibold" : ""
            }`}
            onClick={() => setActiveTab("conversations")}
          >
            Chats
          </button>
          <button
            className={`tab ${
              activeTab === "connections" ? "tab-active font-semibold" : ""
            }`}
            onClick={() => setActiveTab("connections")}
          >
            Connections
          </button>
        </div>
      </div>

      {/* ✅ Scrollable content */}
      <div className="flex-1 overflow-y-auto px-2">
        {activeTab === "conversations" ? (
          conversationsLoading ? (
            <div className="flex justify-center py-8">
              <div className="loading loading-spinner text-primary"></div>
            </div>
          ) : conversations.length ? (
            <div className="space-y-1">
              {conversations.map((c) => (
                <ConversationItem key={c._id} conversation={c} />
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-sm text-base-content/60">
              No conversations yet
            </p>
          )
        ) : connectionsLoading ? (
          <div className="flex justify-center py-8">
            <div className="loading loading-spinner text-primary"></div>
          </div>
        ) : connections.length ? (
          <div className="space-y-1">
            {connections.map((c) => (
              <ConnectionItem key={c._id} connection={c} />
            ))}
          </div>
        ) : (
          <p className="text-center py-8 text-sm text-base-content/60">
            No connections yet
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatUserList;
