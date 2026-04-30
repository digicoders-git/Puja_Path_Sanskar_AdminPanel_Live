const BASE = import.meta.env.VITE_API_BASE_URL;
const h = (token) => ({ Authorization: `Bearer ${token}` });

export const getAllUsers = (token) =>
  fetch(`${BASE}/api/users/`, { headers: h(token) }).then((r) => r.json());

export const updateUser = (token, id, data) =>
  fetch(`${BASE}/api/users/${id}`, {
    method: "PUT",
    headers: { ...h(token), "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((r) => r.json());

export const deleteUser = (token, id) =>
  fetch(`${BASE}/api/users/${id}`, { method: "DELETE", headers: h(token) }).then((r) => r.json());

export const toggleUserStatus = (token, id) =>
  fetch(`${BASE}/api/users/${id}/toggle`, { method: "PATCH", headers: h(token) }).then((r) => r.json());
