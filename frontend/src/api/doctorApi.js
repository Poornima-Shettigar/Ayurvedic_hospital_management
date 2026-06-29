import axiosClient from "./axiosClient";

export const doctorApi = {
  getApproved: (departmentId) =>
    axiosClient
      .get("/doctors", { params: departmentId ? { departmentId } : {} })
      .then((r) => r.data),
  getById: (id) => axiosClient.get(`/doctors/${id}`).then((r) => r.data),
  getAvailableSlots: (id, date) =>
    axiosClient.get(`/doctors/${id}/slots`, { params: { date } }).then((r) => r.data),
  getMyProfile: () => axiosClient.get("/doctors/me/profile").then((r) => r.data),
  updateAvailability: (payload) =>
    axiosClient.put("/doctors/me/availability", payload).then((r) => r.data),
};
