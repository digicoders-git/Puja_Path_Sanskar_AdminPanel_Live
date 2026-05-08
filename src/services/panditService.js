const BASE = import.meta.env.VITE_API_BASE_URL;

const headers = (token) => ({ Authorization: `Bearer ${token}` });

export const getEnums = () =>
  fetch(`${BASE}/api/pandits/enums`).then((r) => r.json());

export const getAllPandits = (token) =>
  fetch(`${BASE}/api/pandits`, { headers: headers(token) }).then((r) => r.json());

export const createPandit = (token, formData) =>
  fetch(`${BASE}/api/pandits`, { method: "POST", headers: headers(token), body: formData }).then((r) => r.json());

export const updatePandit = (token, id, formData) =>
  fetch(`${BASE}/api/pandits/${id}`, { method: "PUT", headers: headers(token), body: formData }).then((r) => r.json());

export const deletePandit = (token, id) =>
  fetch(`${BASE}/api/pandits/${id}`, { method: "DELETE", headers: headers(token) }).then((r) => r.json());

export const togglePandit = (token, id) =>
  fetch(`${BASE}/api/pandits/${id}/toggle`, { method: "PATCH", headers: headers(token) }).then((r) => r.json());
