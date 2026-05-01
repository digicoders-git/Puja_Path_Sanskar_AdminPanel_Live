const BASE = import.meta.env.VITE_API_BASE_URL;
const h = (token) => ({ "Content-Type": "application/json", Authorization: `Bearer ${token}` });

export const getAllOffersAdmin = (token) =>
  fetch(`${BASE}/api/offers/admin/all`, { headers: h(token) }).then((r) => r.json());

export const createOffer = (token, data) =>
  fetch(`${BASE}/api/offers`, { method: "POST", headers: h(token), body: JSON.stringify(data) }).then((r) => r.json());

export const updateOffer = (token, id, data) =>
  fetch(`${BASE}/api/offers/${id}`, { method: "PATCH", headers: h(token), body: JSON.stringify(data) }).then((r) => r.json());

export const toggleOffer = (token, id) =>
  fetch(`${BASE}/api/offers/${id}/toggle`, { method: "PATCH", headers: h(token) }).then((r) => r.json());

export const deleteOffer = (token, id) =>
  fetch(`${BASE}/api/offers/${id}`, { method: "DELETE", headers: h(token) }).then((r) => r.json());
