import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  Bell, 
  User, 
  LogOut, 
  Users, 
  PlusCircle, 
  Search, 
  MessageSquare,
  Users as TeamsIcon,
  Sparkles,
  ChevronDown
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import SearchBar from "./SearchBar";

// --- CRITICAL FIX: Import your configured API instance, NOT default axios ---
import api from "../api/axios"; 

const Navbar = () => {
  const { logout, currentUser } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [teamsDropdown, setTeamsDropdown] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const location = useLocation();

  // Check if current route is active
  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const fetchUnreadCount = async () => {
    try {
      // --- CRITICAL FIX: Use 'api' instead of 'axios' ---
      // 1. We remove "http://localhost:5000" because api.js handles the baseURL
      // 2. We remove "withCredentials" because we use Bearer Tokens now
      const response = await api.get("/api/notifications/unread_count");
      
      setUnreadCount(response.data.unread_count);
    } catch (error) {
      console.error("Error fetching notification count:", error);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchUnreadCount();
      // Fetch every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);

  if (!currentUser) return null;

  return (
    <>
      <nav className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white px-6 h-16 flex items-center justify-between shadow-lg border-b border-blue-500/20 sticky top-0 z-50">
        {/* Left Section: Brand */}
        <div className="flex items-center space-x-3">
          <Link 
            to="/" 
            className="flex items-center space-x-2 text-xl font-bold text-white hover:text-blue-300 transition-colors"
          >
            <div className="relative">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-900"></div>
            </div>
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent text-2xl font-extrabold">
              Acadlinker
            </span>
            <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30">
              Beta
            </span>
          </Link>
        </div>

        {/* Center Section: Search Bar */}
        <div className="flex-1 max-w-2xl mx-8">
          <SearchBar />
        </div>

        {/* Right Section: Navigation Links */}
        <div className="flex items-center space-x-4">
          {/* Home */}
          <Link
            to="/"
            className={`flex flex-col items-center p-2 rounded-lg transition-all duration-200 ${
              isActive('/') 
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                : 'hover:bg-gray-700/50 hover:text-gray-200'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-xs mt-1">Home</span>
          </Link>

          {/* Profile */}
          <Link
            to={`/profile/${currentUser.id}`}
            className={`flex flex-col items-center p-2 rounded-lg transition-all duration-200 ${
              isActive('/profile') 
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                : 'hover:bg-gray-700/50 hover:text-gray-200'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-xs mt-1">Profile</span>
          </Link>

          {/* Friends */}
          <Link
            to="/friends"
            className={`flex flex-col items-center p-2 rounded-lg transition-all duration-200 ${
              isActive('/friends') 
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                : 'hover:bg-gray-700/50 hover:text-gray-200'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-xs mt-1">Friends</span>
          </Link>

          {/* Teams - Enhanced with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setTeamsDropdown(!teamsDropdown)}
              className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all duration-200 group ${
                isActive('/teams') || teamsDropdown
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'hover:bg-gray-700/50 hover:text-gray-200'
              }`}
            >
              <TeamsIcon className="w-5 h-5" />
              <span className="font-medium">Teams</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${teamsDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* Teams Dropdown */}
            {teamsDropdown && (
              <div 
                className="absolute right-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50 animate-fadeIn"
                onMouseLeave={() => setTeamsDropdown(false)}
              >
                <div className="p-4 border-b border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-lg text-white">Your Teams</h3>
                    <Link 
                      to="/teams/create"
                      className="flex items-center text-sm text-blue-400 hover:text-blue-300"
                    >
                      <PlusCircle className="w-4 h-4 mr-1" />
                      New Team
                    </Link>
                  </div>
                  <div className="space-y-2">
                    <Link 
                      to="/teams"
                      className="flex items-center p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center mr-3">
                        <TeamsIcon className="w-4 h-4 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">All Teams</p>
                        <p className="text-xs text-gray-400">Browse all teams</p>
                      </div>
                    </Link>
                    <Link 
                      to="/teams/my"
                      className="flex items-center p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center mr-3">
                        <User className="w-4 h-4 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">My Teams</p>
                        <p className="text-xs text-gray-400">Teams you manage</p>
                      </div>
                    </Link>
                  </div>
                </div>
                <div className="p-3 bg-gray-900/50">
                  <p className="text-xs text-gray-400 text-center">
                    Collaborate with peers on projects
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Chat */}
          <Link
            to="/chat"
            className={`flex flex-col items-center p-2 rounded-lg transition-all duration-200 ${
              isActive('/chat') 
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                : 'hover:bg-gray-700/50 hover:text-gray-200'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            <span className="text-xs mt-1">Chat</span>
          </Link>

          {/* Notifications */}
          <div className="relative">
            <Link
              to="/notifications"
              className={`flex flex-col items-center p-2 rounded-lg transition-all duration-200 relative ${
                isActive('/notifications') 
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                  : 'hover:bg-gray-700/50 hover:text-gray-200'
              }`}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <>
                  <span className="absolute -top-1 -right-1 bg-red-500 text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full text-white animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full animate-ping opacity-75"></span>
                </>
              )}
              <span className="text-xs mt-1">Alerts</span>
            </Link>
          </div>

          {/* User Dropdown */}
          <div className="relative ml-2">
            <button
              onClick={() => setUserDropdown(!userDropdown)}
              className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-700/50 transition-colors"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                {currentUser.name?.[0]?.toUpperCase() || 'U'}
              </div>
            </button>

            {userDropdown && (
              <div 
                className="absolute right-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50 animate-fadeIn"
                onMouseLeave={() => setUserDropdown(false)}
              >
                <div className="p-4 border-b border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      {currentUser.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="font-bold text-white">{currentUser.name || 'User'}</p>
                      <p className="text-xs text-gray-400">{currentUser.email || 'user@example.com'}</p>
                    </div>
                  </div>
                </div>
                <div className="p-2">
                  <Link 
                    to={`/profile/${currentUser.id}`}
                    className="flex items-center p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
                  >
                    <User className="w-4 h-4 mr-3 text-gray-400" />
                    <span>My Profile</span>
                  </Link>
                  <Link 
                    to="/settings"
                    className="flex items-center p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Settings</span>
                  </Link>
                  <div className="border-t border-gray-700 my-2"></div>
                  <button
                    onClick={logout}
                    className="flex items-center w-full p-2 rounded-lg hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors group"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Quick Team Creation Floating Button */}
      <Link
        to="/teams/create"
        className="fixed bottom-6 right-6 z-40 animate-bounce-slow"
      >
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 group flex items-center space-x-2">
          <PlusCircle className="w-6 h-6" />
          <span className="hidden group-hover:inline text-sm font-medium">
            Create Team
          </span>
        </div>
      </Link>
    </>
  );
};

// Add this CSS to your global styles for animations
const styles = `
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounce-slow {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.2s ease-out;
}

.animate-bounce-slow {
  animation: bounce-slow 2s infinite;
}

.hover\:shadow-3xl:hover {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}
`;

// Add styles to document head
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

export default Navbar;