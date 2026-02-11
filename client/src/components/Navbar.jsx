import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  Bell, 
  User, 
  LogOut, 
  Users, 
  PlusCircle, 
  MessageSquare,
  Menu,
  X,
  Search,
  ChevronDown,
  Settings,
  Sparkles,
  Zap // 👈 Added Zap icon for Help
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import SearchBar from "./SearchBar";
import api from "../api/axios";

const ENABLE_NOTIFICATIONS = false;

const Navbar = () => {
  const { logout, currentUser } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [teamsDropdown, setTeamsDropdown] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get("/api/notifications/unread_count");
      setUnreadCount(response.data.unread_count);
    } catch (error) {
      console.error("Error fetching notification count:", error);
    }
  };

  useEffect(() => {
    if (!ENABLE_NOTIFICATIONS) return;
    if (!currentUser) return;

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [currentUser]);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setMobileSearchOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  if (!currentUser) return null;

  return (
    <>
      <nav className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white px-4 md:px-6 h-16 flex items-center justify-between shadow-lg border-b border-blue-500/20 sticky top-0 z-50">
        {/* Left Section: Brand & Mobile Menu Toggle */}
        <div className="flex items-center space-x-3">
          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>

          {/* Brand */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 text-xl font-bold text-white hover:text-blue-300 transition-colors"
          >
            <div className="relative">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent text-xl md:text-2xl font-extrabold">
              Acadlinker
            </span>
          </Link>
        </div>

        {/* Center Section: Search Bar (Desktop) */}
        <div className="hidden md:flex flex-1 max-w-2xl mx-4 lg:mx-8">
          <SearchBar />
        </div>

        {/* Right Section: Desktop Navigation & Mobile Search Toggle */}
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Mobile Search Toggle */}
          <button
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Desktop Navigation - Hidden on mobile */}
          <div className="hidden md:flex items-center space-x-4">
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

            {/* Friends */}
            <Link
              to="/friends"
              className={`flex flex-col items-center p-2 rounded-lg transition-all duration-200 ${
                isActive('/friends') 
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                  : 'hover:bg-gray-700/50 hover:text-gray-200'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 5.197v-1a6 6 0 00-9-5.197M9 9a4 4 0 118 0" />
              </svg>
              <span className="text-xs mt-1">Friends</span>
            </Link>

            {/* Teams Dropdown */}
            <div className="relative">
              <button
                onClick={() => setTeamsDropdown(!teamsDropdown)}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all duration-200 group ${
                  isActive('/teams') || teamsDropdown
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'hover:bg-gray-700/50 hover:text-gray-200'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span className="font-medium">Teams</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${teamsDropdown ? 'rotate-180' : ''}`} />
              </button>

              {teamsDropdown && (
                <div 
                  className="absolute right-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50 animate-fadeIn"
                  onMouseLeave={() => setTeamsDropdown(false)}
                >
                  <div className="p-4 border-b border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-lg text-white">Teams</h3>
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
                          <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
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
                          <Users className="w-4 h-4 text-purple-400" />
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

            {/* Messaging */}
            <Link
              to="/chat"
              className={`flex flex-col items-center p-2 rounded-lg transition-all duration-200 ${
                isActive('/chat') 
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                  : 'hover:bg-gray-700/50 hover:text-gray-200'
              }`}
            >
              <MessageSquare className="w-5 h-5" />
              <span className="text-xs mt-1">Messages</span>
            </Link>

            {/* Notifications */}
            {ENABLE_NOTIFICATIONS && (
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
                    <span className="absolute -top-1 -right-1 bg-red-500 text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                  <span className="text-xs mt-1">Alerts</span>
                </Link>
              </div>
            )}

            {/* User Dropdown */}
            <div className="relative ml-2">
              <button
                onClick={() => setUserDropdown(!userDropdown)}
                className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
              >
                {currentUser.profile_pic_url ? (
                  <img
                    src={currentUser.profile_pic_url}
                    alt={currentUser.full_name}
                    className="w-7 h-7 rounded-full object-cover border-2 border-blue-500/30"
                  />
                ) : (
                  <div className="w-7 h-7 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    {currentUser.full_name?.[0]?.toUpperCase() || "S"}
                  </div>
                )}
                <span className="text-xs mt-1 text-gray-300 max-w-[62px] truncate">
                  {currentUser.full_name}
                </span>
              </button>

              {userDropdown && (
                <div 
                  className="absolute right-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50 animate-fadeIn"
                  onMouseLeave={() => setUserDropdown(false)}
                >
                  <div className="p-4 border-b border-gray-700">
                    <div className="flex items-center space-x-3">
                      {currentUser.profile_pic_url ? (
                        <img 
                          src={currentUser.profile_pic_url} 
                          alt={currentUser.full_name} 
                          className="w-10 h-10 rounded-full object-cover border-2 border-blue-500/30"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                          {currentUser.full_name?.[0]?.toUpperCase() || 'U'}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-white">{currentUser.full_name || 'User'}</p>
                        <p className="text-xs text-gray-400">{currentUser.email || 'user@example.com'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    <Link 
                      to={`/profile/${currentUser.id}`}
                      onClick={() => setUserDropdown(false)}
                      className="flex items-center p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
                    >
                      <User className="w-4 h-4 mr-3 text-gray-400" />
                      <span>View Profile</span>
                    </Link>
                    <Link 
                      to="/settings"
                      onClick={() => setUserDropdown(false)}
                      className="flex items-center p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
                    >
                      <Settings className="w-4 h-4 mr-3 text-gray-400" />
                      <span>Settings</span>
                    </Link>
                    <div className="border-t border-gray-700 my-2"></div>
                    <button
                      onClick={() => {
                        setUserDropdown(false);
                        logout();
                      }}
                      className="flex items-center w-full p-2 rounded-lg hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors group"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Search Overlay */}
      {mobileSearchOpen && (
        <div className="md:hidden fixed top-16 left-0 right-0 bg-gray-900 p-4 z-40 border-b border-gray-700 animate-slideDown">
          <div className="relative">
            <SearchBar />
            <button
              onClick={() => setMobileSearchOpen(false)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-white"
              aria-label="Close search"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Mobile Menu Panel */}
          <div className="fixed top-16 left-0 right-0 bottom-0 bg-gray-900 z-50 md:hidden overflow-y-auto animate-slideIn">
            <div className="p-4">
              {/* User Info */}
              <div className="flex items-center space-x-3 p-4 bg-gray-800/50 rounded-xl mb-6">
                {currentUser.profile_pic_url ? (
                  <img
                    src={currentUser.profile_pic_url}
                    alt={currentUser.full_name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-blue-500/30"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {currentUser.full_name?.[0]?.toUpperCase() || "S"}
                  </div>
                )}
                <div>
                  <p className="font-bold text-white">{currentUser.full_name}</p>
                  <p className="text-sm text-gray-400">{currentUser.email}</p>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="space-y-1 mb-6">
                <MobileNavItem
                  to="/"
                  icon={<Home className="w-5 h-5" />}
                  label="Home"
                  isActive={isActive('/')}
                  onClick={() => setMobileMenuOpen(false)}
                />
                
                {/* 🆕 ADDED: Community Help Link (Only visible on mobile) */}
                <MobileNavItem
                  to="/help/feed"
                  icon={<Zap className="w-5 h-5" />}
                  label="Community Help"
                  isActive={isActive('/help/feed')}
                  onClick={() => setMobileMenuOpen(false)}
                />

                <MobileNavItem
                  to="/friends"
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 5.197v-1a6 6 0 00-9-5.197M9 9a4 4 0 118 0" />
                    </svg>
                  }
                  label="Friends"
                  isActive={isActive('/friends')}
                  onClick={() => setMobileMenuOpen(false)}
                />
                <div className="space-y-1">
                  <div className={`flex items-center justify-between p-3 rounded-lg ${isActive('/teams') ? 'bg-blue-500/20' : 'hover:bg-gray-800/50'}`}>
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span className="font-medium text-gray-300">Teams</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="pl-4 space-y-1">
                    <MobileNavItem
                      to="/teams"
                      icon={
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      }
                      label="All Teams"
                      isActive={isActive('/teams')}
                      onClick={() => setMobileMenuOpen(false)}
                      indent
                    />
                    <MobileNavItem
                      to="/teams/my"
                      icon={<Users className="w-4 h-4" />}
                      label="My Teams"
                      isActive={isActive('/teams/my')}
                      onClick={() => setMobileMenuOpen(false)}
                      indent
                    />
                    <MobileNavItem
                      to="/teams/create"
                      icon={<PlusCircle className="w-4 h-4" />}
                      label="Create Team"
                      isActive={isActive('/teams/create')}
                      onClick={() => setMobileMenuOpen(false)}
                      indent
                      accent
                    />
                  </div>
                </div>
                <MobileNavItem
                  to="/chat"
                  icon={<MessageSquare className="w-5 h-5" />}
                  label="Messages"
                  isActive={isActive('/chat')}
                  onClick={() => setMobileMenuOpen(false)}
                />
                {ENABLE_NOTIFICATIONS && (
                  <MobileNavItem
                    to="/notifications"
                    icon={<Bell className="w-5 h-5" />}
                    label="Alerts"
                    isActive={isActive('/notifications')}
                    onClick={() => setMobileMenuOpen(false)}
                    badge={unreadCount > 0 ? unreadCount : null}
                  />
                )}
              </div>

              {/* User Menu Links */}
              <div className="space-y-1 mb-6">
                <MobileNavItem
                  to={`/profile/${currentUser.id}`}
                  icon={<User className="w-5 h-5" />}
                  label="View Profile"
                  onClick={() => setMobileMenuOpen(false)}
                />
                <MobileNavItem
                  to="/settings"
                  icon={<Settings className="w-5 h-5" />}
                  label="Settings"
                  onClick={() => setMobileMenuOpen(false)}
                />
              </div>

              {/* Sign Out Button */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center justify-center space-x-2 p-3 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Quick Team Creation Floating Button - Hidden on mobile */}
      <Link
        to="/teams/create"
        className="hidden md:flex fixed bottom-6 right-6 z-40 animate-bounce-slow"
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

// Mobile Navigation Item Component (Updated with Explicit Text Color)
const MobileNavItem = ({ to, icon, label, isActive, onClick, badge, indent, accent }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
      isActive 
        ? accent 
          ? 'bg-gradient-to-r from-blue-500/20 to-purple-600/20 text-blue-300 border border-blue-500/30'
          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
        : 'hover:bg-gray-800/50'
    } ${indent ? 'ml-4' : ''}`}
  >
    <div className="flex items-center space-x-3">
      <div className={`${accent ? 'text-blue-400' : 'text-gray-400'}`}>
        {icon}
      </div>
      {/* 🛠️ FIX: Added 'text-gray-300' default color so it's not black */}
      <span className={`${accent ? 'text-blue-400 font-medium' : 'text-gray-300'}`}>{label}</span>
    </div>
    {badge && (
      <span className="bg-red-500 text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full text-white">
        {badge > 9 ? '9+' : badge}
      </span>
    )}
  </Link>
);

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

@keyframes slideIn {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}

@keyframes slideDown {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
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

.animate-slideIn {
  animation: slideIn 0.3s ease-out;
}

.animate-slideDown {
  animation: slideDown 0.2s ease-out;
}

.animate-bounce-slow {
  animation: bounce-slow 2s infinite;
}

.hover\:shadow-3xl:hover {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

/* Mobile Responsive Adjustments */
@media (max-width: 768px) {
  .mobile-search-overlay {
    position: fixed;
    top: 64px;
    left: 0;
    right: 0;
    background: #1f2937;
    padding: 1rem;
    border-bottom: 1px solid #374151;
    z-index: 40;
  }
}
`;

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

export default Navbar;