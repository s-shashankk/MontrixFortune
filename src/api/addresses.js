import api from "./axios";

export const fetchAddresses = () => api.get("/api/address");
export const addAddress = (addressData) => api.post("/api/address", addressData);
