import React, { useState, useEffect } from "react";
import api from "../api/axios";
import Sidebar from "../components/Chat/Sidebar";
import ChatHeader from "../components/Chat/ChatHeader";
import MessageList from "../components/Chat/MessageList";
import MessageInput from "../components/Chat/MessageInput";
import EmptyState from "../components/Chat/EmptyState";
import { AlertCircle } from "lucide-react";

const ChatApp = () => {
  const [friends, setFriends] = useState([]);
  const [currentFriend, setCurrentFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessageContent, setNewMessageContent] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Delete Message State
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [isDeletingMessage, setIsDeletingMessage] = useState(false);
  
  // Mobile State
  const [showMobileFriendList, setShowMobileFriendList] = useState(true);

  // FETCH FRIEND LIST (🟢 CRITICAL FIX: Changed URL to messages/friends)
  useEffect(() => {
    api.get("/api/messages/friends") 
      .then((res) => setFriends(res.data))
      .catch((err) => console.log("Failed to fetch friends", err))
      .finally(() => setLoadingFriends(false));
  }, []);

  // FETCH CHAT HISTORY (Page 1)
  const loadChat = async (friendId) => {
    if (!friendId) return;
    setLoadingChat(true);
    try {
      const res = await api.get(`/api/messages/chat/${friendId}?page=1&limit=20`);
      setMessages(res.data.messages || []);
      setHasMore(res.data.has_more); 
      setPage(1);

      // Optional: Clear the unread badge visually when you open the chat
      setFriends(prev => prev.map(f => 
        f.id === friendId ? { ...f, unread_count: 0 } : f
      ));

    } catch (err) {
      console.error("Failed to load chat history:", err);
      setMessages([]);
    } finally {
      setLoadingChat(false);
    }
  };

  // FETCH OLDER MESSAGES
  const loadMoreMessages = async () => {
    if (!hasMore || loadingMore || !currentFriend) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await api.get(`/api/messages/chat/${currentFriend.id}?page=${nextPage}&limit=20`);
      
      setMessages((prev) => [...(res.data.messages || []), ...prev]);
      setHasMore(res.data.has_more);
      setPage(nextPage);
    } catch (err) {
      console.error("Failed to load older messages:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  // Handle Friend Selection
  const handleFriendSelect = (friend) => {
    setCurrentFriend(friend);
    setMessages([]);
    loadChat(friend.id);
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
    const activePreviewText = newMessageContent.trim() || "📷 Attachment"; // 🟢 For the sidebar preview

    // Optimistic UI update for the Chat Window
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

    // ========================================================
    // 🟢 OPTIMISTIC UI UPDATE FOR THE SIDEBAR
    // Pushes the active friend to the top instantly!
    // ========================================================
    setFriends((prevFriends) => {
      const friendIndex = prevFriends.findIndex(f => f.id === currentFriend.id);
      if (friendIndex === -1) return prevFriends;

      const updatedFriend = {
        ...prevFriends[friendIndex],
        last_message: activePreviewText,
        last_message_time: new Date().toISOString(),
        unread_count: 0 // Reset unread since you are actively chatting
      };

      const newFriendsList = [...prevFriends];
      newFriendsList.splice(friendIndex, 1); // Remove them from old spot
      newFriendsList.unshift(updatedFriend); // Drop them at the very top (index 0)

      return newFriendsList;
    });
    // ========================================================

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

  // UNSEND MESSAGE HANDLERS
  const initiateDeleteMessage = (messageId) => {
    setMessageToDelete(messageId); 
  };

  const confirmDeleteMessage = async () => {
    if (!messageToDelete) return;
    setIsDeletingMessage(true);

    // Optimistic UI Update: Remove it from the screen instantly
    setMessages((prev) => prev.filter(msg => msg.id !== messageToDelete));

    try {
      await api.delete(`/api/messages/${messageToDelete}`);
      
      // Update sidebar preview if the last message was deleted
      // (A simple approach is to just re-fetch the friend list quietly)
      // ✅ CORRECT URL
api.get("/api/messages/friends").then((res) => setFriends(res.data));

    } catch (err) {
      console.error("Failed to delete message:", err);
      alert("Failed to unsend message. It may have already been deleted.");
      if (currentFriend) loadChat(currentFriend.id);
    } finally {
      setIsDeletingMessage(false);
      setMessageToDelete(null); 
    }
  };

  return (
    <div className="flex w-full bg-[#f8fafc] text-slate-800 antialiased font-sans overflow-hidden h-[calc(100vh-4rem)] md:h-[calc(100dvh-4rem)] relative">
      
      {/* LEFT COLUMN: Sidebar / Friend List */}
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

      {/* RIGHT COLUMN: Chat Area */}
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
              <ChatHeader 
                 currentFriend={currentFriend} 
                 onCloseChat={handleMobileBack} 
              />
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto w-full custom-scrollbar flex flex-col">
               <MessageList 
                 messages={messages} 
                 loadingChat={loadingChat}
                 currentFriend={currentFriend}
                 onLoadMore={loadMoreMessages}
                 hasMore={hasMore}
                 loadingMore={loadingMore}
                 onDeleteMessage={initiateDeleteMessage}
               />
            </div>
            
            {/* Input Area */}
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

      {/* MODAL: CONFIRM UNSEND MESSAGE */}
      {messageToDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 p-6 text-center">
            
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-rose-600" />
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 mb-2">Unsend Message?</h3>
            <p className="text-sm text-slate-500 mb-6 px-2">
              Are you sure you want to unsend this message? It will be removed for everyone in the chat.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setMessageToDelete(null)}
                disabled={isDeletingMessage}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteMessage}
                disabled={isDeletingMessage}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md shadow-rose-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeletingMessage ? "Unsending..." : "Unsend"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default ChatApp;