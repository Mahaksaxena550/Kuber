import api from "./api";

const cryptoService = {
  getPairs: () => api.get("/crypto/pairs/"),
  getPair: (uuid) => api.get(`/crypto/pairs/${uuid}/`),
  swap: (data) => api.post("/crypto/swap/", data),
  getSwapHistory: () => api.get("/crypto/swap/history/"),
  getOrderBook: (pairUuid) => api.get(`/crypto/orderbook/${pairUuid}/`),
};

export default cryptoService;