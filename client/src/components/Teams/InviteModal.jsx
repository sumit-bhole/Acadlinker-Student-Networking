import React, { useState, useEffect } from "react";
import { X, Search, Check, UserPlus, Users, Loader2 } from "lucide-react";
import api from "../../api/axios"; 
import { inviteFriend, getTeamDetails } from "../../api/teamApi";

const InviteModal = ({ teamId, onClose }) => {
  const [friends, setFriends] = useState([]);
  const [existingMemberIds, setExistingMemberIds] = useState(new Set());
  const [alreadyInvitedIds, setAlreadyInvitedIds] = useState(new Set()); 
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Friends List
        const friendsRes = await api.get("/api/friends/list");
        setFriends(friendsRes.data);

        // 2. Fetch Team Details (to check who is already a member/invited)
        const teamRes = await getTeamDetails(teamId);
        
        // Mark existing members
        const memberIds = new Set(teamRes.data.members.map(m => m.user_id));
        setExistingMemberIds(memberIds);

        // Mark pending invites (from the backend update)
        const pendingIds = new Set(teamRes.data.pending_invite_ids || []);
        setAlreadyInvitedIds(pendingIds);

      } catch (err) {
        console.error("Failed to load invite data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [teamId]);

  const handleInvite = async (friendId) => {
    setProcessing(friendId);
    try {
      await inviteFriend({ team_id: teamId, friend_id: friendId });
      // Update local UI immediately
      setAlreadyInvitedIds(prev => new Set(prev).add(friendId));
    } catch (err) {
      alert(err.response?.data?.error || "Failed to send invite");
    } finally {
      setProcessing(null);
    }
  };

  const filtered = friends.filter(f => 
    (f.name || f.full_name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h3 className="font-bold text-lg text-slate-800">Invite Members</h3>
            <p className="text-xs text-slate-500">Add friends to your workspace</p>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition">
            <X size={20} />
          </button>
        </div>
        
        {/* Search */}
        <div className="p-4 border-b border-slate-50 bg-slate-50/50">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input 
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition shadow-sm"
              placeholder="Search friends..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 bg-white">
          {loading ? (
            <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center text-slate-400">
              <Users size={32} className="mb-2 opacity-20"/>
              <p className="text-sm">No friends found.</p>
            </div>
          ) : (
            filtered.map(friend => {
              const isMember = existingMemberIds.has(friend.id);
              const isSent = alreadyInvitedIds.has(friend.id);
              const name = friend.name || friend.full_name || "Unknown";
              const initial = name[0]?.toUpperCase();
              
              // 🟢 FIX: Use 'profile_image' to match your working FriendsList
              const userImage = friend.profile_image || friend.profile_pic || null;

              return (
                <div key={friend.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition group">
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex-shrink-0 border border-slate-100 relative">
                      {userImage ? (
                        <img 
                          src={userImage} 
                          className="w-full h-full object-cover" 
                          alt={name}
                          onError={(e) => {
                            e.target.style.display = 'none'; // Hide broken image
                            e.target.nextSibling.style.display = 'flex'; // Show fallback
                          }} 
                        />
                      ) : null}
                      {/* Fallback Initials (Shown if image missing or broken) */}
                      <div 
                        className="absolute inset-0 bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm"
                        style={{ display: userImage ? 'none' : 'flex' }}
                      >
                        {initial}
                      </div>
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-slate-800">{name}</span>
                      <span className="text-[10px] text-slate-500">
                        {isMember ? "Already in team" : "Friend"} 
                      </span>
                    </div>
                  </div>

                  {/* Smart Buttons */}
                  {isMember ? (
                    <span className="px-3 py-1.5 bg-slate-100 text-slate-400 text-xs font-bold rounded-lg cursor-not-allowed border border-slate-200">
                      Member
                    </span>
                  ) : isSent ? (
                    <button disabled className="px-3 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-200 text-xs font-bold rounded-lg flex items-center gap-1 cursor-default">
                      <Check size={14} /> Sent
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleInvite(friend.id)}
                      disabled={processing === friend.id}
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition shadow-md shadow-indigo-200 flex items-center gap-1 active:scale-95 disabled:opacity-70"
                    >
                      {processing === friend.id ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
                      Invite
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default InviteModal;