import axiosClient from "./axiosClient";

export const adminApi = {
  getDashboard: () => axiosClient.get("/admin/dashboard").then((r) => r.data),
  getAllDoctors: () => axiosClient.get("/admin/doctors").then((r) => r.data),
  getPendingDoctors: () => axiosClient.get("/admin/doctors/pending").then((r) => r.data),
  approveDoctor: (id) => axiosClient.put(`/admin/doctors/${id}/approve`).then((r) => r.data),
  getAllPatients: () => axiosClient.get("/admin/patients").then((r) => r.data),
};
