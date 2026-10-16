import api from "./axios";

export const fetchCategories = () => api.get("/api/categories");

export const fetchSubCategories = () => api.get("/api/categories/sub-categories");
