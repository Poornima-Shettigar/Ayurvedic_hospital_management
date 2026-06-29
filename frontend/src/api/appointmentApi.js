import axiosClient from "./axiosClient";

export const appointmentApi = {
  book: (payload) => axiosClient.post("/appointments", payload).then((r) => r.data),
  getMine: (status) =>
    axiosClient.get("/appointments/my", { params: status ? { status } : {} }).then((r) => r.data),
  getForDoctor: (params = {}) =>
    axiosClient.get("/appointments/doctor", { params }).then((r) => r.data),
  getAll: (params = {}) => axiosClient.get("/appointments", { params }).then((r) => r.data),
  updateStatus: (id, payload) =>
    axiosClient.put(`/appointments/${id}/status`, payload).then((r) => r.data),
};
