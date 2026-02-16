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
import SearchPage from "./pages/SearchPage";
import HelpDetails from "./pages/HelpDetails";
import HelpFeedPage from "./pages/HelpFeedPage";
import { Loader2 } from "lucide-react";

// 🆕 TEAM PAGES IMPORTS
import TeamList from "./pages/Teams/TeamList";
import CreateTeam from "./pages/Teams/CreateTeam";
import MyTeams from "./pages/Teams/MyTeams";
import TeamDetails from "./pages/Teams/TeamDetails";

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
      {isAuthenticated && <Navbar />} {/* Optional: Hide Navbar if not logged in */}
      
      <Routes>
        {/* 🔹 Default redirect */}
        <Route
          path="/"
          element={isAuthenticated ? <Home /> : <Navigate to="/auth" />}
        />

        <Route 
          path="/notifications" 
          element={isAuthenticated ? <NotificationsPage /> : <Navigate to="/auth" />} 
        />

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
          element={!isAuthenticated ? <AuthPage /> : <Navigate to="/" />}
        />

        {/* 🔹 Search */}
        <Route
          path="/search"
          element={isAuthenticated ? <SearchPage /> : <Navigate to="/auth" />}
        />

        {/* 🔹 Friends */}
        <Route 
          path="/friends"
          element={isAuthenticated ? <FriendsList /> : <Navigate to="/auth" />} 
        />

        {/* 🔹 Chat */}
        <Route
          path="/chat"
          element={isAuthenticated ? <ChatApp /> : <Navigate to="/auth" />}
        />
        
        {/* 🔹 Chat (Specific User) */}
        <Route
          path="/chat/:userId"
          element={isAuthenticated ? <ChatApp /> : <Navigate to="/auth" />}
        />

        {/* 🔹 Help Feed & Details */}
        <Route 
          path="/help/feed" 
          element={isAuthenticated ? <HelpFeedPage /> : <Navigate to="/auth" />} 
        />
        <Route 
          path="/help/:requestId" 
          element={isAuthenticated ? <HelpDetails /> : <Navigate to="/auth" />} 
        />

        {/* 🆕 TEAMS ROUTES (Added Here) */}
        <Route 
          path="/teams" 
          element={isAuthenticated ? <TeamList /> : <Navigate to="/auth" />} 
        />
        <Route 
          path="/teams/create" 
          element={isAuthenticated ? <CreateTeam /> : <Navigate to="/auth" />} 
        />
        <Route 
          path="/teams/my" 
          element={isAuthenticated ? <MyTeams /> : <Navigate to="/auth" />} 
        />
        <Route 
          path="/teams/:teamId" 
          element={isAuthenticated ? <TeamDetails /> : <Navigate to="/auth" />} 
        />

      </Routes>
    </BrowserRouter>
  );
};

export default App;