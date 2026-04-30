const BASE = import.meta.env.VITE_API_BASE_URL;
const h = (token) => ({ Authorization: `Bearer ${token}` });

export const submitContact = (body) =>
  fetch(`${BASE}/api/contacts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then((r) => r.json());

export const getAllContacts = (token) =>
  fetch(`${BASE}/api/contacts`, { headers: h(token) }).then((r) => r.json());

export const getContactById = (token, id) =>
  fetch(`${BASE}/api/contacts/${id}`, { headers: h(token) }).then((r) => r.json());

export const deleteContact = (token, id) =>
  fetch(`${BASE}/api/contacts/${id}`, { method: "DELETE", headers: h(token) }).then((r) => r.json());
