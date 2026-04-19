import api from "./api";

const orderService = {
  placeOrder: (data) => api.post("/orders/", data),
  getOrders: (params = {}) => api.get("/orders/", { params }),
  getOrder: (id) => api.get(`/orders/${id}/`),
  cancelOrder: (id) => api.post(`/orders/${id}/cancel/`),
  getOpenOrders: () => api.get("/orders/open_orders/"),
  getOrderHistory: (page = 1) => api.get(`/orders/order_history/?page=${page}`),
};

export default orderService;