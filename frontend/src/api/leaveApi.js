import axiosClient from "./axiosClient";

export const leaveApi = {
  create: (payload) => axiosClient.post("/leave", payload).then((r) => r.data),
  getMine: () => axiosClient.get("/leave/my").then((r) => r.data),
  getAll: () => axiosClient.get("/leave").then((r) => r.data),
  updateStatus: (id, payload) => axiosClient.put(`/leave/${id}/status`, payload).then((r) => r.data),
  cancel: (id) => axiosClient.put(`/leave/${id}/cancel`).then((r) => r.data),
};
