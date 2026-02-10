import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import UserPosts from "../components/UserPosts"; // Aapka existing UserPosts component
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import {
  FaEnvelope,
  FaPhone,
  FaGraduationCap,
  FaLink,
  FaCalendarAlt,
  FaUserFriends,
  FaCheck,
  FaPlus,
  FaComment,
  FaEdit,
  FaGlobe,
  FaBriefcase
} from "react-icons/fa";
import { FiSend, FiClock } from "react-icons/fi";

const Profile = () => {
  const { currentUser } = useAuth();
  const { userId } = useParams();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("posts");
  const [processingAction, setProcessingAction] = useState(false);

  // FIX: String conversion added to ensure types match (e.g., "5" vs 5)
  // Isse Create Post ka form wapas dikhne lagega agar aap owner hain.
  const isCurrentUser = currentUser && String(currentUser.id) === String(userId);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/profile/${userId}`);
      setUser(res.data);
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

  const renderFriendButton = () => {
    const base = "w-full px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed";

    if (isCurrentUser) {
      return (
        <Link
          to="/edit-profile"
          className={`${base} bg-gradient-to-r from-blue-500 to-cyan-400 text-white hover:from-blue-600 hover:to-cyan-500`}
        >
          <FaEdit className="text-sm" />
          Edit Profile
        </Link>
      );
    }

    if (user.is_friend) {
      return (
        <Link
          to={`/chat/${user.id}`}
          className={`${base} bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600`}
        >
          <FaComment />
          Message
        </Link>
      );
    }

    if (user.request_sent) {
      return (
        <button 
          className={`${base} bg-gray-100 text-gray-600 border border-gray-300 cursor-not-allowed`}
          disabled
        >
          <FiClock />
          {processingAction ? "Processing..." : "Request Sent"}
        </button>
      );
    }

    if (user.request_received) {
      return (
        <div className="flex gap-2 w-full justify-center">
          <button
            onClick={acceptFriendRequest}
            disabled={processingAction}
            className={`${base} bg-gradient-to-r from-emerald-500 to-green-400 text-white hover:from-emerald-600 hover:to-green-500`}
          >
            {processingAction ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <FaCheck /> Accept
              </>
            )}
          </button>
          <button
            onClick={rejectFriendRequest}
            disabled={processingAction}
            className={`${base} bg-white border border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400`}
          >
            Reject
          </button>
        </div>
      );
    }

    return (
      <button
        onClick={sendFriendRequest}
        disabled={processingAction}
        className={`${base} bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600`}
      >
        {processingAction ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <>
            <FaPlus /> Add Friend
          </>
        )}
      </button>
    );
  };

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-white rounded-xl p-3 border border-gray-200 hover:shadow-md transition-shadow duration-300 text-left">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="text-white text-base" />
        </div>
        <div>
          <p className="text-lg font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500 mt-1">{label}</p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-gray-200 rounded-full"></div>
            <div className="w-20 h-20 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">User not found</h2>
          <p className="text-gray-600 mb-6">The profile you're looking for doesn't exist or has been removed.</p>
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Gap between left and right sections */}
        <div className="flex flex-col md:flex-row gap-6">
          
          {/* =======================
              LEFT SIDEBAR (Profile Card)
             ======================= */}
          <div className="w-full md:w-2/5 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden sticky top-6">
              
              {/* Cover Photo */}
              <div className="relative h-36 bg-gradient-to-r from-gray-300 to-gray-400">
                <img
                  src={user.cover_photo_url || "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
                
                {/* Centered Profile Picture overlapping bottom */}
                <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white">
                      <img
                        src={user.profile_pic_url || "/default-profile.png"}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {user.is_online && (
                      <div className="absolute bottom-2 right-2 w-5 h-5 bg-emerald-500 border-4 border-white rounded-full"></div>
                    )}
                  </div>
                </div>
              </div>

              {/* Profile Content */}
              <div className="px-6 pt-20 pb-8 text-center">
                <div className="mb-6">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <h1 className="text-2xl font-bold text-gray-900">
                      {user.full_name}
                    </h1>
                    {user.is_verified && (
                      <FaCheck className="text-blue-500 text-sm" title="Verified" />
                    )}
                  </div>
                  <p className="text-gray-600 flex items-center justify-center gap-2">
                    <FaBriefcase className="text-gray-400" />
                    {user.role || "Member"}
                  </p>
                </div>

                {/* Friend/Edit Button */}
                <div className="w-full max-w-xs mx-auto mb-8">
                  {renderFriendButton()}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 mb-8">
                  <StatCard icon={FaUserFriends} label="Friends" value={user.friend_count || "0"} color="bg-gradient-to-r from-blue-500 to-cyan-400" />
                  <StatCard icon={FiSend} label="Posts" value={user.post_count || "0"} color="bg-gradient-to-r from-purple-500 to-pink-400" />
                  <StatCard icon={FaCalendarAlt} label="Joined" value={new Date(user.created_at).toLocaleDateString('default', { month: 'short', year: 'numeric' })} color="bg-gradient-to-r from-emerald-500 to-green-400" />
                  <StatCard icon={FaGlobe} label="Location" value={user.location || "Remote"} color="bg-gradient-to-r from-amber-500 to-orange-400" />
                </div>

                <hr className="border-gray-100 mb-8" />

                <div className="mb-8 text-left">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <FaUserFriends className="text-indigo-500" /> About
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {user.description || "This user hasn't shared anything about themselves yet."}
                  </p>
                </div>

                <div className="mb-8 text-left">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {user.skills ? user.skills.split(",").map((skill, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-sm font-medium hover:bg-gray-100 transition-colors duration-200">
                        {skill.trim()}
                      </span>
                    )) : <span className="text-sm text-gray-400 italic">No skills listed</span>}
                  </div>
                </div>

                <div className="space-y-3 mb-6 text-left">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-lg"><FaEnvelope className="text-white text-sm" /></div>
                    <div><p className="text-xs text-gray-500">Email</p><p className="font-medium text-sm break-all">{user.email}</p></div>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                      <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-400 rounded-lg"><FaPhone className="text-white text-sm" /></div>
                      <div><p className="text-xs text-gray-500">Phone</p><p className="font-medium text-sm">{user.phone}</p></div>
                    </div>
                  )}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                    <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-400 rounded-lg"><FaGraduationCap className="text-white text-sm" /></div>
                    <div><p className="text-xs text-gray-500">Education</p><p className="font-medium text-sm">{user.education || "Not specified"}</p></div>
                  </div>
                </div>

                {user.website && (
                  <div className="text-left">
                    <a href={user.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200 group">
                      <div className="p-2 bg-gradient-to-r from-gray-600 to-gray-700 rounded-lg"><FaLink className="text-white text-sm" /></div>
                      <span className="font-medium text-sm group-hover:text-blue-600 transition-colors duration-200 truncate">{user.website}</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* =======================
              RIGHT CONTENT (Posts)
             ======================= */}
          <div className="w-full md:w-3/5">
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

            {/* Posts Container */}
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

              {/* Rendering Your UserPosts Component Here */}
              <div className="p-4 md:p-6">
                <UserPosts
                  userId={userId}
                  isCurrentUser={isCurrentUser} // Ensure this is correctly passed
                />
              </div>
            </div>
            
            {/* Recent Interactions (Optional) */}
            {user.recent_interactions && user.recent_interactions.length > 0 && (
              <div className="mt-6 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Interactions</h3>
                <div className="space-y-4">
                  {user.recent_interactions.map((interaction, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200 cursor-pointer">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                        {interaction.initials}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{interaction.name}</p>
                        <p className="text-sm text-gray-500">{interaction.action}</p>
                      </div>
                      <span className="text-sm text-gray-400">{interaction.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;