import React, { useEffect, useState } from "react";
// --- CRITICAL FIX: Use 'api' instead of 'axios' ---
import api from "../api/axios"; 
import { Link } from "react-router-dom";

const FriendsList = () => {
  const [friends, setFriends] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  const [loadingFriends, setLoadingFriends] = useState(true);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);

  const [errorFriends, setErrorFriends] = useState(null);
  const [errorSuggestions, setErrorSuggestions] = useState(null);

  // -----------------------------  
  // Fetch Friends  
  // -----------------------------
  useEffect(() => {
    // FIX: Use api.get, remove withCredentials
    api.get("/api/friends/list")
      .then((res) => setFriends(res.data))
      .catch((err) => {
        console.error("Friends fetch error:", err);
        setErrorFriends("Failed to fetch friends.");
      })
      .finally(() => setLoadingFriends(false));
  }, []);

  // -----------------------------  
  // Fetch Suggestions  
  // -----------------------------
  useEffect(() => {
    // FIX: Use api.get, remove withCredentials
    api.get("/api/suggestions/")
      .then((res) => {
        // Ensure we handle the response structure correctly
        // Some backends return { data: [...] }, others return just [...]
        const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
        setSuggestions(data);
      })
      .catch((err) => {
        console.error("Suggestions fetch error:", err);
        setErrorSuggestions("Failed to fetch suggestions.");
      })
      .finally(() => setLoadingSuggestions(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      {/* ---------------- FRIENDS SECTION ---------------- */}
      <h2 className="text-3xl font-bold mb-6">Your Friends</h2>

      {loadingFriends ? (
        <div className="flex justify-center py-10">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : errorFriends ? (
        <p className="text-red-500 py-10">{errorFriends}</p>
      ) : friends.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
            <p className="text-gray-500">You have no friends yet.</p>
            <p className="text-sm text-gray-400 mt-2">Try searching for people or check suggestions below!</p>
        </div>
      ) : (
        <div className="space-y-4 mb-10">
          {friends.map((friend) => (
            <Link
              key={friend.id}
              to={`/profile/${friend.id}`}
              className="block bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition border border-gray-100"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={friend.profile_pic_url || friend.profile_image || "/default-profile.png"}
                  alt={friend.name || friend.full_name}
                  className="w-16 h-16 rounded-full object-cover border border-gray-200"
                />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {friend.name || friend.full_name}
                  </h3>
                  <p className="text-gray-600">{friend.email}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* ---------------- SUGGESTIONS SECTION ---------------- */}
      <h2 className="text-3xl font-bold mb-6 mt-12 border-t pt-8 border-gray-200">Suggestions for You</h2>

      {loadingSuggestions ? (
        <div className="flex justify-center py-10">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : errorSuggestions ? (
        <p className="text-red-500 py-10">{errorSuggestions}</p>
      ) : suggestions.length === 0 ? (
        <p className="text-gray-500 py-10">No suggestions available right now.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suggestions.map((user) => (
            <Link
              key={user.id}
              to={`/profile/${user.id}`} 
              className="block bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition cursor-pointer border border-gray-100 hover:border-indigo-100"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={user.profile_pic_url || user.profile_image || "/default-profile.png"}
                  alt={user.name || user.full_name} 
                  className="w-14 h-14 rounded-full object-cover border border-gray-200"
                />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {user.name || user.full_name}
                  </h3>
                  {user.location && (
                      <p className="text-gray-500 text-xs mb-1">{user.location}</p>
                  )}
                  {user.skills && (
                    <div className="flex flex-wrap gap-1 mt-1">
                        {user.skills.split(",").slice(0, 3).map((skill, i) => (
                            <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                {skill.trim()}
                            </span>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default FriendsList;