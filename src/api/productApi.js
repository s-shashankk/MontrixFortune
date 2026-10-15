import api from "./axios";

export const fetchProducts = (page = 0, size = 30) =>
  api.get("/api/products", { params: { page, size } });

export const fetchProductById = (id) => api.get(`/api/products/${id}`);

export const fetchProductsByCategory = (category) =>
  api.get(`/api/products/category/${encodeURIComponent(category)}`);

export const searchProducts = (keyword) =>
  api.get("/api/products/search", { params: { keyword } });
