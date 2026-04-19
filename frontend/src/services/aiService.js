import api from "./api";

const aiService = {
  getSuggestions: (params = {}) => api.get("/ai/suggestions/", { params }),
  getSuggestion: (uuid) => api.get(`/ai/suggestions/${uuid}/`),
  submitFeedback: (data) => api.post("/ai/feedback/", data),
};

export default aiService;