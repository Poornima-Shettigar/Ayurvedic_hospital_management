import axiosClient from "./axiosClient";

export const authApi = {
  loginUser: (payload) => axiosClient.post("/auth/login", payload).then((r) => r.data),
  registerPatient: (payload) => axiosClient.post("/auth/register/patient", payload).then((r) => r.data),
  registerDoctor: (payload) => axiosClient.post("/auth/register/doctor", payload).then((r) => r.data),
  getCurrentUser: () => axiosClient.get("/auth/me").then((r) => r.data),
};
