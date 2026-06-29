import axiosClient from "./axiosClient";

export const billingApi = {
  getAll: () => axiosClient.get("/billing/invoices").then((r) => r.data),
  getMine: () => axiosClient.get("/billing/invoices/my").then((r) => r.data),
  getById: (id) => axiosClient.get(`/billing/invoices/${id}`).then((r) => r.data),
  create: (payload) => axiosClient.post("/billing/invoices", payload).then((r) => r.data),
  recordPayment: (id, payload) =>
    axiosClient.put(`/billing/invoices/${id}/payment`, payload).then((r) => r.data),
  cancel: (id) => axiosClient.put(`/billing/invoices/${id}/cancel`).then((r) => r.data),
};
