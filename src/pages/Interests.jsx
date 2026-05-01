import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { getAllInterests, updateInterestStatus } from "../services/interestService";
import { FaPhoneAlt, FaUser, FaBook, FaSearch, FaTimes, FaChevronLeft, FaChevronRight, FaEdit, FaRegClipboard } from "react-icons/fa";

const THEME = "#E8621A";
const THEME_LIGHT = "#fff4ee";
const THEME_DARK = "#c9541a";
const PAGE_OPTIONS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

export default function Interests() {
  const { token } = useAuth();
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [editData, setEditData] = useState(null);

  const fetchAll = async (hideLoading = false) => {
    if (!hideLoading) setLoading(true);
    const data = await getAllInterests(token);
    if (data.success) {
      setInterests(data.interests || []);
    }
    if (!hideLoading) setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);
  useEffect(() => { setCurrentPage(1); }, [search, perPage]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    const res = await updateInterestStatus(token, editData._id, {
      status: editData.status,
      adminNotes: editData.adminNotes,
    });
    if (res.success) {
      toast.success("Lead updated successfully!");
      setInterests(interests.map(i => i._id === editData._id ? { ...i, ...res.interest } : i));
      setEditData(null);
    } else {
      toast.error(res.message || "Update failed");
    }
  };

  // Filter
  const filtered = interests.filter((i) => {
    const q = search.toLowerCase();
    return (
      i.name?.toLowerCase().includes(q) ||
      i.mobile?.toLowerCase().includes(q) ||
      i.puja?.pujaType?.toLowerCase().includes(q) ||
      i.status?.toLowerCase().includes(q)
    );
  });

  // Pagination
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending": return "bg-orange-100 text-orange-600 border border-orange-200";
      case "Contacted": return "bg-blue-100 text-blue-600 border border-blue-200";
      case "Converted": return "bg-green-100 text-green-600 border border-green-200";
      case "Dropped": return "bg-red-100 text-red-600 border border-red-200";
      default: return "bg-gray-100 text-gray-600 border border-gray-200";
    }
  };

  return (
    <div className="min-h-screen p-3 pt-8 sm:p-4 sm:pt-4">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
        <div className="pl-1">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-800">Puja Leads & Enquiries</h2>
            <span className="sm:hidden px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: THEME_LIGHT, color: THEME }}>
              {filtered.length} Total
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">Manage users who showed interest in Pujas</p>
        </div>
        <span className="hidden sm:inline self-start sm:self-auto px-4 py-1.5 rounded-full text-xs font-bold" style={{ backgroundColor: THEME_LIGHT, color: THEME }}>
          {filtered.length} Total
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
            placeholder="Search by Name, Mobile, Puja or Status..."
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
          <FaRegClipboard className="text-6xl mb-4" />
          <p className="text-base font-medium text-gray-400">{search ? "No leads found" : "No leads / enquiries yet"}</p>
        </div>
      ) : (
        <>
          {/* Scrollable Table */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr style={{ background: `linear-gradient(135deg, ${THEME}, ${THEME_DARK})` }}>
                  {["Date", "Customer Name", "Mobile", "Interested In (Puja)", "Message", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-8 py-4 text-left text-xs font-bold text-white whitespace-nowrap tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((i) => (
                  <tr key={i._id} className="border-t border-gray-50 transition-colors hover:bg-orange-50">
                    <td className="px-8 py-4 text-gray-500 text-xs whitespace-nowrap">
                      {new Date(i.createdAt).toLocaleString("en-IN", {
                        day: "2-digit", month: "short", year: "numeric",
                        hour: "2-digit", minute: "2-digit"
                      })}
                    </td>
                    <td className="px-8 py-4 whitespace-nowrap">
                      <p className="font-bold text-gray-800 flex items-center gap-1.5"><FaUser className="text-gray-300 text-[10px]" /> {i.name}</p>
                    </td>
                    <td className="px-8 py-4 whitespace-nowrap">
                      <a href={`tel:${i.mobile}`} className="font-bold text-blue-600 hover:underline flex items-center gap-1.5">
                        <FaPhoneAlt className="text-[10px]"/> {i.mobile}
                      </a>
                    </td>
                    <td className="px-8 py-4 whitespace-nowrap">
                      <p className="font-bold" style={{ color: THEME }}>{i.puja?.pujaType?.trim() || "No Puja"}</p>
                    </td>
                    <td className="px-8 py-4 text-xs text-gray-500 max-w-[200px] truncate">
                      {i.message || <span className="italic text-gray-300">No message</span>}
                    </td>
                    <td className="px-8 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1.5 inline-block rounded-full text-[11px] font-bold text-center ${getStatusColor(i.status)}`}>
                        {i.status}
                      </span>
                    </td>
                    <td className="px-8 py-4">
                      <button onClick={() => setEditData({
                          _id: i._id,
                          status: i.status,
                          adminNotes: i.adminNotes || "",
                          name: i.name,
                          mobile: i.mobile,
                          puja: i.puja?.pujaType?.trim() || "No Puja"
                        })}
                        title="Update & Notes"
                        className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:shadow-md hover:scale-110 bg-orange-50 text-orange-600">
                        <FaEdit className="text-sm" />
                      </button>
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
              <div>
                <h3 className="text-base font-bold text-white">Update Lead</h3>
                <p className="text-[10px] text-white/80">{editData.name} - {editData.puja}</p>
              </div>
              <button onClick={() => setEditData(null)} className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-lg hover:bg-white hover:bg-opacity-20 transition-all">
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-6">
              <div className="space-y-4">
                
                {/* Contact Info Quick Call */}
                <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-xl mb-4 border border-blue-100">
                   <FaPhoneAlt className="text-sm flex-shrink-0" />
                   <div>
                     <p className="text-[10px] font-bold uppercase tracking-wider text-blue-500">Call Lead</p>
                     <a href={`tel:${editData.mobile}`} className="text-sm font-black hover:underline">{editData.mobile}</a>
                   </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Lead Status</label>
                  <select
                    value={editData.status}
                    onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none"
                    onFocus={(e) => e.target.style.borderColor = THEME}
                    onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                  >
                    <option value="Pending">Pending (New)</option>
                    <option value="Contacted">Contacted (In Progress)</option>
                    <option value="Converted">Converted (Booked)</option>
                    <option value="Dropped">Dropped (Not Interested)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Admin Notes</label>
                  <textarea
                    value={editData.adminNotes}
                    onChange={(e) => setEditData({ ...editData, adminNotes: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none resize-none"
                    rows="3"
                    placeholder="E.g. Called them, they asked to call back tomorrow..."
                    onFocus={(e) => e.target.style.borderColor = THEME}
                    onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                  ></textarea>
                </div>

              </div>
              <button type="submit" className="w-full mt-6 py-3 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 shadow-md" style={{ backgroundColor: THEME }}>
                Save Updates
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
