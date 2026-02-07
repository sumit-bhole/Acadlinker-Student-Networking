import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import Navbar from "./components/Navbar";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import AuthPage from "./pages/AuthPage";
import FriendsList from "./pages/FriendsList";
import Home from "./pages/Home";
import ChatApp from "./pages/chat";
import NotificationsPage from './pages/NotificationsPage';
import { Loader2 } from "lucide-react";
import SearchPage from "./pages/SearchPage"; // 1. Import the new SearchPage

const App = () => {
  const { isAuthenticated, loading, currentUser } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
        <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
        <p className="mt-4 text-gray-600">Checking authentication...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* 🔹 Default redirect to logged-in user's profile */}
        <Route
          path="/"
          element={isAuthenticated ? <Home /> : <Navigate to="/auth" />}
        />

        <Route path="/notifications" element={<NotificationsPage />} />
        

        {/* 🔹 User profile */}
        <Route
          path="/profile/:userId"
          element={isAuthenticated ? <Profile /> : <Navigate to="/auth" />}
        />

        {/* 🔹 Edit profile */}
        <Route
          path="/edit-profile"
          element={isAuthenticated ? <EditProfile /> : <Navigate to="/auth" />}
        />

        {/* 🔹 Auth page */}
        <Route
          path="/auth"
          element={!isAuthenticated ? <AuthPage /> : <Navigate to={`/profile/${currentUser?.id}`} />}
        />

        {/* 2. ADD THE NEW SEARCH ROUTE */}
        <Route
          path="/search"
          element={isAuthenticated ? <SearchPage /> : <Navigate to="/auth" />}
        />

        <Route path="/friends"
        element={isAuthenticated ? <FriendsList /> : <Navigate to="/auth" />} />

        <Route
          path="/chat"
          element={isAuthenticated ? <ChatApp /> : <Navigate to="/auth" />}
        />

        
      </Routes>

      

    </BrowserRouter>
  );
};

export default App;
