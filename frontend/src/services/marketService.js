import api from "./api";

const marketService = {
  getInstruments: (params = {}) => api.get("/market/instruments/", { params }),
  getInstrument: (id) => api.get(`/market/instruments/${id}/`),
  searchInstruments: (query) => api.get("/market/instruments/", { params: { search: query } }),
  getTopGainers: () => api.get("/market/instruments/top_gainers/"),
  getTopLosers: () => api.get("/market/instruments/top_losers/"),
  getWatchlists: () => api.get("/market/watchlists/"),
  createWatchlist: (name) => api.post("/market/watchlists/", { name }),
  addToWatchlist: (watchlistId, instrumentId) =>
    api.post(`/market/watchlists/${watchlistId}/add_item/`, { instrument_id: instrumentId }),
};

export default marketService;