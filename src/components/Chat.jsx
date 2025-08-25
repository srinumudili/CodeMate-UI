import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getSocket } from "../utils/socket";
import { setActiveConversation } from "../utils/redux/chatUISlice";
import ChatUserList from "./ChatUserList";
import ChatWindow from "./ChatWindow";
import { MessageSquare } from "lucide-react";

const Chat = () => {
  const dispatch = useDispatch();
  const socket = getSocket();
  const { user } = useSelector((state) => state.user);
  const { activeConversationId } = useSelector((state) => state.chatUI);
  const [isMobile, setIsMobile] = useState(false);
  const [showUserList, setShowUserList] = useState(true);

  // 🔹 Handle responsive layout
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile && activeConversationId) {
        setShowUserList(false);
      } else if (!mobile) {
        setShowUserList(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activeConversationId]);

  // 🔹 Only emit joinChat here
  const handleConversationSelect = (conversationId) => {
    dispatch(setActiveConversation(conversationId));
    if (socket) {
      socket.emit("joinChat", { conversationId });
    }
    if (isMobile) {
      setShowUserList(false);
    }
  };

  const handleBackToList = () => {
    if (isMobile) {
      setShowUserList(true);
      dispatch(setActiveConversation(null));
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100dvh-7rem)] bg-base-100 relative">
      {/* Sidebar */}
      <div
        className={`${
          isMobile ? (showUserList ? "w-full" : "hidden") : "w-80"
        } border-r border-base-300 flex-shrink-0 relative`}
      >
        <ChatUserList
          onConversationSelect={handleConversationSelect}
          isMobile={isMobile}
        />
      </div>

      {/* Chat Window */}
      <div
        className={`${
          isMobile ? (showUserList ? "hidden" : "w-full") : "flex-1"
        } flex flex-col`}
      >
        {activeConversationId ? (
          <ChatWindow
            conversationId={activeConversationId}
            onBackToList={handleBackToList}
            isMobile={isMobile}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center max-w-md">
              <div className="mb-6">
                <MessageSquare className="w-20 h-20 mx-auto text-base-300" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-base-content">
                Your Messages
              </h3>
              <p className="text-base-content/60 mb-4">
                Send private messages to your connections or start a new
                conversation.
              </p>
              <div className="text-sm text-base-content/50">
                Select a conversation from the sidebar to get started
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
