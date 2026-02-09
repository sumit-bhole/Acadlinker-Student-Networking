import React, { useState, useEffect, useRef } from "react";
import api from "../api/axios";
import Sidebar from "../components/Chat/Sidebar";
import ChatHeader from "../components/Chat/ChatHeader";
import MessageList from "../components/Chat/MessageList";
import MessageInput from "../components/Chat/MessageInput";
import EmptyState from "../components/Chat/EmptyState";

const ChatApp = () => {
  const [friends, setFriends] = useState([]);
  const [currentFriend, setCurrentFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessageContent, setNewMessageContent] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(true);

  // FETCH FRIEND LIST
  useEffect(() => {
    api.get("/api/friends/list")
      .then((res) => setFriends(res.data))
      .catch((err) => console.log("Failed to fetch friends", err))
      .finally(() => setLoadingFriends(false));
  }, []);

  // FETCH CHAT HISTORY
  const loadChat = async (friendId) => {
    if (!friendId) return; 
    setLoadingChat(true);
    try {
      const res = await api.get(`/api/messages/chat/${friendId}`);
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error("Failed to load chat history:", err);
      setMessages([]); 
    } finally {
      setLoadingChat(false);
    }
  };

  // Watcher for friend selection
  useEffect(() => {
    if (currentFriend?.id) {
      loadChat(currentFriend.id);
      // On mobile, switch to chat view when friend is selected
      if (window.innerWidth < 1024) {
        setIsMobileSidebarOpen(false);
      }
    }
  }, [currentFriend?.id]);

  // SEND MESSAGE
  const sendMessage = async () => {
    if (!currentFriend || (!newMessageContent.trim() && !selectedFile)) return;

    const formData = new FormData();
    if (newMessageContent.trim()) formData.append("content", newMessageContent);
    if (selectedFile) formData.append("file", selectedFile);

    const oldText = newMessageContent;
    const oldFile = selectedFile;

    // Optimistic UI updates
    const tempMessage = {
      id: Date.now(),
      content: newMessageContent,
      file_url: selectedFile ? URL.createObjectURL(selectedFile) : null,
      timestamp: new Date().toISOString(),
      is_sender: true
    };

    setMessages((prev) => [...prev, tempMessage]);
    setNewMessageContent("");
    setSelectedFile(null);

    try {
      const res = await api.post(`/api/messages/send/${currentFriend.id}`, formData);
      // Replace optimistic message with real one
      setMessages((prev) => prev.map(msg => 
        msg.id === tempMessage.id ? res.data : msg
      ));
    } catch (err) {
      console.log("Message sending failed", err);
      // Revert if failed
      setMessages((prev) => prev.filter(msg => msg.id !== tempMessage.id));
      setNewMessageContent(oldText);
      setSelectedFile(oldFile);
    }
  };

  // Handle window resize for mobile responsiveness
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileSidebarOpen(true);
      } else if (currentFriend) {
        setIsMobileSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial check

    return () => window.removeEventListener("resize", handleResize);
  }, [currentFriend]);

  const handleCloseChat = () => {
    setCurrentFriend(null);
    setMessages([]);
    if (window.innerWidth < 1024) {
      setIsMobileSidebarOpen(true);
    }
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-800 antialiased font-sans overflow-hidden">
      {/* Mobile Toggle Button */}
      {!isMobileSidebarOpen && currentFriend && (
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="lg:hidden absolute top-4 left-4 z-50 p-2 bg-white rounded-full shadow-md"
        >
          <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      {/* Sidebar - Hidden on mobile when chat is open */}
      <div className={`
        absolute lg:relative z-40 h-full w-full lg:w-80 xl:w-96 transition-transform duration-300
        ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <Sidebar
          friends={friends}
          loadingFriends={loadingFriends}
          currentFriend={currentFriend}
          onFriendSelect={(friend) => {
            setCurrentFriend(friend);
            setMessages([]);
          }}
          onRefreshChat={loadChat}
        />
      </div>

      {/* Chat Area */}
      <div className={`
        flex-1 flex flex-col bg-[#f1f5f9] transition-all duration-300
        ${!isMobileSidebarOpen ? "w-full" : "hidden lg:flex"}
      `}>
        {!currentFriend ? (
          <EmptyState />
        ) : (
          <>
            <ChatHeader 
              currentFriend={currentFriend} 
              onCloseChat={handleCloseChat}
            />
            <MessageList 
              messages={messages} 
              loadingChat={loadingChat}
              currentFriend={currentFriend}
            />
            <MessageInput
              newMessageContent={newMessageContent}
              selectedFile={selectedFile}
              onContentChange={setNewMessageContent}
              onFileSelect={setSelectedFile}
              onRemoveFile={() => setSelectedFile(null)}
              onSendMessage={sendMessage}
              disabled={loadingChat}
            />
          </>
        )}
      </div>

      {/* Mobile overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default ChatApp;