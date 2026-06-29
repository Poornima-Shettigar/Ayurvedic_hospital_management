import axiosClient from "./axiosClient";

export const patientApi = {
  getMyProfile: () => axiosClient.get("/patients/me").then((r) => r.data),
  updateMyProfile: (payload) => axiosClient.put("/patients/me", payload).then((r) => r.data),
};
