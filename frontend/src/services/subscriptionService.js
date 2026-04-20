import api from "./api";

const subscriptionService = {
  getPlans: () => api.get("/subscriptions/plans/"),
  getMySubscription: () => api.get("/subscriptions/my-subscription/"),
  createOrder: (planId) => api.post("/subscriptions/create-order/", { plan_id: planId }),
  verifyPayment: (data) => api.post("/subscriptions/verify-payment/", data),
  cancel: () => api.post("/subscriptions/cancel/"),
  getPayments: () => api.get("/subscriptions/payments/"),
};

export default subscriptionService;