import React, { useState, useEffect } from "react";
import api from "../api/axios";
import Sidebar from "../components/Chat/Sidebar";
import ChatHeader from "../components/Chat/ChatHeader";
import MessageList from "../components/Chat/MessageList";
import MessageInput from "../components/Chat/MessageInput";
import EmptyState from "../components/Chat/EmptyState";
// Removed ArrowLeft import as we will use the one inside ChatHeader

const ChatApp = () => {
  const [friends, setFriends] = useState([]);
  const [currentFriend, setCurrentFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessageContent, setNewMessageContent] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  
  // Mobile State: true = show friend list, false = show chat
  const [showMobileFriendList, setShowMobileFriendList] = useState(true);

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

  // Handle Friend Selection
  const handleFriendSelect = (friend) => {
    setCurrentFriend(friend);
    setMessages([]);
    loadChat(friend.id);
    // On mobile: Hide list, show chat
    setShowMobileFriendList(false);
  };

  // Handle Back Button (Mobile Only)
  const handleMobileBack = () => {
    setShowMobileFriendList(true);
    setCurrentFriend(null); 
  };

  // SEND MESSAGE
  const sendMessage = async () => {
    if (!currentFriend || (!newMessageContent.trim() && !selectedFile)) return;

    const formData = new FormData();
    if (newMessageContent.trim()) formData.append("content", newMessageContent);
    if (selectedFile) formData.append("file", selectedFile);

    const oldText = newMessageContent;
    const oldFile = selectedFile;

    // Optimistic UI update
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
      setMessages((prev) => prev.map(msg => 
        msg.id === tempMessage.id ? res.data : msg
      ));
    } catch (err) {
      console.log("Message sending failed", err);
      setMessages((prev) => prev.filter(msg => msg.id !== tempMessage.id));
      setNewMessageContent(oldText);
      setSelectedFile(oldFile);
    }
  };

  return (
    <div className="flex w-full bg-[#f8fafc] text-slate-800 antialiased font-sans overflow-hidden h-[calc(100vh-4rem)] md:h-[calc(100dvh-4rem)]">
      
      {/* =========================================
          LEFT COLUMN: Sidebar / Friend List
         ========================================= */}
      <div className={`
        flex-shrink-0 bg-white border-r border-gray-200 h-full transition-all duration-300
        ${showMobileFriendList ? "w-full" : "hidden"} 
        md:block md:w-80 lg:w-96
      `}>
        <Sidebar
          friends={friends}
          loadingFriends={loadingFriends}
          currentFriend={currentFriend}
          onFriendSelect={handleFriendSelect}
          onRefreshChat={loadChat}
        />
      </div>

      {/* =========================================
          RIGHT COLUMN: Chat Area
         ========================================= */}
      <div className={`
        flex-1 flex flex-col h-full bg-[#f1f5f9] transition-all duration-300 relative
        ${!showMobileFriendList ? "w-full block" : "hidden"} 
        md:flex md:w-auto
      `}>
        {!currentFriend ? (
          <EmptyState />
        ) : (
          <>
            {/* Header Wrapper */}
            <div className="flex-shrink-0 bg-white border-b border-gray-200 shadow-sm z-10">
              {/* 👇 FIX: Removed the extra <button> I added earlier.
                 We now pass handleMobileBack to the onCloseChat prop.
                 This makes the ChatHeader's OWN back button work correctly.
              */}
              <ChatHeader 
                 currentFriend={currentFriend} 
                 onCloseChat={handleMobileBack} 
              />
            </div>

            {/* Messages Area - Takes remaining space */}
            <div className="flex-1 overflow-y-auto w-full custom-scrollbar">
               <MessageList 
                 messages={messages} 
                 loadingChat={loadingChat}
                 currentFriend={currentFriend}
               />
            </div>
            
            {/* Input Area - Fixed at bottom */}
            <div className="flex-shrink-0 w-full bg-white border-t border-gray-200">
               <MessageInput
                 newMessageContent={newMessageContent}
                 selectedFile={selectedFile}
                 onContentChange={setNewMessageContent}
                 onFileSelect={setSelectedFile}
                 onRemoveFile={() => setSelectedFile(null)}
                 onSendMessage={sendMessage}
                 disabled={loadingChat}
               />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatApp;