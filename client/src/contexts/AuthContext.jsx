import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import AuthService from "../api/auth";
import api from "../api/axios"; 

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to merge Supabase Auth data with Backend Profile data
  const mergeUser = (sessionUser, backendProfile = {}) => {
    return {
      id: sessionUser.id,
      email: sessionUser.email,
      // Prefer backend data, fallback to Supabase metadata
      full_name: backendProfile.full_name || sessionUser.user_metadata?.full_name || "User",
      profile_pic: backendProfile.profile_pic || sessionUser.user_metadata?.avatar_url,
      ...backendProfile // Spread remaining backend fields (skills, etc.)
    };
  };

  const refreshUser = async () => {
    try {
      // 1. Check Supabase Session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        setIsAuthenticated(false);
        setCurrentUser(null);
        setLoading(false); // Stop loading immediately
        return;
      }

      // 2. Set Basic User (So the app loads INSTANTLY)
      const basicUser = mergeUser(session.user);
      setCurrentUser(basicUser);
      setIsAuthenticated(true);
      setLoading(false); // <--- UNBLOCK THE UI HERE

      // 3. Fetch Full Profile in Background
      console.log("🔄 Fetching full profile from backend...");
      try {
        const response = await api.get(`/api/profile/${session.user.id}`);
        console.log("✅ Backend profile loaded");
        // Update state with full details
        setCurrentUser(prev => mergeUser(session.user, response.data));
      } catch (backendErr) {
        console.error("⚠️ Backend fetch failed (using basic profile):", backendErr);
      }

    } catch (error) {
      console.error("Auth Check Error:", error);
      setIsAuthenticated(false);
      setCurrentUser(null);
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            // Re-run the fetch logic
            refreshUser();
        } else if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false);
          setCurrentUser(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (data) => await AuthService.login(data);
  const register = async (data) => await AuthService.register(data);
  const loginWithGoogle = async () => await AuthService.loginWithGoogle();
  const logout = async () => {
    await AuthService.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        currentUser,
        loading,
        refreshUser,
        login,
        register,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};