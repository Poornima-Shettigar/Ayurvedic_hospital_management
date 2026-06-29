import axiosClient from "./axiosClient";

export const staffApi = {
  getAll: () => axiosClient.get("/admin/staff").then((r) => r.data),
  getById: (id) => axiosClient.get(`/admin/staff/${id}`).then((r) => r.data),
  create: (payload) => axiosClient.post("/admin/staff", payload).then((r) => r.data),
  update: (id, payload) => axiosClient.put(`/admin/staff/${id}`, payload).then((r) => r.data),
  remove: (id) => axiosClient.delete(`/admin/staff/${id}`).then((r) => r.data),
  getMyProfile: () => axiosClient.get("/staff/me").then((r) => r.data),
};
