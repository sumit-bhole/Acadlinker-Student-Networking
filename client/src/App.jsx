import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom"; // 👈 Added useParams
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

// 🆕 TEAM LAYOUT & PAGES IMPORTS
import TeamLayout from "./layouts/TeamLayout";
import TeamList from "./pages/Teams/TeamList";
import CreateTeam from "./pages/Teams/CreateTeam";
import MyTeams from "./pages/Teams/MyTeams";
import TeamDashboard from "./pages/Teams/TeamDashboard";
import TeamMembers from "./pages/Teams/TeamMembers";

// 🆕 COMPONENT WRAPPERS
// These wrap the components to pass the ID from the URL automatically
import TeamChat from "./components/Teams/TeamChat";
import TaskBoard from "./components/Teams/TaskBoard";

const TeamChatWrapper = () => { 
  const { teamId } = useParams(); 
  return <TeamChat teamId={teamId} />; 
};

const TaskBoardWrapper = () => { 
  const { teamId } = useParams(); 
  return <TaskBoard teamId={teamId} isMember={true} />; 
};

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
      {isAuthenticated && <Navbar />} 
      
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

        {/* 🚀 TEAMS GLOBAL ROUTES */}
        {/* These pages show the Navbar and look like standard pages */}
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

        {/* 🚀 TEAM WORKSPACE (NESTED ROUTES) */}
        {/* This replaces the old /teams/:teamId route. It loads the Sidebar Layout. */}
        <Route path="/teams/:teamId" element={isAuthenticated ? <TeamLayout /> : <Navigate to="/auth" />}>
          <Route index element={<TeamDashboard />} />         {/* Default view: Dashboard */}
          <Route path="chat" element={<TeamChatWrapper />} /> {/* /teams/:id/chat */}
          <Route path="tasks" element={<TaskBoardWrapper />} /> {/* /teams/:id/tasks */}
          <Route path="members" element={<TeamMembers />} />  {/* /teams/:id/members */}
        </Route>

      </Routes>
    </BrowserRouter>
  );
};

export default App;