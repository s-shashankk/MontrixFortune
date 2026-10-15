import api from "./axios";

export const createOrder = (orderData) => api.post("/api/orders", orderData);
export const fetchOrderById = (id) => api.get(`/api/orders/${id}`);
export const fetchUserOrders = (page = 0, size = 12) =>
  api.get("/api/orders", { params: { page, size } });

const unwrapApiData = (response) => response?.data?.data || response?.data;

export const getAdminOrders = async (page = 0, size = 20) => {
  const response = await api.get("/api/admin/orders", { params: { page, size } });
  return unwrapApiData(response);
};

export const getAdminOrderDetails = async (orderId) => {
  const response = await api.get(`/api/admin/orders/${orderId}`);
  return unwrapApiData(response);
};

export const updateAdminOrderStatus = async (orderId, status) => {
  const response = await api.put(`/api/admin/orders/${orderId}`, null, { params: { status } });
  return unwrapApiData(response);
};

export const updateAdminOrderPaymentCollection = async (orderId, status) => {
  const response = await api.put(`/api/admin/orders/${orderId}/payment-collection`, null, {
    params: { status },
  });
  return unwrapApiData(response);
};
