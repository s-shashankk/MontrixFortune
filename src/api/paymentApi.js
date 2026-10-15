import api from "./axios";

export const createPaymentOrder = (paymentData) =>
  api.post("/api/payments/create-order", paymentData);
export const verifyPayment = (paymentData) =>
  api.post("/api/payments/verify", paymentData);
export const markPaymentFailed = (paymentData) =>
  api.post("/api/payments/fail", paymentData);
export const getAllPayments = () => api.get("/api/payments/admin/all");
export const getUserPayments = (userId) => api.get(`/api/payments/user/${userId}`);
