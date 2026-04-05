import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import AuthService from "../api/auth";
import api from "../api/axios"; 
import { useQueryClient } from "@tanstack/react-query"; // ✅ IMPORT ADDED

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const queryClient = useQueryClient(); // ✅ INITIATE QUERY CLIENT

  const mergeUser = (sessionUser, backendProfile = {}) => {
    return {
      id: sessionUser.id,
      email: sessionUser.email,
      full_name:
        backendProfile.full_name ||
        sessionUser.user_metadata?.full_name ||
        "User",
      profile_pic:
        backendProfile.profile_pic ||
        sessionUser.user_metadata?.avatar_url,
      ...backendProfile,
    };
  };

  const refreshUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        setIsAuthenticated(false);
        setCurrentUser(null);
        setLoading(false);
        return;
      }

      // ✅ instant UI load
      const basicUser = mergeUser(session.user);
      setCurrentUser(basicUser);
      setIsAuthenticated(true);
      setLoading(false);

      // 🚀 REACT QUERY INTEGRATION
      // React Query natively deduplicates identical simultaneous requests,
      // meaning you no longer need the hacky `hasFetched` useRef!
      console.log("🔄 Fetching full profile...");
      try {
        const backendUser = await queryClient.fetchQuery({
          queryKey: ['authStatus', session.user.id],
          queryFn: async () => {
            const response = await api.get("/api/auth/status");
            return response.data.user;
          },
          staleTime: Infinity, // ✅ CRITICAL FIX: Tell React Query this NEVER expires on its own
        });

        setCurrentUser(prev => mergeUser(session.user, backendUser));
      } catch (err) {
        console.warn("Backend profile failed:", err);
      }

    } catch (error) {
      console.error("Auth Error:", error);
      setIsAuthenticated(false);
      setCurrentUser(null);
      setLoading(false);
    }
  };

  useEffect(() => {
    // ✅ Triggers safely. React Query handles the deduplication if Strict Mode fires it twice.
    refreshUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event) => {
        console.log("🔁 Auth Event:", event);

        if (event === "SIGNED_IN") {
          refreshUser();
        }

        if (event === "SIGNED_OUT") {
          setIsAuthenticated(false);
          setCurrentUser(null);
          // ✅ Clear the React Query auth cache entirely when they log out
          queryClient.removeQueries({ queryKey: ['authStatus'] }); 
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []); // <-- Dependencies safely empty

  const login = async (data) => await AuthService.login(data);
  const register = async (data) => await AuthService.register(data);
  const loginWithGoogle = async () => await AuthService.loginWithGoogle();

  const logout = async () => {
    await AuthService.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    queryClient.removeQueries({ queryKey: ['authStatus'] }); // ✅ Clear cache on manual logout too
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