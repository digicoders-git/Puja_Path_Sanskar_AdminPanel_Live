const BASE = import.meta.env.VITE_API_BASE_URL;
const h = (token) => ({ Authorization: `Bearer ${token}` });

export const getAllBookings = (token) =>
  fetch(`${BASE}/api/bookings/admin/all`, { headers: h(token) }).then((r) => r.json());

export const updateBookingStatus = (token, id, data) =>
  fetch(`${BASE}/api/bookings/admin/${id}/status`, {
    method: "PATCH",
    headers: { ...h(token), "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((r) => r.json());
