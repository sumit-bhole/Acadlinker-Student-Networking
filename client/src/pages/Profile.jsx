import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import UserPosts from "../components/UserPosts";
import { useParams, Link } from "react-router-dom";
import AskHelpCard from "../components/AskHelpCard";
import api from "../api/axios";
import {
  FaCheck,
  FaPlus,
  FaComment,
  FaEdit,
  FaCamera,
  FaTrash
} from "react-icons/fa";
import { FiClock } from "react-icons/fi";
import { MapPin, Mail, Phone, Link as LinkIcon, GraduationCap, Calendar, X } from "lucide-react";

const Profile = () => {
  const { currentUser, refreshUser } = useAuth();
  const { userId } = useParams();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("posts");
  const [processingAction, setProcessingAction] = useState(false);

  // 🟢 MODAL STATES
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isBasicInfoModalOpen, setIsBasicInfoModalOpen] = useState(false);
  const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isEditingContact, setIsEditingContact] = useState(false);
  
  // 🟢 AVATAR PREVIEW STATES
  const [tempAvatarFile, setTempAvatarFile] = useState(null);
  const [tempAvatarPreview, setTempAvatarPreview] = useState(null);
  const [isAvatarRemoved, setIsAvatarRemoved] = useState(false);

  // 🟢 EDIT FORM STATE
  const [editForm, setEditForm] = useState({});

  const isCurrentUser = currentUser && String(currentUser.id) === String(userId);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/profile/${userId}`);
      setUser(res.data);
      setEditForm({
        full_name: res.data.full_name || '',
        location: res.data.location || '',
        description: res.data.description || '',
        skills: res.data.skills || '',
        email: res.data.email || '',
        mobile_no: res.data.mobile_no || '', 
        education: res.data.education || '',
        website: res.data.website || ''
      });
    } catch (err) {
      console.error("Profile fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  const sendFriendRequest = async () => {
    try {
      setProcessingAction(true);
      await api.post(`/api/friends/send/${user.id}`);
      await fetchUserData();
    } catch (err) {
      console.error("Failed to send request", err);
    } finally {
      setProcessingAction(false);
    }
  };

  const acceptFriendRequest = async () => {
    try {
      setProcessingAction(true);
      await api.post(`/api/friends/accept/${user.request_id}`);
      await fetchUserData();
    } catch (err) {
      console.error("Failed to accept request", err);
    } finally {
      setProcessingAction(false);
    }
  };

  const rejectFriendRequest = async () => {
    try {
      setProcessingAction(true);
      await api.post(`/api/friends/reject/${user.request_id}`);
      await fetchUserData();
    } catch (err) {
      console.error("Failed to reject request", err);
    } finally {
      setProcessingAction(false);
    }
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const submitProfileUpdate = async (e) => {
    e?.preventDefault();
    const data = new FormData();
    
    Object.entries(editForm).forEach(([key, value]) => {
        data.append(key, value || ""); 
    });

    try {
      setProcessingAction(true);
      await api.patch('/api/profile/edit', data);
      await refreshUser(); 
      await fetchUserData(); 
      setIsBasicInfoModalOpen(false);
      setIsSkillsModalOpen(false);
      setIsDetailsModalOpen(false);
      setIsEditingContact(false);
    } catch (err) {
      console.error("Profile update error:", err);
      alert("Failed to update profile.");
    } finally {
      setProcessingAction(false);
    }
  };

  // 🟢 AVATAR FLOW
  const handleAvatarFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setTempAvatarFile(file);
      setTempAvatarPreview(URL.createObjectURL(file));
      setIsAvatarRemoved(false);
    }
  };

  const handleAvatarRemovePreview = () => {
    setTempAvatarFile(null);
    setTempAvatarPreview(null);
    setIsAvatarRemoved(true);
  };

  const saveAvatarChanges = async () => {
    const data = new FormData();
    
    if (tempAvatarFile) {
      data.append('profile_pic', tempAvatarFile);
    } else if (isAvatarRemoved) {
      data.append('profile_pic', ''); 
      data.append('remove_profile_pic', 'true'); 
    } else {
      setIsAvatarModalOpen(false);
      return; 
    }

    Object.entries(editForm).forEach(([key, value]) => {
      data.append(key, value || ""); 
    });

    try {
      setProcessingAction(true);
      await api.patch('/api/profile/edit', data);
      await refreshUser();
      await fetchUserData();
      setIsAvatarModalOpen(false);
    } catch (err) {
      console.error("Avatar update error:", err);
      alert("Failed to update picture.");
    } finally {
      setProcessingAction(false);
    }
  };

  const renderFriendButton = () => {
    const base = "px-5 py-2 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2 text-sm shadow-sm active:scale-95 disabled:opacity-70 disabled:pointer-events-none";

    if (isCurrentUser) return null;

    if (user.is_friend) {
      return (
        <Link to={`/chat/${user.id}`} className={`${base} bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-100`}>
          <FaComment /> Message
        </Link>
      );
    }

    if (user.request_sent) {
      return (
        <button className={`${base} bg-slate-50 text-slate-500 border border-slate-200 cursor-not-allowed`} disabled>
          <FiClock /> {processingAction ? "Processing..." : "Sent"}
        </button>
      );
    }

    if (user.request_received) {
      return (
        <div className="flex gap-2">
          <button onClick={acceptFriendRequest} disabled={processingAction} className={`${base} bg-indigo-600 text-white border border-indigo-600 hover:bg-indigo-700 px-4`}>
            {processingAction ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <><FaCheck /> Accept</>}
          </button>
          <button onClick={rejectFriendRequest} disabled={processingAction} className={`${base} bg-white text-rose-600 border border-rose-200 hover:bg-rose-50 px-4`}>
            Reject
          </button>
        </div>
      );
    }

    return (
      <button onClick={sendFriendRequest} disabled={processingAction} className={`${base} bg-indigo-600 text-white border border-indigo-600 hover:bg-indigo-700 shadow-indigo-200 shadow-md`}>
        {processingAction ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <><FaPlus /> Connect</>}
      </button>
    );
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-slate-200 rounded-full"></div>
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen md:h-screen bg-slate-50 pt-0 pb-0 px-0 pr-4 lg:pr-6 overflow-y-auto md:overflow-hidden relative">
      
      <style>
        {`
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}
      </style>

      <div className="w-full max-w-[1400px] h-full ml-0">
        <div className="flex flex-col md:flex-row gap-4 lg:gap-8 h-auto md:h-full items-start">
          
          {/* =======================
              LEFT SIDEBAR 
             ======================= */}
          <div className="w-full md:w-[450px] lg:w-[500px] flex-shrink-0 h-auto md:h-[calc(100vh-4rem)] md:overflow-y-auto no-scrollbar bg-white border-r border-slate-200 shadow-sm">
            
            <div className="flex flex-col min-h-full pb-0 pt-10">
              
              {/* Avatar & Action Button Row */}
              <div className="flex justify-between items-start px-5 mb-5 shrink-0">
                <div className="relative">
                  <div 
                    onClick={() => {
                      if (isCurrentUser) {
                        setTempAvatarFile(null);
                        setTempAvatarPreview(user.profile_pic_url);
                        setIsAvatarRemoved(false);
                        setIsAvatarModalOpen(true);
                      }
                    }}
                    className={`w-28 h-28 rounded-2xl border-[3px] border-slate-100 shadow-sm overflow-hidden bg-indigo-50 flex items-center justify-center ${isCurrentUser ? 'cursor-pointer group' : ''}`}
                  >
                    {user.profile_pic_url ? (
                      <img src={user.profile_pic_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-5xl font-black text-indigo-400">{getInitials(user.full_name)}</span>
                    )}
                    {isCurrentUser && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <FaCamera className="text-white text-2xl" />
                      </div>
                    )}
                  </div>
                  {user.is_online && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-[3px] border-white rounded-full"></div>
                  )}
                </div>
                
                <div className="pt-2">
                  {renderFriendButton()}
                </div>
              </div>

              {/* Header Info, About & Location */}
              <div className="px-5 shrink-0 relative group">
                {isCurrentUser && (
                  <button 
                    onClick={() => setIsBasicInfoModalOpen(true)}
                    className="absolute top-0 right-5 p-2 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <FaEdit />
                  </button>
                )}

                <div className="flex items-center gap-1.5 pr-8">
                  <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{user.full_name}</h1>
                  {user.is_verified && <FaCheck className="text-blue-500 text-sm" title="Verified" />}
                </div>
                
                {user.description && (
                  <p className="text-slate-700 text-sm mt-3 mb-3 leading-relaxed font-medium pr-2">
                    {user.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-2 mt-2 text-sm font-medium">
                  <p className="text-slate-500 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {user.location || "Remote"}
                  </p>
                  <span className="text-slate-300">•</span>
                  <button 
                    onClick={() => setIsContactModalOpen(true)} 
                    className="text-indigo-600 hover:underline font-bold"
                  >
                    Contact info
                  </button>
                </div>
              </div>

              {/* Stats Strip */}
              <div className="grid grid-cols-3 border-y border-slate-100 py-5 mx-5 mt-6 mb-6 shrink-0 divide-x divide-slate-100">
                <div className="text-center group">
                  <p className="text-2xl font-black text-slate-800 group-hover:text-amber-500 transition-colors">{user.rp || user.rp_points || user.reputation_points || "0"}</p>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mt-1">RP Points</p>
                </div>
                <div className="text-center group">
                  <p className="text-2xl font-black text-slate-800 group-hover:text-blue-500 transition-colors">{user.friend_count || "0"}</p>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mt-1">Friends</p>
                </div>
                <div className="text-center group">
                  <p className="text-2xl font-black text-slate-800 group-hover:text-purple-500 transition-colors">{user.post_count || "0"}</p>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mt-1">Posts</p>
                </div>
              </div>

              {/* Skills */}
              <div className="px-5 mb-6 shrink-0 relative group">
                {isCurrentUser && (
                  <button 
                    onClick={() => setIsSkillsModalOpen(true)}
                    className="absolute -top-2 right-5 p-2 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 z-10"
                  >
                    <FaEdit />
                  </button>
                )}
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Skills</h3>
                <div className="flex flex-wrap gap-1.5 pr-8">
                  {user.skills ? user.skills.split(",").slice(0, 6).map((skill, i) => (
                    <span key={i} className="px-3 py-1 rounded-md border border-indigo-100 bg-indigo-50 text-indigo-700 text-xs font-bold">{skill.trim()}</span>
                  )) : <span className="text-sm text-slate-400 italic">No skills added</span>}
                  {user.skills && user.skills.split(",").length > 6 && (
                    <span className="px-2 py-1 text-slate-400 text-xs font-bold">+{user.skills.split(",").length - 6}</span>
                  )}
                </div>
              </div>

              {/* Details (Education & Website) */}
              <div className="px-5 space-y-4 shrink-0 relative group pb-4">
                {isCurrentUser && (
                  <button 
                    onClick={() => setIsDetailsModalOpen(true)}
                    className="absolute -top-2 right-5 p-2 bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 z-10"
                  >
                    <FaEdit />
                  </button>
                )}
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Details</h3>
                
                <div className="flex items-center gap-3">
                  <GraduationCap className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-sm font-medium text-slate-700 truncate pr-8">{user.education || "Not specified"}</span>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-sm font-medium text-slate-700">Joined {new Date(user.created_at).toLocaleDateString('default', { month: 'short', year: 'numeric' })}</span>
                </div>

                {user.website && (
                  <div className="flex items-center gap-3">
                    <LinkIcon className="w-4 h-4 text-indigo-400 shrink-0" />
                    <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-indigo-600 hover:underline truncate block pr-8">
                      {user.website}
                    </a>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* =======================
              RIGHT CONTENT (Posts)
             ======================= */}
          <div className="flex-1 w-full md:w-auto h-auto md:h-[calc(100vh-4rem)] md:overflow-y-auto no-scrollbar py-8 pl-2 lg:pl-4">
             <div className="mb-8">
                <AskHelpCard user={user} isOwner={isCurrentUser} onRefresh={fetchUserData} />
             </div>
            
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {isCurrentUser ? "Your Posts" : `${user.full_name}'s Posts`}
              </h2>
              <p className="text-gray-500">
                {isCurrentUser 
                  ? "Share your thoughts, ideas, and updates with your friends."
                  : `See what ${user.full_name} has been sharing lately.`
                }
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
              <div className="border-b border-gray-200 overflow-x-auto">
                <div className="flex min-w-max">
                  {['posts', 'activity', 'friends', 'photos'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-6 py-4 font-medium text-sm uppercase tracking-wider transition-all duration-300 ${
                        activeTab === tab
                          ? 'text-indigo-600 border-b-2 border-indigo-500'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 md:p-6">
                <UserPosts userId={userId} isCurrentUser={isCurrentUser} />
              </div>
            </div>
            
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 🟢 MODALS PORTALS */}
      {/* ========================================================= */}

      {/* 1. Avatar Modal */}
      {isAvatarModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">Profile Picture</h3>
              <button onClick={() => setIsAvatarModalOpen(false)} className="text-slate-400 hover:text-slate-700"><X size={20}/></button>
            </div>
            <div className="p-8 flex flex-col items-center">
              <div className="w-48 h-48 rounded-3xl border-4 border-slate-100 shadow-inner overflow-hidden mb-8 bg-indigo-50 flex items-center justify-center">
                {tempAvatarPreview ? (
                  <img src={tempAvatarPreview} alt="DP" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-7xl font-black text-indigo-300">{getInitials(user.full_name)}</span>
                )}
              </div>
              <div className="flex gap-3 w-full mb-4">
                <label className="flex-1 py-3 bg-indigo-50 text-indigo-700 font-bold rounded-xl text-center cursor-pointer hover:bg-indigo-100 transition">
                  Change DP
                  <input type="file" className="hidden" accept="image/*" onChange={handleAvatarFileSelect} disabled={processingAction}/>
                </label>
                <button onClick={handleAvatarRemovePreview} disabled={processingAction} className="flex-1 py-3 bg-rose-50 text-rose-600 font-bold rounded-xl hover:bg-rose-100 transition flex items-center justify-center gap-2">
                  <FaTrash className="text-sm"/> Remove
                </button>
              </div>
              <button onClick={saveAvatarChanges} disabled={processingAction || (!tempAvatarFile && !isAvatarRemoved)} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition shadow-md shadow-indigo-200 disabled:opacity-50">
                {processingAction ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Basic Info Modal */}
      {isBasicInfoModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">Edit Basic Info</h3>
              <button onClick={() => setIsBasicInfoModalOpen(false)} className="text-slate-400 hover:text-slate-700"><X size={20}/></button>
            </div>
            <form onSubmit={submitProfileUpdate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Full Name</label>
                <input type="text" name="full_name" value={editForm.full_name} onChange={handleEditChange} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" required />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">About</label>
                <textarea name="description" value={editForm.description} onChange={handleEditChange} className="w-full border border-slate-200 rounded-xl px-4 py-3 h-28 resize-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" placeholder="Write a short bio..." />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Location</label>
                <input type="text" name="location" value={editForm.location} onChange={handleEditChange} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" placeholder="e.g. Pune, India" />
              </div>
              <button type="submit" disabled={processingAction} className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition shadow-md shadow-indigo-200 disabled:opacity-70">
                {processingAction ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. Skills Modal */}
      {isSkillsModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">Edit Skills</h3>
              <button onClick={() => setIsSkillsModalOpen(false)} className="text-slate-400 hover:text-slate-700"><X size={20}/></button>
            </div>
            <form onSubmit={submitProfileUpdate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Skills (comma separated)</label>
                <input type="text" name="skills" value={editForm.skills} onChange={handleEditChange} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" placeholder="React, Python, Design..." />
              </div>
              <button type="submit" disabled={processingAction} className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition shadow-md shadow-indigo-200 disabled:opacity-70">
                {processingAction ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 4. Details Modal */}
      {isDetailsModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">Edit Details</h3>
              <button onClick={() => setIsDetailsModalOpen(false)} className="text-slate-400 hover:text-slate-700"><X size={20}/></button>
            </div>
            <form onSubmit={submitProfileUpdate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Education</label>
                <input type="text" name="education" value={editForm.education} onChange={handleEditChange} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" placeholder="S.B. Patil College of Engineering" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Website URL</label>
                <input type="url" name="website" value={editForm.website} onChange={handleEditChange} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" placeholder="https://yourwebsite.com" />
              </div>
              <button type="submit" disabled={processingAction} className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition shadow-md shadow-indigo-200 disabled:opacity-70">
                {processingAction ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 5. Contact Info Modal */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">{isEditingContact ? "Edit Contact Info" : `${user.full_name}'s Contact Info`}</h3>
              <button 
                onClick={() => { setIsContactModalOpen(false); setIsEditingContact(false); }} 
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={20}/>
              </button>
            </div>
            
            {isEditingContact ? (
              <form onSubmit={(e) => { submitProfileUpdate(e).then(() => setIsEditingContact(false)); }} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Email</label>
                  <input type="email" name="email" value={editForm.email} readOnly className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-slate-50 text-slate-500 cursor-not-allowed outline-none" title="Email cannot be changed here" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Mobile Number</label>
                  <input type="text" name="mobile_no" value={editForm.mobile_no} onChange={handleEditChange} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" />
                </div>
                <div className="flex gap-3 mt-4">
                  <button type="button" onClick={() => setIsEditingContact(false)} className="flex-1 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition">Cancel</button>
                  <button type="submit" disabled={processingAction} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition shadow-md shadow-indigo-200 disabled:opacity-70">
                    {processingAction ? "Saving..." : "Save"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-6 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600"><Mail size={20}/></div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{user.email}</p>
                    <p className="text-xs text-slate-500 font-medium">Email Address</p>
                  </div>
                </div>
                {user.mobile_no && (
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600"><Phone size={20}/></div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{user.mobile_no}</p>
                      <p className="text-xs text-slate-500 font-medium">Mobile Number</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600"><MapPin size={20}/></div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{user.location || "Remote"}</p>
                    <p className="text-xs text-slate-500 font-medium">Location</p>
                  </div>
                </div>
                
                {isCurrentUser && (
                  <button 
                    onClick={() => setIsEditingContact(true)} 
                    className="w-full py-3 mt-4 border-2 border-slate-100 text-slate-700 font-bold rounded-xl hover:border-indigo-200 hover:text-indigo-600 transition flex items-center justify-center gap-2"
                  >
                    <FaEdit /> Edit Contact Info
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default Profile;