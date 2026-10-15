import api from "./axios";

export const fetchCategories = () => api.get("/api/categories");
