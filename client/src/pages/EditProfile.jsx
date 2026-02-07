// src/pages/EditProfile.jsx
import React, { useState } from 'react';
import api from '../api/axios'; 
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const EditProfile = () => {
  const { currentUser, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: currentUser?.full_name || '',
    email: currentUser?.email || '',
    mobile_no: currentUser?.mobile_no || '',
    location: currentUser?.location || '',
    description: currentUser?.description || '',
    skills: currentUser?.skills || '',
    education: currentUser?.education || '',
  });
  const [profilePic, setProfilePic] = useState(null);
  const [coverPhoto, setCoverPhoto] = useState(null);
  const [msg, setMsg] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(''); 

    const data = new FormData();
    
    // --- CORRECTED LOGIC ---
    Object.entries(form).forEach(([key, value]) => {
        // We append the value OR an empty string. 
        // This ensures the key is always sent, so the backend can update it.
        data.append(key, value || ""); 
    });
    
    if (profilePic) data.append('profile_pic', profilePic);
    if (coverPhoto) data.append('cover_photo', coverPhoto);

    try {
      // API call using interceptor
      await api.patch('/api/profile/edit', data);
      
      setMsg('✅ Profile updated successfully!');
      
      // Refresh context so the new data shows up instantly in the UI
      await refreshUser();
      
      // Navigate back to profile
      setTimeout(() => navigate(`/profile/${currentUser.id}`), 1200);
      
    } catch (err) {
      console.error("Profile update error:", err);
      setMsg('❌ Failed to update profile. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center py-10 px-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-2xl">
        <h2 className="text-3xl font-semibold text-center mb-6 text-indigo-700">Edit Your Profile</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="Enter your full name"
            />
          </div>

          {/* Email (Read Only recommended) */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              readOnly // Prevent editing email since it's the login ID
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-100 text-gray-500 cursor-not-allowed focus:outline-none"
            />
          </div>

          {/* Mobile */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">Mobile No.</label>
            <input
              type="text"
              name="mobile_no"
              value={form.mobile_no}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="Enter your mobile number"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="Enter your location"
            />
          </div>

          {/* Education */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">Education</label>
            <input
              type="text"
              name="education"
              value={form.education}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="Enter your education details"
            />
          </div>

          {/* Skills */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">Skills</label>
            <input
              type="text"
              name="skills"
              value={form.skills}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="e.g. Python, Flask, React"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 h-24 resize-none focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="Write a short bio about yourself"
            />
          </div>

          {/* Profile Picture */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">Profile Picture</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setProfilePic(e.target.files[0])}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>

          {/* Cover Photo */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">Cover Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setCoverPhoto(e.target.files[0])}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition duration-200"
          >
            Save Changes
          </button>

          {msg && (
            <p className={`text-center text-sm mt-2 ${msg.includes('✅') ? 'text-green-600' : 'text-red-500'}`}>
              {msg}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default EditProfile;