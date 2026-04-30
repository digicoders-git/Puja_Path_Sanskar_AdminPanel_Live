const BASE = import.meta.env.VITE_API_BASE_URL;
const h = (token) => ({ Authorization: `Bearer ${token}` });

export const getAllInterests = (token) =>
  fetch(`${BASE}/api/interests/admin/all`, { headers: h(token) }).then((r) => r.json());

export const updateInterestStatus = (token, id, data) =>
  fetch(`${BASE}/api/interests/admin/${id}`, {
    method: "PATCH",
    headers: { ...h(token), "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((r) => r.json());
