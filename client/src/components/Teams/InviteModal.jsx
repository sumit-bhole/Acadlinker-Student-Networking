import React, { useState, useEffect } from "react";
import { X, Search, Check } from "lucide-react";
import api from "../../api/axios"; // Use generic api to get friends
import { inviteFriend } from "../../api/teamApi";

const InviteModal = ({ teamId, onClose }) => {
  const [friends, setFriends] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(null);

  useEffect(() => {
    api.get("/api/friends/list").then(res => {
      setFriends(res.data);
      setLoading(false);
    });
  }, []);

  const handleInvite = async (friendId) => {
    setSending(friendId);
    try {
      await inviteFriend({ team_id: teamId, friend_id: friendId });
      alert("Invite sent!");
      onClose();
    } catch (err) {
      alert("Failed to send invite");
    } finally {
      setSending(null);
    }
  };

  const filtered = friends.filter(f => 
    (f.name || f.full_name).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-fadeIn">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-lg">Invite Members</h3>
          <button onClick={onClose}><X size={20} className="text-slate-400" /></button>
        </div>
        
        <div className="p-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input 
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Search friends..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2">
            {loading ? (
              <p className="text-center text-slate-500 py-4">Loading friends...</p>
            ) : filtered.length === 0 ? (
              <p className="text-center text-slate-500 py-4">No friends found.</p>
            ) : (
              filtered.map(friend => (
                <div key={friend.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <img src={friend.profile_pic_url || "/default-profile.png"} className="w-8 h-8 rounded-full bg-slate-200" alt="" />
                    <span className="font-medium text-sm">{friend.name || friend.full_name}</span>
                  </div>
                  <button 
                    onClick={() => handleInvite(friend.id)}
                    disabled={sending === friend.id}
                    className="px-3 py-1 bg-indigo-600 text-white text-xs rounded-md hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {sending === friend.id ? "..." : "Invite"}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteModal;