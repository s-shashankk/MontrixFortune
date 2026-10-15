import api from "./axios";

export const fetchHeroSlides = () => api.get("/api/hero-slides");

export const fetchAdminHeroSlides = () => api.get("/api/admin/hero-slides");

export const createHeroSlide = (payload) => api.post("/api/admin/hero-slides", payload);

export const updateHeroSlide = (id, payload) => api.put(`/api/admin/hero-slides/${id}`, payload);

export const deleteHeroSlide = (id) => api.delete(`/api/admin/hero-slides/${id}`);

export const reorderHeroSlides = (slideIds) => api.put("/api/admin/hero-slides/reorder", slideIds);
