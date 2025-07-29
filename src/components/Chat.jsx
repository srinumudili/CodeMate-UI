import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { createSocketConnection } from "../utils/socket";
import axios from "axios";

const Chat = () => {
  const { targetId } = useParams();
  const navigate = useNavigate();
  const user = useSelector((store) => store.user);
  const userId = user?._id;
  const { firstName, lastName, profileUrl } = user || {};

  const [targetUser, setTargetUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [unauthorized, setUnauthorized] = useState(false);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  const fetchChatMessages = async (requestedPage = 1) => {
    try {
      if (loadingMessages || !hasMore) return;

      setLoadingMessages(true);
      const res = await axios.get(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/api/chat/${targetId}?page=${requestedPage}&limit=20`,
        { withCredentials: true }
      );

      if (!res?.data?.authorized) {
        setUnauthorized(true);
        return;
      }

      const newMessages = res.data.messages.map((msg) => ({
        firstName: msg.senderId?.firstName,
        lastName: msg.senderId?.lastName,
        text: msg.text,
        senderId: msg.senderId?._id,
      }));

      setMessages((prev) => [...newMessages, ...prev]);

      if (!targetUser) {
        const receiver = res.data.participants.find((p) => p._id !== userId);
        setTargetUser(receiver);
      }

      setHasMore(requestedPage * 20 < res.data.totalMessages);
      setPage((prev) => prev + 1);
    } catch (err) {
      console.error(err);
      setUnauthorized(true);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleScroll = () => {
    const container = chatContainerRef.current;
    if (!container || loadingMessages || !hasMore) return;

    if (container.scrollTop < 50) {
      fetchChatMessages(page);
    }
  };

  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [loadingMessages, page]);

  useEffect(() => {
    if (!userId) return;
    fetchChatMessages(1);
  }, [userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!userId || unauthorized) return;
    const socket = createSocketConnection();
    socketRef.current = socket;
    socket.emit("joinChat", { firstName, lastName, userId, targetId });

    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => socket.disconnect();
  }, [userId, targetId, firstName, lastName, unauthorized]);

  const handleSendMessage = () => {
    if (!messageText.trim()) return;

    const message = {
      firstName,
      lastName,
      senderId: userId,
      receiverId: targetId,
      text: messageText,
    };

    socketRef.current.emit("sendMessage", message);
    setMessageText("");
  };

  if (unauthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200 text-center px-4">
        <div className="max-w-md">
          <h1 className="text-2xl font-bold text-error">Unauthorized</h1>
          <p className="text-sm mt-2">
            You're not connected with this user or chat doesn't exist.
          </p>
          <button
            onClick={() => navigate("/")}
            className="btn btn-primary mt-4"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center items-center bg-base-200 p-4">
      <div className="w-full max-w-2xl h-[85vh] flex flex-col bg-base-100 shadow-md rounded-2xl border border-base-300 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 flex items-center gap-3 bg-base-300 border-b border-base-200 sticky top-0 z-10">
          <div className="avatar">
            <div className="w-10 h-10 rounded-full ring ring-primary ring-offset-2 ring-offset-base-100">
              {targetUser ? (
                <img src={targetUser.profileUrl} alt="user avatar" />
              ) : (
                <div className="skeleton w-10 h-10 rounded-full"></div>
              )}
            </div>
          </div>
          <div>
            <h2 className="text-sm font-bold capitalize">
              {targetUser
                ? `${targetUser.firstName} ${targetUser.lastName}`
                : "Loading..."}
            </h2>
            <p className="text-xs opacity-70">Online</p>
          </div>
        </div>

        {/* Messages */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto px-4 py-6 space-y-4"
        >
          {loadingMessages && (
            <div className="flex justify-center">
              <span className="loading loading-spinner text-primary"></span>
            </div>
          )}
          {messages.map((msg, index) => {
            const isSender = msg.senderId === userId;
            const profileImage = isSender ? profileUrl : targetUser?.profileUrl;
            return (
              <div
                key={index}
                className={`chat ${isSender ? "chat-end" : "chat-start"}`}
              >
                <div className="chat-image avatar">
                  <div className="w-10 rounded-full ring ring-primary ring-offset-base-100">
                    <img src={profileImage} alt="profile" />
                  </div>
                </div>
                <div className="chat-header text-xs text-base-content/70 capitalize">
                  {msg.firstName} {msg.lastName}
                </div>
                <div
                  className={`chat-bubble text-sm shadow-md max-w-xs break-words ${
                    isSender
                      ? "bg-[#dcf8c6] text-black"
                      : "bg-base-100 text-black  dark:bg-[#2a2f32] dark:text-white"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-base-300 bg-base-100 p-3 sticky bottom-0 z-10">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex gap-3 items-center"
          >
            <input
              type="text"
              placeholder="Type a message..."
              className="input input-bordered input-md w-full bg-base-200"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
            />
            <button className="btn btn-accent" type="submit">
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;
