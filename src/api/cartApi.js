import api from "./axios";

export const getCart = () => api.get("/api/cart");
export const addToCart = (productId, quantity) =>
  api.post("/api/cart/add", { productId, quantity });
export const updateCartQuantity = (cartItemId, quantity) =>
  api.put(`/api/cart/update/${cartItemId}?quantity=${quantity}`);
export const removeFromCart = (cartItemId) => api.delete(`/api/cart/remove/${cartItemId}`);
export const clearCart = () => api.delete("/api/cart/clear");
