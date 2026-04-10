import api from "./axios";

// ==========================================
// Team Endpoints
// ==========================================
export const createTeam = (data) => api.post("/api/teams/create", data);

// 🟢 FIX: Removed '/edit' to match our clean backend REST route
export const updateTeam = (teamId, data) => api.put(`/api/teams/${teamId}`, data); 

export const getPublicTeams = () => api.get("/api/teams/");
export const getMyTeams = () => api.get("/api/teams/my");
export const getTeamDetails = (id) => api.get(`/api/teams/${id}`);
export const joinRequest = (data) => api.post("/api/teams/join-request", data);
export const inviteFriend = (data) => api.post("/api/teams/invite", data);
export const respondToRequest = (data) => api.post("/api/teams/respond-request", data);

// Fetch User's Personal Invites & Sent Requests
export const getMyInvites = () => api.get("/api/teams/my-invites"); 
export const respondToInvite = (data) => api.post("/api/teams/respond-invite", data); // Accept/Reject invite
export const removeMember = (teamId, userId) => api.delete(`/api/teams/${teamId}/members/${userId}`);

// ==========================================
// Task Endpoints
// ==========================================
export const getTeamTasks = (teamId) => api.get(`/api/tasks/team/${teamId}`);
export const createTask = (data) => api.post("/api/tasks/create", data);

// Update task (handles status, text edits, proof of work)
export const updateTaskStatus = (taskId, data) => {
    return api.patch(`/api/tasks/${taskId}`, data);
};

export const deleteTask = (taskId) => api.delete(`/api/tasks/${taskId}`);

// ==========================================
// Chat Endpoints
// ==========================================
export const getTeamChat = (teamId) => api.get(`/api/teams/${teamId}/chat`);
export const sendTeamMessage = (teamId, content) => api.post(`/api/teams/${teamId}/chat`, { content });