// src/api/auth.js
import { supabase } from "../supabaseClient";

class AuthServiceClass {
  
  // 1. Login with Email/Password
  async login({ email, password }) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return {
        success: true,
        user: data.user,
        session: data.session,
        message: "Login successful",
      };
    } catch (err) {
      console.error("❌ LOGIN FAILED:", err.message);
      return {
        success: false,
        message: err.message || "Login failed",
        user: null,
      };
    }
  }

  // 2. Register (Pass full_name so the DB trigger can use it)
  async register({ email, password, full_name, mobile_no }) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: full_name,
            mobile_no: mobile_no, // Stored in metadata
          },
        },
      });

      if (error) throw error;

      return {
        success: true,
        user: data.user,
        message: "Registration successful! Please check your email.",
      };
    } catch (err) {
      console.error("❌ REGISTER FAILED:", err.message);
      return {
        success: false,
        message: err.message || "Registration failed",
      };
    }
  }

  // 3. Login with Google (New!)
  async loginWithGoogle() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
      });
      if (error) throw error;
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  }

  // 4. Logout
  async logout() {
    const { error } = await supabase.auth.signOut();
    return !error;
  }

  // 5. Get Current User (No server call needed)
  async getCurrentUser() {
    const { data } = await supabase.auth.getSession();
    return data.session?.user || null;
  }
}

const AuthService = new AuthServiceClass();
export default AuthService;