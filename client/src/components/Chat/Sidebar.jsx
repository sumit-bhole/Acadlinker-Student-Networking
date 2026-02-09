import React from "react";
import { MessageSquare, Search } from "lucide-react";

const Sidebar = ({ friends, loadingFriends, currentFriend, onFriendSelect, onRefreshChat }) => {
  return (
    <div className="w-full lg:w-80 xl:w-96 flex flex-col bg-white border-r border-slate-200">
      <div className="p-4 lg:p-6 border-b border-slate-100">
        <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent flex items-center">
          <MessageSquare className="w-6 h-6 mr-2 text-indigo-600" />
          Chats
        </h1>
      </div>

      <div className="p-3 lg:p-4 border-b border-slate-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            placeholder="Search friends..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loadingFriends ? (
          <div className="flex justify-center p-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
        ) : friends.length === 0 ? (
          <p className="text-slate-500 text-center mt-10 text-sm px-4">No friends found.</p>
        ) : (
          friends.map((friend) => (
            <FriendListItem
              key={friend.id}
              friend={friend}
              isActive={currentFriend?.id === friend.id}
              onClick={() => {
                if (currentFriend?.id === friend.id) {
                  onRefreshChat(friend.id);
                } else {
                  onFriendSelect(friend);
                }
              }}
            />
          ))
        )}
      </div>
    </div>
  );
};

const FriendListItem = ({ friend, isActive, onClick }) => (
  <div
    onClick={onClick}
    className={`flex items-center px-4 lg:px-5 py-3 lg:py-4 cursor-pointer transition-all border-l-4 ${
      isActive 
        ? "bg-indigo-50 border-indigo-600 shadow-sm" 
        : "border-transparent hover:bg-slate-50"
    }`}
  >
    <img 
      src={friend.profile_pic_url || friend.profile_image || "/default-profile.png"} 
      className="w-10 h-10 lg:w-12 lg:h-12 rounded-full object-cover shadow-sm" 
      alt="profile" 
    />
    <div className="ml-3 lg:ml-4 overflow-hidden flex-1 min-w-0">
      <h3 className="font-semibold text-slate-900 truncate text-sm lg:text-base">
        {friend.name || friend.full_name}
      </h3>
      <p className="text-xs text-slate-500 truncate">{friend.email}</p>
    </div>
  </div>
);

export default Sidebar;