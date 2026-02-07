import axios from "axios";
import { supabase } from "../supabaseClient"; 

// 1. Define Base URL
const baseURL = import.meta.env.DEV ? "" : import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: baseURL,
  // --- DELETE THIS BLOCK ---
  // headers: {
  //   "Content-Type": "application/json", 
  // },
  // -------------------------
});

// 2. Debugging Interceptor
api.interceptors.request.use(async (config) => {
  console.log(`🚀 API Request: ${config.url}`); 

  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;

  if (token) {
    // console.log("✅ Token FOUND. Attaching to header...");
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.warn("⚠️ Token MISSING. Request sent without Auth header.");
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;