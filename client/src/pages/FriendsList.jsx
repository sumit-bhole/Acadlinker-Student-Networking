import React, { useEffect, useState, useMemo } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";
import { 
  UserPlus, 
  UserCheck, 
  X, 
  Check, 
  Users, 
  Search, 
  Loader2, 
  ChevronRight,
  MessageCircle,
  Sparkles,
  User,
  Briefcase,
  MapPin
} from "lucide-react";

const FriendsList = () => {
  const [requests, setRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [isFriendsModalOpen, setIsFriendsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [reqRes, friendsRes, suggRes] = await Promise.all([
          api.get("/api/friends/requests"),
          api.get("/api/friends/list"),
          api.get("/api/suggestions/")
        ]);

        setRequests(reqRes.data || []);
        setFriends(friendsRes.data || []);
        
        const suggData = Array.isArray(suggRes.data) ? suggRes.data : (suggRes.data.data || []);
        setSuggestions(suggData);
      } catch (err) {
        console.error("Data fetch error:", err);
        setError("Could not load social data. Please refresh.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter and sort friends for modal
  const filteredAndSortedFriends = useMemo(() => {
    let filtered = friends.filter(friend => 
      friend.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    switch (filterType) {
      case "alphabet":
        filtered.sort((a, b) => a.name?.localeCompare(b.name));
        break;
      case "recent":
        filtered.sort((a, b) => (b.created_at || 0) - (a.created_at || 0));
        break;
      default:
        break;
    }

    return filtered;
  }, [friends, searchQuery, filterType]);

  // Get first 4 friends to display
  const displayedFriends = friends.slice(0, 4);

  const handleAccept = async (requestId, senderId, senderName, senderProfile) => {
    setActionLoading(requestId);
    try {
      await api.post(`/api/friends/accept/${requestId}`);
      
      setRequests((prev) => prev.filter((req) => req.id !== requestId));
      
      const newFriend = {
        id: senderId,
        name: senderName,
        profile_image: senderProfile,
        email: "Contact via profile",
        created_at: Date.now()
      };
      setFriends((prev) => [...prev, newFriend]);
      
      setSuccessMsg(`You are now friends with ${senderName}!`);
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      alert("Failed to accept request. Try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (requestId) => {
    setActionLoading(requestId);
    try {
      await api.post(`/api/friends/reject/${requestId}`);
      setRequests((prev) => prev.filter((req) => req.id !== requestId));
    } catch (err) {
      alert("Failed to reject request.");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
        <p className="text-slate-500 font-bold tracking-wide uppercase text-xs animate-pulse">Loading Network...</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 pb-24">
        
        {/* SUCCESS TOAST */}
        {successMsg && (
          <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-top-5 fade-in duration-300">
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-5 py-3 rounded-xl shadow-lg flex items-center gap-3">
              <div className="p-1 bg-emerald-100 rounded-full">
                <UserCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="font-medium text-sm">{successMsg}</span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Friends</h1>
          <p className="text-slate-500 mt-2">Connect with people and grow your network</p>
        </div>

        {/* Friend Requests Section */}
        {requests.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-600" />
                Friend Requests
                <span className="text-xs font-bold bg-red-100 text-red-600 px-2 py-1 rounded-full ml-2">
                  {requests.length}
                </span>
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {requests.map((req) => (
                <div 
                  key={req.id} 
                  className="bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all"
                >
                  <div className="p-5">
                    <div className="flex items-center gap-4">
                      <img
                        src={req.sender_profile || "/default-profile.png"}
                        alt={req.sender_name}
                        className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
                      />
                      <div className="flex-1 min-w-0">
                        <Link to={`/profile/${req.sender_id}`}>
                          <h3 className="font-bold text-slate-900 hover:text-indigo-600 transition-colors truncate">
                            {req.sender_name}
                          </h3>
                        </Link>
                        <p className="text-xs text-slate-500 mt-0.5">Wants to connect with you</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => handleAccept(req.id, req.sender_id, req.sender_name, req.sender_profile)}
                        disabled={actionLoading === req.id}
                        className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {actionLoading === req.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            Accept
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleReject(req.id)}
                        disabled={actionLoading === req.id}
                        className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors disabled:opacity-50"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Friends Section - Always show View All button */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              Your Connections
              <span className="text-sm font-medium text-slate-500 ml-2">
                ({friends.length})
              </span>
            </h2>
            
            {/* View All button always visible */}
            <button
              onClick={() => setIsFriendsModalOpen(true)}
              className="flex items-center gap-1 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-medium rounded-xl transition-all duration-200 text-sm"
            >
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {friends.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-500 font-medium">No connections yet</p>
              <p className="text-sm text-slate-400 mt-1">Connect with people to see them here</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {displayedFriends.map((friend) => (
                <Link
                  key={friend.id}
                  to={`/profile/${friend.id}`}
                  className="bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg transition-all group overflow-hidden"
                >
                  <div className="p-5 text-center">
                    <div className="relative inline-block">
                      <img
                        src={friend.profile_image || "/default-profile.png"}
                        alt={friend.name}
                        className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-slate-100 group-hover:border-indigo-100 transition-colors"
                      />
                      <div className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    
                    <h3 className="font-bold text-slate-900 mt-3 group-hover:text-indigo-600 transition-colors">
                      {friend.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 truncate px-2">{friend.email}</p>
                    
                    <button className="mt-4 w-full py-2 bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 font-medium rounded-xl transition-colors text-sm">
                      View Profile
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Suggestions Section - Redesigned Cards */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              People You May Know
              <span className="text-sm font-medium text-slate-500 ml-2">
                ({suggestions.length})
              </span>
            </h2>
          </div>

          {suggestions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-500 font-medium">No suggestions available</p>
              <p className="text-sm text-slate-400 mt-1">Check back later for recommendations</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {suggestions.map((user) => (
                <div
                  key={user.id}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-200 group"
                >
                  <div className="p-5">
                    {/* Profile Image */}
                    <div className="flex justify-center mb-4">
                      <div className="relative">
                        <img
                          src={user.profile_pic_url || user.profile_image || "/default-profile.png"}
                          alt={user.name}
                          className="w-28 h-28 rounded-full object-cover border-4 border-slate-100 group-hover:border-indigo-100 transition-all"
                        />
                      </div>
                    </div>

                    {/* User Info */}
                    <div className="text-center mb-4">
                      <Link to={`/profile/${user.id}`}>
                        <h3 className="font-bold text-lg text-slate-900 hover:text-indigo-600 transition-colors">
                          {user.name || user.full_name}
                        </h3>
                      </Link>
                      
                      {/* Location if available */}
                      {user.location && (
                        <div className="flex items-center justify-center gap-1 mt-1 text-xs text-slate-500">
                          <MapPin className="w-3 h-3" />
                          <span>{user.location}</span>
                        </div>
                      )}
                      
                      {/* Role/Title if available */}
                      {user.title && (
                        <div className="flex items-center justify-center gap-1 mt-1 text-xs text-slate-500">
                          <Briefcase className="w-3 h-3" />
                          <span>{user.title}</span>
                        </div>
                      )}
                    </div>

                    {/* Skills/Tags */}
                    {user.skills && (
                      <div className="flex flex-wrap justify-center gap-1.5 mb-4">
                        {user.skills.split(",").slice(0, 3).map((skill, i) => (
                          <span 
                            key={i} 
                            className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full"
                          >
                            {skill.trim()}
                          </span>
                        ))}
                        {user.skills.split(",").length > 3 && (
                          <span className="text-xs text-slate-400">
                            +{user.skills.split(",").length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Mutual Friends Count */}
                    {user.mutual_friends > 0 && (
                      <div className="text-center mb-4">
                        <p className="text-xs text-slate-500">
                          {user.mutual_friends} mutual {user.mutual_friends === 1 ? 'friend' : 'friends'}
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors text-sm">
                        Connect
                      </button>
                      <Link
                        to={`/profile/${user.id}`}
                        className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors text-sm text-center"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* MODAL: Friends List with Search */}
        {isFriendsModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div 
              className="bg-white w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-200 bg-white sticky top-0 z-10">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">All Connections</h2>
                    <p className="text-sm text-slate-500 mt-1">{friends.length} friends</p>
                  </div>
                  <button 
                    onClick={() => setIsFriendsModalOpen(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Search and Filter Bar */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>
                  
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-4 py-2.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer text-sm"
                  >
                    <option value="all">All Connections</option>
                    <option value="alphabet">Sort A-Z</option>
                    <option value="recent">Recent First</option>
                  </select>
                </div>
              </div>

              {/* Modal Body - List View */}
              <div className="flex-1 overflow-y-auto">
                {filteredAndSortedFriends.length === 0 ? (
                  <div className="text-center py-16 px-4">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-10 h-10 text-slate-300" />
                    </div>
                    <p className="text-slate-500 font-medium">
                      {searchQuery ? "No connections found matching your search" : "No connections yet"}
                    </p>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="mt-3 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {filteredAndSortedFriends.map((friend) => (
                      <Link
                        key={friend.id}
                        to={`/profile/${friend.id}`}
                        onClick={() => setIsFriendsModalOpen(false)}
                        className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors group"
                      >
                        <div className="relative flex-shrink-0">
                          <img
                            src={friend.profile_image || "/default-profile.png"}
                            alt={friend.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                            {friend.name}
                          </h3>
                          <p className="text-sm text-slate-500 truncate">{friend.email}</p>
                        </div>
                        
                        <button className="p-2 text-slate-400 hover:text-indigo-600 rounded-full hover:bg-indigo-50 transition-colors">
                          <MessageCircle className="w-5 h-5" />
                        </button>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              {filteredAndSortedFriends.length > 0 && (
                <div className="px-6 py-3 border-t border-slate-200 bg-slate-50">
                  <p className="text-sm text-slate-500 text-center">
                    Showing {filteredAndSortedFriends.length} of {friends.length} connections
                  </p>
                </div>
              )}
            </div>
            
            {/* Click outside to close */}
            <div className="absolute inset-0 -z-10" onClick={() => setIsFriendsModalOpen(false)}></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendsList;