import axiosClient from "./axiosClient";

export const pharmacyApi = {
  getAll: () => axiosClient.get("/pharmacy/medicines").then((r) => r.data),
  create: (payload) => axiosClient.post("/pharmacy/medicines", payload).then((r) => r.data),
  update: (id, payload) => axiosClient.put(`/pharmacy/medicines/${id}`, payload).then((r) => r.data),
  remove: (id) => axiosClient.delete(`/pharmacy/medicines/${id}`).then((r) => r.data),
  restock: (id, quantity) =>
    axiosClient.put(`/pharmacy/medicines/${id}/restock`, { quantity }).then((r) => r.data),
  dispense: (payload) => axiosClient.post("/pharmacy/dispense", payload).then((r) => r.data),
  getDispenseHistory: () => axiosClient.get("/pharmacy/dispense-history").then((r) => r.data),
};
