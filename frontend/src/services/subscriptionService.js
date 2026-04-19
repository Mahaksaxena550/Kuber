import api from "./api";

const subscriptionService = {
  getPlans: () => api.get("/subscriptions/plans/"),
  getMySubscription: () => api.get("/subscriptions/my-subscription/"),
  subscribe: (data) => api.post("/subscriptions/subscribe/", data),
  cancel: () => api.post("/subscriptions/cancel/"),
  getPayments: () => api.get("/subscriptions/payments/"),
};

export default subscriptionService;