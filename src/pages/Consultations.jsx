import { useState, useEffect } from "react";
import { toast } from "sonner";
import { FaUser, FaPhoneAlt, FaCalendarAlt, FaStar, FaInbox, FaSearch, FaTimes, FaChevronLeft, FaChevronRight, FaTimesCircle, FaCheckCircle } from "react-icons/fa";
import { FiEye } from "react-icons/fi";

const THEME = "#E8621A";
const THEME_LIGHT = "#fff4ee";
const THEME_DARK = "#c9541a";
const PAGE_OPTIONS = [10, 20, 30, 40, 50];

const BASE = import.meta.env.VITE_API_BASE_URL;
const h = () => {
  const token = localStorage.getItem("admin-token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export default function Consultations() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/consultations/admin/all`, { headers: h() });
      const data = await res.json();
      setBookings(data.bookings || []);
    } catch (error) {
      toast.error("Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);
  useEffect(() => { setCurrentPage(1); }, [search, perPage]);

  const handleStatusChange = async (id, status) => {
    try {
      await fetch(`${BASE}/api/consultations/${id}`, {
        method: "PUT",
        headers: { ...h(), "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      toast.success("Status updated");
      fetchBookings();
    } catch (error) {
      toast.error("Error updating status");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending": return "bg-yellow-100 text-yellow-700";
      case "Confirmed": return "bg-blue-100 text-blue-700";
      case "Completed": return "bg-green-100 text-green-700";
      case "Cancelled": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  // Filter
  const filtered = bookings.filter((b) => {
    const q = search.toLowerCase();
    return (
      b.user?.name?.toLowerCase().includes(q) ||
      b.astrologer?.name?.toLowerCase().includes(q) ||
      b.user?.mobile?.includes(q)
    );
  });

  // Pagination
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  return (
    <div className="min-h-screen p-3 pt-8 sm:p-4 sm:pt-4">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
        <div className="pl-1">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-800">Consultation Bookings</h2>
            <span className="sm:hidden px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: THEME_LIGHT, color: THEME }}>
              {filtered.length} / {bookings.length} Total
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">Manage user requests for astrologers</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline px-4 py-1.5 rounded-full text-xs font-bold" style={{ backgroundColor: THEME_LIGHT, color: THEME }}>
            {filtered.length} / {bookings.length} Total
          </span>
        </div>
      </div>

      {/* Search + Per Page */}
      <div className="flex gap-2 mb-5">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-sm" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by user, mobile, astrologer..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none bg-white text-gray-700 transition-all"
            onFocus={(e) => e.target.style.borderColor = THEME}
            onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
              <FaTimes className="text-xs" />
            </button>
          )}
        </div>
        <select
          value={perPage}
          onChange={(e) => setPerPage(Number(e.target.value))}
          className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none bg-white text-gray-700 cursor-pointer"
          style={{ minWidth: 110 }}
        >
          {PAGE_OPTIONS.map((n) => <option key={n} value={n}>Show {n}</option>)}
        </select>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 mx-auto mb-3" style={{ borderColor: THEME }} />
            <p className="text-sm text-gray-400">Loading bookings...</p>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-gray-300">
          <FaInbox className="text-6xl mb-4" />
          <p className="text-base font-medium text-gray-400">{search ? "No results found" : "No bookings found"}</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead>
                <tr style={{ background: `linear-gradient(135deg, ${THEME}, ${THEME_DARK})` }}>
                  {["#", "Date", "Astrologer", "User", "Amount", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-6 py-4 text-left text-xs font-bold text-white whitespace-nowrap tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((b, i) => (
                  <tr key={b._id} className="border-t border-gray-50 transition-colors hover:bg-orange-50">
                    <td className="px-6 py-4 text-gray-400 font-medium">{(currentPage - 1) * perPage + i + 1}</td>
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <FaCalendarAlt className="text-gray-300" />
                        {new Date(b.createdAt).toLocaleString("en-IN", {
                          day: "2-digit", month: "short", year: "numeric",
                          hour: "2-digit", minute: "2-digit"
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-700 whitespace-nowrap flex items-center gap-2">
                      <FaStar className="text-yellow-500" /> {b.astrologer?.name || "Unknown"}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-700 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="flex items-center gap-2"><FaUser className="text-gray-300 text-xs" /> {b.user?.name || "Unknown"}</span>
                        <span className="text-[11px] text-gray-400 flex items-center gap-2 mt-0.5"><FaPhoneAlt className="text-gray-300 text-[9px]" /> {b.user?.mobile || "N/A"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-800">₹{b.amount || '—'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select 
                        value={b.status} 
                        onChange={(e) => handleStatusChange(b._id, e.target.value)}
                        className={`px-3 py-1.5 rounded-full text-[11px] font-bold border-0 focus:ring-2 focus:ring-orange-200 cursor-pointer appearance-none ${getStatusColor(b.status)}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => setSelectedBooking(b)} title="View Details" className="px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1.5 shadow-sm hover:shadow-md" style={{ backgroundColor: THEME_LIGHT, color: THEME }}>
                        <FiEye /> View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-5 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <span className="text-sm text-gray-500">
                Showing <span className="font-bold text-gray-800">{(currentPage - 1) * perPage + 1}</span> to <span className="font-bold text-gray-800">{Math.min(currentPage * perPage, filtered.length)}</span> of <span className="font-bold text-gray-800">{filtered.length}</span> entries
              </span>
              <div className="flex gap-2">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 disabled:opacity-30 hover:bg-gray-50 transition-all">
                  <FaChevronLeft className="text-xs" />
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => setCurrentPage(p)} className="w-9 h-9 flex items-center justify-center rounded-lg border text-sm font-medium transition-all" style={currentPage === p ? { backgroundColor: THEME, borderColor: THEME, color: "white" } : { borderColor: "#e5e7eb", color: "#6b7280" }}>
                      {p}
                    </button>
                  ))}
                </div>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 disabled:opacity-30 hover:bg-gray-50 transition-all">
                  <FaChevronRight className="text-xs" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedBooking(null)}>
          <div
            className="bg-white rounded-2xl w-full max-w-xl shadow-2xl flex flex-col max-h-[90vh]"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 rounded-t-2xl" style={{ background: `linear-gradient(135deg, ${THEME}, ${THEME_DARK})` }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <FiEye className="text-white text-lg" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Booking Details</h3>
                  <p className="text-xs text-white/70">#{selectedBooking._id?.slice(-8).toUpperCase()}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-all"
              >
                <FaTimes className="text-sm" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto flex-1 p-6 space-y-4">

              {/* Amount Badge */}
              <div className="flex items-center justify-between p-4 rounded-2xl border-2" style={{ borderColor: THEME, backgroundColor: THEME_LIGHT }}>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Amount Paid</p>
                  <p className="text-3xl font-black" style={{ color: THEME }}>₹{selectedBooking.amount || 0}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 mb-1">Payment Status</p>
                  <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${selectedBooking.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {selectedBooking.paymentStatus === 'Paid' ? '✓ Paid' : selectedBooking.paymentStatus || 'Pending'}
                  </span>
                </div>
              </div>

              {/* User + Astrologer Row */}
              <div className="grid grid-cols-2 gap-3">
                {/* User Info */}
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: THEME }}>
                      <FaUser className="text-white text-xs" />
                    </div>
                    <span className="font-bold text-orange-900 text-sm">User</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide">Name</p>
                      <p className="font-semibold text-gray-800 text-sm">{selectedBooking.user?.name || '—'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide">Mobile</p>
                      <p className="font-semibold text-gray-800">{selectedBooking.user?.mobile || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide">Email</p>
                      <p className="font-medium text-gray-700 text-xs break-all">{selectedBooking.user?.email || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Astrologer Info */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
                      <FaStar className="text-white text-xs" />
                    </div>
                    <span className="font-bold text-blue-900 text-sm">Astrologer</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide">Name</p>
                      <p className="font-semibold text-gray-800 text-sm">{selectedBooking.astrologer?.name || '—'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide">Specialty</p>
                      <p className="font-medium text-gray-700 text-xs">{selectedBooking.astrologer?.specialty || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide">Booking Date</p>
                      <p className="font-medium text-gray-700 text-xs">
                        {selectedBooking.bookingDate
                          ? new Date(selectedBooking.bookingDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                          : new Date(selectedBooking.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Plan / Service Details */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <FaCalendarAlt className="text-gray-400" /> Consultation Plan
                </p>
                <p className="text-sm font-semibold text-gray-800">{selectedBooking.problemDescription || '—'}</p>
              </div>

              {/* Status + Time */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-2">Booking Status</p>
                  <select
                    value={selectedBooking.status}
                    onChange={(e) => {
                      handleStatusChange(selectedBooking._id, e.target.value);
                      setSelectedBooking({ ...selectedBooking, status: e.target.value });
                    }}
                    className={`w-full px-3 py-1.5 rounded-lg text-xs font-bold border focus:outline-none cursor-pointer ${getStatusColor(selectedBooking.status)}`}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-2">Booked At</p>
                  <p className="text-xs font-semibold text-gray-800">
                    {new Date(selectedBooking.createdAt).toLocaleString('en-IN', {
                      day: '2-digit', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-md hover:shadow-lg hover:opacity-90"
                style={{ background: `linear-gradient(135deg, ${THEME}, ${THEME_DARK})` }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

