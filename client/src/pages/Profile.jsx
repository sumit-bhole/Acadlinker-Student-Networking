import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import UserPosts from "../components/UserPosts";
import { useParams, Link } from "react-router-dom";

// --- CRITICAL FIX: Use your configured API instance ---
import api from "../api/axios"; 

import {
  FaEnvelope,
  FaPhone,
  FaGraduationCap,
  FaMapMarkerAlt,
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
import { FiSend, FiClock, FiUsers } from "react-icons/fi";

const Profile = () => {
  const { currentUser } = useAuth();
  const { userId } = useParams(); // Returns a String (UUID)

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("posts");
  const [processingAction, setProcessingAction] = useState(false);

  // --- CRITICAL FIX: Do NOT use parseInt(). IDs are UUID strings now. ---
  const isCurrentUser = currentUser && currentUser.id === userId;

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

  /* ---------------- Enhanced Friend Actions ---------------- */
  
  const sendFriendRequest = async () => {
    try {
      setProcessingAction(true);
      await api.post(`/api/friends/send/${user.id}`);
      // Fetch updated user data to get the latest state
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
      // Fetch updated user data
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
      // Fetch updated user data
      await fetchUserData();
    } catch (err) {
      console.error("Failed to reject request", err);
    } finally {
      setProcessingAction(false);
    }
  };

  /* ---------------- Button Renderer ---------------- */
  const renderFriendButton = () => {
    const base = "px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed";

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
          className={`${base} bg-gradient-to-r from-gray-100 to-gray-50 text-gray-400 border border-gray-200 cursor-not-allowed`}
          disabled
        >
          <FiClock />
          {processingAction ? "Processing..." : "Request Sent"}
        </button>
      );
    }

    if (user.request_received) {
      return (
        <div className="flex gap-3">
          <button
            onClick={acceptFriendRequest}
            disabled={processingAction}
            className={`${base} bg-gradient-to-r from-emerald-500 to-green-400 text-white hover:from-emerald-600 hover:to-green-500`}
          >
            {processingAction ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Accepting...
              </>
            ) : (
              <>
                <FaCheck />
                Accept
              </>
            )}
          </button>
          <button
            onClick={rejectFriendRequest}
            disabled={processingAction}
            className={`${base} bg-white border border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200`}
          >
            {processingAction ? "Processing..." : "Reject"}
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
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Sending...
          </>
        ) : (
          <>
            <FaPlus />
            Add Friend
          </>
        )}
      </button>
    );
  };

  /* ---------------- Stats Component ---------------- */
  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="text-white text-lg" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500 mt-1">{label}</p>
        </div>
      </div>
    </div>
  );

  /* ---------------- Loading States ---------------- */
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-gray-200 rounded-full"></div>
            <div className="w-24 h-24 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="mt-6 text-gray-600 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
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

  /* ---------------- Main UI ---------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Cover Section with Gradient Overlay */}
      <div className="relative h-64 md:h-80 w-full">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
          {user.cover_photo_url && (
            <img
              src={user.cover_photo_url}
              alt="Cover"
              className="w-full h-full object-cover mix-blend-overlay opacity-30"
            />
          )}
        </div>
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-300/20 rounded-full blur-3xl"></div>
        </div>
      </div>

      {/* Main Content Container - FIXED: Added more top margin to prevent overlap */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 md:-mt-16 relative z-10">
        {/* Profile Header Card - FIXED: Adjusted padding to prevent name overlap */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden mb-8 transform transition-all duration-500">
          {/* Profile Image with Glow Effect - FIXED: Changed positioning */}
          <div className="relative px-6 md:px-8 pt-6 md:pt-8">
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
              {/* Profile Image Container */}
              <div className="relative -mt-16 sm:-mt-20">
                <div className="relative">
                  <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl border-8 border-white shadow-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                    <img
                      src={user.profile_pic_url || "/default-profile.png"}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {user.is_online && (
                    <div className="absolute bottom-3 right-3 w-5 h-5 sm:w-6 sm:h-6 bg-emerald-500 border-4 border-white rounded-full"></div>
                  )}
                </div>
              </div>

              {/* Profile Info - FIXED: Adjusted margins to prevent overlap */}
              <div className="flex-1 pt-4 sm:pt-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                        {user.full_name}
                      </h1>
                      {user.is_verified && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-medium flex items-center gap-1">
                          <FaCheck className="text-xs" />
                          Verified
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 text-lg mb-4 flex items-center gap-2">
                      <FaBriefcase className="text-gray-400" />
                      {user.role || "Software Engineer"}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      {user.skills ? (
                        user.skills.split(",").map((skill, i) => (
                          <span
                            key={i}
                            className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 text-sm font-medium hover:from-gray-100 hover:to-gray-200 transition-all duration-200 cursor-pointer"
                          >
                            {skill.trim()}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-400 italic">
                          No skills listed yet
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons - REMOVED: Follow button */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    {renderFriendButton()}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Bar - Adjusted margin-top for better spacing */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-gray-100">
              <StatCard
                icon={FaUserFriends}
                label="Friends"
                value={user.friend_count || "0"}
                color="bg-gradient-to-r from-blue-500 to-cyan-400"
              />
              <StatCard
                icon={FiSend}
                label="Posts"
                value={user.post_count || "0"}
                color="bg-gradient-to-r from-purple-500 to-pink-400"
              />
              <StatCard
                icon={FaCalendarAlt}
                label="Joined"
                value={new Date(user.created_at).toLocaleDateString('default', { month: 'short', year: 'numeric' })}
                color="bg-gradient-to-r from-emerald-500 to-green-400"
              />
              <StatCard
                icon={FaGlobe}
                label="Location"
                value={user.location || "Remote"}
                color="bg-gradient-to-r from-amber-500 to-orange-400"
              />
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* About Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg">
                    <FaUserFriends className="text-white text-lg" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">About</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  {user.description || "This user hasn't shared anything about themselves yet."}
                </p>
              </div>
            </div>

            {/* Contact Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl">
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <FaEnvelope className="text-indigo-500" />
                  Contact Info
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-50 transition-all duration-200">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-lg">
                      <FaEnvelope className="text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{user.email}</p>
                    </div>
                  </div>

                  {user.phone && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-50 transition-all duration-200">
                      <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-400 rounded-lg">
                        <FaPhone className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium">{user.phone}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-50 transition-all duration-200">
                    <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-400 rounded-lg">
                      <FaGraduationCap className="text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Education</p>
                      <p className="font-medium">{user.education || "Not specified"}</p>
                    </div>
                  </div>

                  {user.location && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-50 transition-all duration-200">
                      <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-400 rounded-lg">
                        <FaMapMarkerAlt className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p className="font-medium">{user.location}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Links Card */}
            {user.website && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl">
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FaLink className="text-blue-500" />
                    Links
                  </h3>
                  <a
                    href={user.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-50 transition-all duration-200 group"
                  >
                    <div className="p-2 bg-gradient-to-r from-gray-600 to-gray-700 rounded-lg">
                      <FaGlobe className="text-white" />
                    </div>
                    <span className="font-medium group-hover:text-blue-600 transition-colors duration-200">
                      Personal Website
                    </span>
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {/* Tabs Navigation */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-lg mb-6 overflow-hidden">
              <div className="border-b border-gray-100">
                <div className="flex overflow-x-auto">
                  {['posts', 'activity', 'friends', 'photos'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-6 py-4 font-medium text-sm uppercase tracking-wider transition-all duration-300 whitespace-nowrap ${
                        activeTab === tab
                          ? 'text-indigo-600 border-b-2 border-indigo-500 bg-gradient-to-b from-indigo-50 to-transparent'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Recent Activity</h3>
                  <p className="text-gray-500">Stay updated with {user.full_name}'s latest posts and updates</p>
                </div>

                {/* --- Pass Props Correctly --- */}
                <UserPosts
                  userId={userId}
                  isCurrentUser={isCurrentUser}
                />
              </div>
            </div>

            {/* Recent Interactions (UI Only - Data may need backend support) */}
            {user.recent_interactions && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Interactions</h3>
                <div className="space-y-4">
                    {user.recent_interactions.map((interaction, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-50 transition-all duration-200 cursor-pointer"
                    >
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
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

      {/* Decorative Elements */}
      <div className="fixed bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white/50 to-transparent pointer-events-none"></div>
    </div>
  );
};

export default Profile;