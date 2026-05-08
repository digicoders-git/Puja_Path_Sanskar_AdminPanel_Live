import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { getAllBookings, updateBookingStatus } from "../services/bookingService";
import { getAllPandits } from "../services/panditService";
import { FaCalendarAlt, FaUser, FaBook, FaMoneyBillWave, FaSearch, FaTimes, FaChevronLeft, FaChevronRight, FaEdit, FaEye, FaMapMarkerAlt, FaClock, FaWhatsapp } from "react-icons/fa";

const THEME = "#E8621A";
const THEME_LIGHT = "#fff4ee";
const THEME_DARK = "#c9541a";
const PAGE_OPTIONS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

export default function Bookings() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [pandits, setPandits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewData, setViewData] = useState(null);
  const [editData, setEditData] = useState(null);

  const fetchAll = async (hideLoading = false) => {
    if (!hideLoading) setLoading(true);
    const [bookingData, panditData] = await Promise.all([
      getAllBookings(token),
      getAllPandits(token),
    ]);
    if (bookingData.success) {
      setBookings(bookingData.bookings || []);
    }
    if (Array.isArray(panditData)) {
      // Only show active pandits for assignment
      setPandits(panditData.filter(p => p.isActive));
    }
    if (!hideLoading) setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);
  useEffect(() => { setCurrentPage(1); }, [search, perPage]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    const res = await updateBookingStatus(token, editData._id, {
      status: editData.status,
      paymentStatus: editData.paymentStatus,
      panditId: editData.panditId || undefined
    });
    if (res.success) {
      toast.success("Booking updated!");
      // Update local state without fetching all
      setBookings(bookings.map(b => b._id === editData._id ? { ...b, ...res.booking } : b));
      setEditData(null);
      fetchAll(true); // silent refetch to get populated fields correctly
    } else {
      toast.error(res.message || "Update failed");
    }
  };

  // Filter
  const filtered = bookings.filter((b) => {
    const q = search.toLowerCase();
    return (
      b.user?.name?.toLowerCase().includes(q) ||
      b.user?.mobile?.toLowerCase().includes(q) ||
      b.puja?.pujaType?.toLowerCase().includes(q) ||
      b.status?.toLowerCase().includes(q) ||
      b._id.toLowerCase().includes(q)
    );
  });

  // Pagination
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending": return "bg-orange-100 text-orange-600";
      case "Confirmed": return "bg-blue-100 text-blue-600";
      case "Completed": return "bg-green-100 text-green-600";
      case "Cancelled": return "bg-red-100 text-red-600";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const getPaymentColor = (status) => {
    switch (status) {
      case "Pending": return "bg-orange-100 text-orange-600";
      case "Paid": return "bg-green-100 text-green-600";
      case "AdvancePaid": return "bg-blue-100 text-blue-600";
      case "FullyPaid": return "bg-green-100 text-green-700";
      case "Failed": return "bg-red-100 text-red-600";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="min-h-screen p-3 pt-8 sm:p-4 sm:pt-4">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
        <div className="pl-1">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-800">Booking Management</h2>
            <span className="sm:hidden px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: THEME_LIGHT, color: THEME }}>
              {filtered.length} / {bookings.length} Total
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">Manage all user bookings and assign pandits</p>
        </div>
        <span className="hidden sm:inline self-start sm:self-auto px-4 py-1.5 rounded-full text-xs font-bold" style={{ backgroundColor: THEME_LIGHT, color: THEME }}>
          {filtered.length} / {bookings.length} Total
        </span>
      </div>

      {/* Search + Per Page */}
      <div className="flex gap-2 mb-5">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-sm" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by User, Puja, ID or Status..."
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
          {PAGE_OPTIONS.map((n) => (
            <option key={n} value={n}>Show {n}</option>
          ))}
        </select>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-32">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 mx-auto mb-3" style={{ borderColor: THEME }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-gray-300">
          <FaCalendarAlt className="text-6xl mb-4" />
          <p className="text-base font-medium text-gray-400">{search ? "No results found" : "No bookings found"}</p>
        </div>
      ) : (
        <>
          {/* Scrollable Table */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
            <table className="w-full text-sm min-w-[1000px]">
              <thead>
                <tr style={{ background: `linear-gradient(135deg, ${THEME}, ${THEME_DARK})` }}>
                  {["Booking ID", "User Name", "Mobile", "Puja", "Date", "Time Slot", "Original", "Offer", "Discount", "Total", "Advance", "Remaining", "Booking Status", "Payment Status", "Pandit", "Actions"].map((h) => (
                    <th key={h} className="px-8 py-4 text-left text-xs font-bold text-white whitespace-nowrap tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((b) => (
                  <tr key={b._id} className="border-t border-gray-50 transition-colors hover:bg-orange-50">
                    <td className="px-8 py-4 text-gray-500 font-mono text-xs whitespace-nowrap">{b._id}</td>
                    <td className="px-8 py-4 font-semibold text-gray-800 whitespace-nowrap">{b.user?.name || "Unknown"}</td>
                    <td className="px-8 py-4 text-xs text-gray-500 whitespace-nowrap">{b.user?.mobile || "-"}</td>
                    <td className="px-8 py-4 font-bold whitespace-nowrap" style={{ color: THEME }}>{b.puja?.pujaType?.trim() || "No Puja"}</td>
                    <td className="px-8 py-4 font-semibold text-gray-700 text-sm whitespace-nowrap">
                      {new Date(b.bookingDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-8 py-4 text-xs font-medium text-gray-500 whitespace-nowrap">{b.timeSlot}</td>
                    <td className="px-8 py-4 font-semibold text-gray-500 whitespace-nowrap line-through">₹{b.originalAmount ?? b.amount}</td>
                    <td className="px-8 py-4 whitespace-nowrap">
                      {b.offer ? (
                        <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
                          {b.offer.title} ({b.offer.discountValue}{b.offer.discountType === "percentage" ? "%" : "₹"} off)
                        </span>
                      ) : <span className="text-xs text-gray-300">—</span>}
                    </td>
                    <td className="px-8 py-4 font-semibold text-red-500 whitespace-nowrap">-₹{b.discountAmount ?? 0}</td>
                    <td className="px-8 py-4 font-semibold text-gray-700 whitespace-nowrap">₹{b.amount}</td>
                    <td className="px-8 py-4 font-semibold text-blue-600 whitespace-nowrap">₹{b.advanceAmount}</td>
                    <td className="px-8 py-4 font-semibold text-orange-500 whitespace-nowrap">₹{b.remainingAmount}</td>
                    <td className="px-8 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1.5 inline-block rounded-full text-[11px] font-bold text-center ${getStatusColor(b.status)}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-8 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1.5 inline-block rounded-full text-[11px] font-bold text-center border border-gray-100 ${getPaymentColor(b.paymentStatus)}`}>
                        {b.paymentStatus}
                      </span>
                    </td>
                    <td className="px-8 py-4 whitespace-nowrap">
                      {b.pandit ? (
                        <div>
                          <p className="font-semibold text-green-600 text-xs">✓ {b.pandit.fullName}</p>
                          <p className="text-[11px] text-gray-400 mt-0.5">{b.pandit.mobileNumber}</p>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 font-semibold italic">Not Assigned</p>
                      )}
                    </td>
                    <td className="px-8 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => setViewData(b)}
                          title="View Details"
                          className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:shadow-md hover:scale-110"
                          style={{ backgroundColor: THEME_LIGHT, color: THEME }}>
                          <FaEye className="text-sm" />
                        </button>
                        <button onClick={() => setEditData({
                            _id: b._id,
                            status: b.status,
                            paymentStatus: b.paymentStatus,
                            panditId: b.pandit?._id || ""
                          })}
                          title="Edit Booking"
                          className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:shadow-md hover:scale-110 bg-orange-50 text-orange-600">
                          <FaEdit className="text-sm" />
                        </button>
                        {b.pandit?.mobileNumber && (
                          <button
                            title="Send WhatsApp to Pandit"
                            onClick={() => {
                              const msg = `🙏 *PoojaPath - Nayi Booking Aayi Hai!*\n\n*Pandit Ji:* ${b.pandit?.fullName || "-"}\n*Puja:* ${b.puja?.pujaType || "-"}\n*Date:* ${new Date(b.bookingDate).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}\n*Time:* ${b.timeSlot}\n*Address:* ${b.address}\n*Booking ID:* #${b._id}\n\nKripya samay par pahuchen. Dhanyawad! 🙏`;
                              window.open(`https://wa.me/91${b.pandit.mobileNumber}?text=${encodeURIComponent(msg)}`, "_blank");
                            }}
                            className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:shadow-md hover:scale-110 bg-green-50 text-green-600">
                            <FaWhatsapp className="text-sm" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-5">
              <p className="text-xs text-gray-400">
                Showing {(currentPage - 1) * perPage + 1}–{Math.min(currentPage * perPage, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold border border-gray-200 text-gray-500 disabled:opacity-40 transition-all"
                >
                  <FaChevronLeft className="text-xs" /> Previous
                </button>
                <span className="text-xs text-gray-400 px-2">{currentPage} / {totalPages}</span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold border border-gray-200 text-gray-500 disabled:opacity-40 transition-all"
                >
                  Next <FaChevronRight className="text-xs" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Edit Modal */}
      {editData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between" style={{ background: `linear-gradient(135deg, ${THEME}, ${THEME_DARK})` }}>
              <h3 className="text-base font-bold text-white">Update Booking</h3>
              <button onClick={() => setEditData(null)} className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-lg hover:bg-white hover:bg-opacity-20 transition-all">
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Booking Status</label>
                  <select
                    value={editData.status}
                    onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none"
                    onFocus={(e) => e.target.style.borderColor = THEME}
                    onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Payment Status</label>
                  <select
                    value={editData.paymentStatus}
                    onChange={(e) => setEditData({ ...editData, paymentStatus: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none"
                    onFocus={(e) => e.target.style.borderColor = THEME}
                    onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                  >
                    <option value="Pending">Pending</option>
                    <option value="AdvancePaid">Advance Paid</option>
                    <option value="FullyPaid">Fully Paid</option>
                    <option value="Paid">Paid</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Assign Pandit</label>
                  <select
                    value={editData.panditId}
                    onChange={(e) => setEditData({ ...editData, panditId: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none"
                    onFocus={(e) => e.target.style.borderColor = THEME}
                    onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                  >
                    <option value="">-- No Pandit Assigned --</option>
                    {pandits.map(p => (
                      <option key={p._id} value={p._id}>{p.fullName} ({p.city})</option>
                    ))}
                  </select>
                  <p className="text-[10px] text-gray-400 mt-1">Only Active Pandits are shown</p>
                </div>
              </div>
              <button type="submit" className="w-full mt-6 py-3 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90" style={{ backgroundColor: THEME }}>
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 flex items-center justify-between flex-shrink-0" style={{ background: `linear-gradient(135deg, ${THEME}, ${THEME_DARK})` }}>
              <h3 className="text-base font-bold text-white">Booking Details</h3>
              <button onClick={() => setViewData(null)} className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-lg hover:bg-white hover:bg-opacity-20 transition-all">
                <FaTimes />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 flex-shrink-0"><FaBook /></div>
                <div>
                  <p className="text-xs text-gray-400">Puja</p>
                  <p className="text-sm font-bold text-gray-800">{viewData.puja?.pujaType?.trim() || "No Puja"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="text-xs text-gray-400 mb-1 flex items-center gap-1"><FaUser /> User</p>
                  <p className="text-sm font-bold text-gray-800 truncate">{viewData.user?.name}</p>
                  <p className="text-xs text-gray-500">{viewData.user?.mobile}</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="text-xs text-gray-400 mb-1 flex items-center gap-1"><FaUser /> Assigned Pandit</p>
                  <p className="text-sm font-bold text-green-700 truncate">{viewData.pandit?.fullName || "None"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="text-xs text-gray-400 mb-1 flex items-center gap-1"><FaCalendarAlt /> Date</p>
                  <p className="text-sm font-bold text-gray-800">{new Date(viewData.bookingDate).toLocaleDateString("en-IN")}</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="text-xs text-gray-400 mb-1 flex items-center gap-1"><FaClock /> Time Slot</p>
                  <p className="text-sm font-bold text-gray-800">{viewData.timeSlot}</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                <p className="text-xs text-gray-400 mb-1 flex items-center gap-1"><FaMapMarkerAlt /> Address</p>
                <p className="text-sm font-medium text-gray-700 leading-relaxed">{viewData.address}</p>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                <p className="text-xs text-gray-400 mb-1">Special Instructions</p>
                <p className="text-sm font-medium text-gray-700 leading-relaxed">{viewData.specialInstructions || "None"}</p>
              </div>

              {viewData.offer && (
                <div className="p-3 rounded-xl bg-green-50 border border-green-100">
                  <p className="text-xs text-gray-400 mb-2 font-bold">Offer Applied</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-green-700">{viewData.offer.title}</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
                      {viewData.offer.discountValue}{viewData.offer.discountType === "percentage" ? "%" : "₹"} off
                    </span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">You saved ₹{viewData.discountAmount}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl text-center bg-gray-50 border border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 mb-1">Original Price</p>
                  <p className="text-base font-black text-gray-400 line-through">₹{viewData.originalAmount ?? viewData.amount}</p>
                </div>
                <div className="p-3 rounded-xl text-center" style={{ backgroundColor: THEME_LIGHT }}>
                  <p className="text-[10px] font-bold text-gray-400 mb-1">Final Amount</p>
                  <p className="text-base font-black" style={{ color: THEME }}>₹{viewData.amount}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl text-center bg-blue-50">
                  <p className="text-[10px] font-bold text-gray-400 mb-1">Advance (25%)</p>
                  <p className="text-base font-black text-blue-600">₹{viewData.advanceAmount}</p>
                </div>
                <div className="p-3 rounded-xl text-center bg-orange-50">
                  <p className="text-[10px] font-bold text-gray-400 mb-1">Remaining (75%)</p>
                  <p className="text-base font-black text-orange-500">₹{viewData.remainingAmount}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
