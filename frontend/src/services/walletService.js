import api from "./api";

const walletService = {
  getBalance: () => api.get("/wallet/balance/"),
  addFunds: (data) => api.post("/wallet/add-funds/", data),
  withdraw: (data) => api.post("/wallet/withdraw/", data),
  getTransactions: (params = {}) => api.get("/wallet/transactions/", { params }),
};

export default walletService;