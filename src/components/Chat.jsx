import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { createSocketConnection } from "../utils/socket";
import axios from "axios";
import { BASE_URL } from "../utils/constants";

const Chat = () => {
  const { targetId } = useParams();
  const navigate = useNavigate();
  const user = useSelector((store) => store.user);
  const userId = user?._id;
  const { firstName, lastName } = user || {};

  const [targetUser, setTargetUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [unauthorized, setUnauthorized] = useState(false);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const fetchChatMessages = async () => {
    try {
      const chat = await axios.get(`${BASE_URL}/chat/${targetId}`, {
        withCredentials: true,
      });

      // Validate access
      if (!chat?.data?.authorized) {
        setUnauthorized(true);
        return;
      }

      const chatMessages = chat?.data?.messages.map((msg) => {
        const { senderId, text } = msg;
        return {
          firstName: senderId?.firstName,
          lastName: senderId?.lastName,
          text,
        };
      });

      setMessages(chatMessages);

      const receiver = chat?.data?.participants?.find((p) => p._id !== userId);
      setTargetUser(receiver);
    } catch (error) {
      console.error("Error fetching chat:", error);
      setUnauthorized(true);
    }
  };

  useEffect(() => {
    if (!userId) return;
    fetchChatMessages();
  }, [userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!userId || unauthorized) return;

    const socket = createSocketConnection();
    socketRef.current = socket;

    socket.emit("joinChat", { firstName, lastName, userId, targetId });

    socket.on("receiveMessage", ({ firstName, lastName, text, senderId }) => {
      setMessages((prev) => [...prev, { firstName, lastName, text, senderId }]);
    });

    return () => {
      socket.disconnect();
    };
  }, [userId, targetId, firstName, lastName, unauthorized]);

  const handleSendMessage = () => {
    if (messageText.trim() === "") return;

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
      <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-error">Unauthorized Access</h1>
          <p className="text-base">
            You are not connected with this user or the chat does not exist.
          </p>
          <button onClick={() => navigate("/")} className="btn btn-accent mt-4">
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center px-2 sm:px-6 py-6">
      <div className="w-full max-w-2xl h-[85vh] flex flex-col bg-base-100 shadow-xl rounded-2xl border border-base-300 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-base-300 bg-base-300 text-primary-content sticky top-0 z-10 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="avatar">
              <div className="w-10 rounded-full ring ring-offset-2 ring-base-100 ring-offset-base-300">
                <img
                  src={targetUser ? `${targetUser?.profileUrl}` : ""}
                  alt="avatar"
                />
              </div>
            </div>
            <div>
              <h2 className="text-md font-bold capitalize leading-tight">
                {targetUser
                  ? `${targetUser.firstName} ${targetUser.lastName}`
                  : "Loading..."}
              </h2>
              <p className="text-xs opacity-80">Online</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5">
          {messages.map((msg, index) => {
            const isSender = msg.firstName === firstName;
            return (
              <div
                key={index}
                className={`chat ${isSender ? "chat-end" : "chat-start"}`}
              >
                <div className="chat-image avatar">
                  <div className="w-10 rounded-full ring ring-offset-2 ring-primary ring-offset-base-100">
                    <img
                      alt={`${msg.firstName}`}
                      src={isSender ? user?.profileUrl : targetUser?.profileUrl}
                    />
                  </div>
                </div>
                <div className="chat-header text-xs opacity-70 capitalize">
                  {msg.firstName} {msg.lastName}
                </div>
                <div
                  className={`chat-bubble text-sm ${
                    isSender
                      ? "bg-green-900 text-white"
                      : "bg-gray-800 text-white"
                  } rounded-xl shadow-md`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-base-300 bg-base-100 sticky bottom-0 z-10">
          <form
            className="flex items-center gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
          >
            <input
              type="text"
              placeholder="Type a message..."
              className="input input-bordered w-full bg-base-200 text-base-content"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
            />
            <button type="submit" className="btn btn-accent">
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;
