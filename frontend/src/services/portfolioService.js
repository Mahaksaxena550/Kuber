import api from "./api";

const portfolioService = {
  getHoldings: () => api.get("/portfolio/holdings/"),
  getSummary: () => api.get("/portfolio/summary/"),
  getHistory: () => api.get("/portfolio/history/"),
};

export default portfolioService;