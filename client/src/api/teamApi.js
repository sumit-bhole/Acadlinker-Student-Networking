import api from "./axios";

// Team Endpoints
export const createTeam = (data) => api.post("/api/teams/create", data);
export const getPublicTeams = () => api.get("/api/teams/");
export const getMyTeams = () => api.get("/api/teams/my");
export const getTeamDetails = (id) => api.get(`/api/teams/${id}`);
export const joinRequest = (data) => api.post("/api/teams/join-request", data);
export const inviteFriend = (data) => api.post("/api/teams/invite", data);
export const respondToRequest = (data) => api.post("/api/teams/respond-request", data);

// Task Endpoints
export const getTeamTasks = (teamId) => api.get(`/api/tasks/team/${teamId}`);
export const createTask = (data) => api.post("/api/tasks/create", data);
export const updateTaskStatus = (taskId, status) => api.patch(`/api/tasks/${taskId}/status`, { status });
export const deleteTask = (taskId) => api.delete(`/api/tasks/${taskId}`);

// ... existing exports
export const getTeamChat = (teamId) => api.get(`/api/teams/${teamId}/chat`);
export const sendTeamMessage = (teamId, content) => api.post(`/api/teams/${teamId}/chat`, { content });