const BASE = import.meta.env.VITE_API_BASE_URL;
const h = (token) => ({ Authorization: `Bearer ${token}` });

export const getProfile = (token) =>
  fetch(`${BASE}/api/admin/profile`, { headers: h(token) }).then((r) => r.json());

export const updateProfile = (token, formData) =>
  fetch(`${BASE}/api/admin/profile`, { method: "PUT", headers: h(token), body: formData }).then((r) => r.json());

export const changePassword = (token, body) =>
  fetch(`${BASE}/api/admin/change-password`, {
    method: "PUT",
    headers: { ...h(token), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then((r) => r.json());
