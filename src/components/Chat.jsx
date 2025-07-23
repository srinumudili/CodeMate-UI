import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { createSocketConnection } from "../utils/socket";
import axios from "axios";
import { BASE_URL } from "../utils/constants";

const Chat = () => {
  const { targetId } = useParams();
  const user = useSelector((store) => store.user);
  const userId = user?._id;
  const { firstName, lastName } = user;

  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const fetchChatMessages = async () => {
    const chat = await axios.get(`${BASE_URL}/chat/${targetId}`, {
      withCredentials: true,
    });

    const chatMessages = chat?.data?.messages.map((msg) => {
      const { senderId, text } = msg;
      return {
        firstName: senderId?.firstName,
        lastName: senderId?.lastName,
        text,
      };
    });

    setMessages(chatMessages);
  };

  useEffect(() => {
    fetchChatMessages();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!userId) return;

    const socket = createSocketConnection();
    socketRef.current = socket;

    socket.emit("joinChat", { firstName, lastName, userId, targetId });

    socket.on("receiveMessage", ({ firstName, lastName, text, senderId }) => {
      setMessages((prev) => [...prev, { firstName, lastName, text, senderId }]);
    });

    return () => {
      socket.disconnect();
    };
  }, [userId, targetId, firstName, lastName]);

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

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center px-2 sm:px-6 py-6">
      <div className="w-full max-w-2xl h-[85vh] flex flex-col bg-base-100 shadow-xl rounded-2xl border border-base-300 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-base-300 bg-primary text-primary-content sticky top-0 z-10 flex justify-between items-center">
          <h2 className="text-lg font-bold tracking-wide">
            Chat with{" "}
            <span className="ml-1">
              {targetId.slice(0, 6)}...{targetId.slice(-4)}
            </span>
          </h2>
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
                      src={`https://ui-avatars.com/api/?name=${msg.firstName}+${msg.lastName}`}
                    />
                  </div>
                </div>
                <div className="chat-header text-xs opacity-70 capitalize">
                  {msg.firstName} {msg.lastName}
                </div>
                <div
                  className={`chat-bubble text-sm ${
                    isSender
                      ? "bg-primary text-primary-content"
                      : "bg-accent text-accent-content"
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
