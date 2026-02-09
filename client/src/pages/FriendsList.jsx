import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { Link } from "react-router-dom";
import { UserPlus, UserCheck, X, Check, Users, Search, Loader2 } from "lucide-react";

const FriendsList = () => {
  const [requests, setRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null); // Tracks which ID is processing
  const [successMsg, setSuccessMsg] = useState("");

  // -----------------------------
  // 1. Fetch All Data in Parallel
  // -----------------------------
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [reqRes, friendsRes, suggRes] = await Promise.all([
          api.get("/api/friends/requests"), // Ensure this route exists in backend
          api.get("/api/friends/list"),
          api.get("/api/suggestions/")
        ]);

        setRequests(reqRes.data || []);
        setFriends(friendsRes.data || []);
        
        // Handle varied suggestion response structures
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

  // -----------------------------
  // 2. Action Handlers
  // -----------------------------
  const handleAccept = async (requestId, senderId, senderName, senderProfile) => {
    setActionLoading(requestId);
    try {
      await api.post(`/api/friends/accept/${requestId}`);
      
      // OPTIMISTIC UPDATE:
      // 1. Remove from requests
      setRequests((prev) => prev.filter((req) => req.id !== requestId));
      
      // 2. Add to friends list immediately
      const newFriend = {
        id: senderId,
        name: senderName,
        profile_image: senderProfile,
        email: "Contact via profile" // Placeholder until refresh
      };
      setFriends((prev) => [...prev, newFriend]);
      
      // 3. Show success
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
      // Remove from list immediately
      setRequests((prev) => prev.filter((req) => req.id !== requestId));
    } catch (err) {
      alert("Failed to reject request.");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium animate-pulse">Loading your network...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-12 pb-24">
      
      {/* SUCCESS TOAST */}
      {successMsg && (
        <div className="fixed top-20 right-5 z-50 bg-green-100 border border-green-200 text-green-800 px-4 py-3 rounded-lg shadow-lg flex items-center animate-bounce-in">
          <UserCheck className="w-5 h-5 mr-2" />
          {successMsg}
        </div>
      )}

      {/* ---------------- 1. FRIEND REQUESTS ---------------- */}
      {requests.length > 0 && (
        <section className="animate-fade-in-up">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <UserPlus className="w-6 h-6 mr-2 text-indigo-600" />
            Friend Requests <span className="ml-2 text-sm bg-red-100 text-red-600 py-0.5 px-2 rounded-full">{requests.length}</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {requests.map((req) => (
              <div key={req.id} className="bg-white p-4 rounded-xl shadow-sm border border-indigo-100 flex items-center justify-between">
                <Link to={`/profile/${req.sender_id}`} className="flex items-center space-x-3 overflow-hidden">
                  <img
                    src={req.sender_profile || "/default-profile.png"}
                    alt={req.sender_name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-indigo-50"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900 truncate max-w-[120px]">{req.sender_name}</h3>
                    <p className="text-xs text-indigo-500 font-medium">Wants to connect</p>
                  </div>
                </Link>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleAccept(req.id, req.sender_id, req.sender_name, req.sender_profile)}
                    disabled={actionLoading === req.id}
                    className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                    title="Accept"
                  >
                    {actionLoading === req.id ? <Loader2 className="w-5 h-5 animate-spin"/> : <Check className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => handleReject(req.id)}
                    disabled={actionLoading === req.id}
                    className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-600 transition disabled:opacity-50"
                    title="Reject"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ---------------- 2. YOUR FRIENDS ---------------- */}
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <Users className="w-6 h-6 mr-2 text-indigo-600" />
          Your Network
        </h2>

        {friends.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">You haven't added any friends yet.</p>
            <p className="text-sm text-gray-400 mt-1">Check the suggestions below to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {friends.map((friend) => (
              <Link
                key={friend.id}
                to={`/profile/${friend.id}`}
                className="group block bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition border border-gray-100 hover:border-indigo-200"
              >
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <img
                      src={friend.profile_image || "/default-profile.png"}
                      alt={friend.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-100 group-hover:border-indigo-100 transition"
                    />
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition">
                      {friend.name}
                    </h3>
                    <p className="text-sm text-gray-500">{friend.email}</p>
                    <span className="inline-block mt-2 text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                      Connected
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ---------------- 3. SUGGESTIONS ---------------- */}
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center pt-8 border-t border-gray-100">
          <Search className="w-6 h-6 mr-2 text-indigo-600" />
          People You May Know
        </h2>

        {suggestions.length === 0 ? (
          <p className="text-gray-500 italic">No new suggestions at the moment.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {suggestions.map((user) => (
              <Link
                key={user.id}
                to={`/profile/${user.id}`}
                className="block bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 group"
              >
                <div className="h-20 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-80 group-hover:opacity-100 transition"></div>
                <div className="px-5 pb-5 relative">
                  <div className="absolute -top-10 left-5">
                    <img
                      src={user.profile_pic_url || user.profile_image || "/default-profile.png"}
                      alt={user.name}
                      className="w-20 h-20 rounded-xl object-cover border-4 border-white shadow-md"
                    />
                  </div>
                  <div className="mt-12">
                    <h3 className="text-lg font-bold text-gray-900 truncate">{user.name || user.full_name}</h3>
                    {user.skills && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {user.skills.split(",").slice(0, 2).map((skill, i) => (
                          <span key={i} className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                            {skill.trim()}
                          </span>
                        ))}
                        {user.skills.split(",").length > 2 && (
                          <span className="text-xs text-gray-400 py-1">+{user.skills.split(",").length - 2}</span>
                        )}
                      </div>
                    )}
                    <button className="mt-4 w-full py-2 bg-indigo-50 text-indigo-600 font-semibold rounded-lg text-sm group-hover:bg-indigo-600 group-hover:text-white transition">
                      View Profile
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

    </div>
  );
};

export default FriendsList;