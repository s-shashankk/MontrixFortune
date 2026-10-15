import api from "./axios";

export const loginUser = (data) => api.post("/api/auth/login", data);
export const registerUser = (data) => api.post("/api/auth/register", data);
export const getProfile = () => api.get("/api/auth/profile");
