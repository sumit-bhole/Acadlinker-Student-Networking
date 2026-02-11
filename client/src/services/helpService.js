import api from "../api/axios";

export const helpService = {
  // 1. Get the Help Feed (Rescue Radar)
  getFeed: async () => {
    const response = await api.get("/api/help/feed");
    return response.data;
  },

  // 2. Create a Request (With Image Support)
  createRequest: async (formData) => {
    const response = await api.post("/api/help/request", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // 3. Get Details of a Single Request
  getDetails: async (requestId) => {
    const response = await api.get(`/api/help/${requestId}`);
    return response.data;
  },

  // 4. Post a Solution
  postSolution: async (requestId, content, codeSnippet) => {
    const response = await api.post(`/api/help/${requestId}/solve`, {
      content,
      code_snippet: codeSnippet,
    });
    return response.data;
  },

  // 5. Accept a Solution
  acceptSolution: async (solutionId) => {
    const response = await api.post(`/api/help/solution/${solutionId}/accept`);
    return response.data;
  }
};