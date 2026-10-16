import api from "./axios";

// Public
export const fetchProjects = () => api.get("/api/projects");
export const fetchProject = (id) => api.get(`/api/projects/${id}`);

// Admin
export const fetchAdminProjects = () => api.get("/api/admin/projects");
export const fetchAdminProject = (id) => api.get(`/api/admin/projects/${id}`);
export const createProject = (payload) => api.post("/api/admin/projects", payload);
export const updateProject = (id, payload) => api.put(`/api/admin/projects/${id}`, payload);
export const deleteProject = (id) => api.delete(`/api/admin/projects/${id}`);
export const reorderProjects = (projectIds) => api.put("/api/admin/projects/reorder", projectIds);
