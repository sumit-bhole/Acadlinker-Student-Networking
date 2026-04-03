import axios from "axios";
import { supabase } from "../supabaseClient";

// 1. Base URL
const baseURL = import.meta.env.DEV ? "" : import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: baseURL,
});

// 2. REQUEST INTERCEPTOR (FIXED)
api.interceptors.request.use(
  async (config) => {
    console.log(`🚀 API Request: ${config.url}`);

    try {
      const { data } = await supabase.auth.getSession();
      const session = data?.session;

      // 🔴 If no session → block request
      if (!session) {
        console.warn("⛔ No session found. Blocking request:", config.url);
        return Promise.reject("No active session");
      }

      // ✅ Attach token
      config.headers.Authorization = `Bearer ${session.access_token}`;
      return config;

    } catch (err) {
      console.error("❌ Error fetching session:", err);
      return Promise.reject(err);
    }
  },
  (error) => Promise.reject(error)
);


// 3. RESPONSE INTERCEPTOR (FIXED)
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const status = error.response?.status;

    // 🔴 Handle 401 (Unauthorized)
    if (status === 401) {
      console.warn("🔒 Unauthorized - logging out...");

      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.error("Error during logout:", e);
      }

      // 🛑 Prevent infinite redirect loop
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;