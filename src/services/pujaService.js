const BASE = import.meta.env.VITE_API_BASE_URL;
const h = (token) => ({ Authorization: `Bearer ${token}` });

export const getEnums = () =>
  fetch(`${BASE}/api/pujas/enums`).then((r) => r.json());

export const getAllPujas = () =>
  fetch(`${BASE}/api/pujas`).then((r) => r.json());

export const createPuja = (token, formData) =>
  fetch(`${BASE}/api/pujas`, { method: "POST", headers: h(token), body: formData }).then((r) => r.json());

export const updatePuja = (token, id, formData) =>
  fetch(`${BASE}/api/pujas/${id}`, { method: "PUT", headers: h(token), body: formData }).then((r) => r.json());

export const deletePuja = (token, id) =>
  fetch(`${BASE}/api/pujas/${id}`, { method: "DELETE", headers: h(token) }).then((r) => r.json());

export const togglePuja = (token, id) =>
  fetch(`${BASE}/api/pujas/${id}/toggle`, { method: "PATCH", headers: h(token) }).then((r) => r.json());

export const getAllPujaTypes = () =>
  fetch(`${BASE}/api/puja-types`).then((r) => r.json());

export const createPujaType = (token, name) =>
  fetch(`${BASE}/api/puja-types`, {
    method: "POST",
    headers: { ...h(token), "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  }).then((r) => r.json());
