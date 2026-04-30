import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { getAllContacts, getContactById, deleteContact } from "../services/contactService";
import { FaEye, FaTrash, FaEnvelope, FaPhone, FaUser, FaCalendarAlt, FaTag, FaTimes, FaInbox, FaSearch, FaChevronLeft, FaChevronRight } from "react-icons/fa";

const THEME = "#E8621A";
const THEME_LIGHT = "#fff4ee";
const THEME_DARK = "#c9541a";
const PAGE_OPTIONS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

export default function Contact() {
  const { token } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [viewData, setViewData] = useState(null);
  const [search, setSearch] = useState("");
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchContacts = async () => {
    setLoading(true);
    const data = await getAllContacts(token);
    setContacts(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { fetchContacts(); }, []);

  // Reset to page 1 on search/perPage change
  useEffect(() => { setCurrentPage(1); }, [search, perPage]);

  const handleView = async (id) => {
    const data = await getContactById(token, id);
    setViewData(data);
  };

  const handleDelete = async () => {
    const res = await deleteContact(token, deleteId);
    if (res.message) {
      toast.success("Contact deleted!");
      setDeleteId(null);
      fetchContacts();
    } else {
      toast.error("Delete failed");
    }
  };

  // Filter
  const filtered = contacts.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.fullName?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.toLowerCase().includes(q) ||
      c.subject?.toLowerCase().includes(q)
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
            <h2 className="text-lg sm:text-2xl font-bold text-gray-800">Contact Enquiries</h2>
            <span className="sm:hidden px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: THEME_LIGHT, color: THEME }}>
              {filtered.length} / {contacts.length} Total
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">All incoming contact messages from users</p>
        </div>
        <span className="hidden sm:inline self-start sm:self-auto px-4 py-1.5 rounded-full text-xs font-bold" style={{ backgroundColor: THEME_LIGHT, color: THEME }}>
          {filtered.length} / {contacts.length} Total
        </span>
      </div>

      {/* Search + Per Page */}
      <div className="flex gap-2 mb-5">
        {/* Search Bar */}
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-sm" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, phone, subject..."
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

        {/* Per Page */}
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
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 mx-auto mb-3" style={{ borderColor: THEME }} />
            <p className="text-sm text-gray-400">Loading contacts...</p>
          </div>
        </div>

      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-gray-300">
          <FaInbox className="text-6xl mb-4" />
          <p className="text-base font-medium text-gray-400">{search ? "No results found" : "No contacts found"}</p>
          <p className="text-xs text-gray-300 mt-1">{search ? "Try a different search term" : "New enquiries will appear here"}</p>
        </div>

      ) : (
        <>
          {/* Scrollable Table — Desktop + Mobile */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr style={{ background: `linear-gradient(135deg, ${THEME}, ${THEME_DARK})` }}>
                  {["#", "Full Name", "Phone", "Email", "Subject", "Date", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3.5 text-left text-xs font-bold text-white whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((c, i) => (
                  <tr key={c._id} className="border-t border-gray-50 transition-colors hover:bg-orange-50">
                    <td className="px-4 py-3.5 text-gray-400 font-medium">{(currentPage - 1) * perPage + i + 1}</td>
                    <td className="px-4 py-3.5 font-semibold text-gray-800 whitespace-nowrap">{c.fullName}</td>
                    <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">{c.phone || "—"}</td>
                    <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">{c.email}</td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: THEME_LIGHT, color: THEME }}>
                        {c.subject}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-gray-400 text-xs whitespace-nowrap">
                      {new Date(c.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex gap-2">
                        <button onClick={() => handleView(c._id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:shadow-md whitespace-nowrap"
                          style={{ backgroundColor: THEME_LIGHT, color: THEME }}>
                          <FaEye className="text-xs" /> View
                        </button>
                        <button onClick={() => setDeleteId(c._id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:shadow-md bg-red-50 text-red-500 whitespace-nowrap">
                          <FaTrash className="text-xs" /> Delete
                        </button>
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

      {/* View Modal */}
      {viewData && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 flex items-center justify-between flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${THEME}, ${THEME_DARK})` }}>
              <div className="flex items-center gap-2">
                <FaEnvelope className="text-white opacity-80" />
                <h3 className="text-base font-bold text-white">Contact Details</h3>
              </div>
              {/* Close button — always visible */}
              <button
                onClick={() => setViewData(null)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-lg transition-all hover:bg-white hover:bg-opacity-20"
                style={{ backgroundColor: "rgba(255,255,255,0.25)" }}
              >
                <FaTimes />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-2.5 overflow-y-auto">
              {[
                { icon: FaUser, label: "Full Name", value: viewData.fullName },
                { icon: FaPhone, label: "Phone", value: viewData.phone || "—" },
                { icon: FaEnvelope, label: "Email", value: viewData.email },
                { icon: FaTag, label: "Subject", value: viewData.subject },
                { icon: FaCalendarAlt, label: "Date", value: new Date(viewData.createdAt).toLocaleString("en-IN") },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: THEME_LIGHT }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: THEME + "30" }}>
                    <Icon className="text-xs" style={{ color: THEME }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-400">{label}</p>
                    <p className="text-sm font-semibold text-gray-800 truncate">{value}</p>
                  </div>
                </div>
              ))}
              <div>
                <p className="text-xs text-gray-400 mb-1.5 font-semibold">Message</p>
                <p className="p-3.5 rounded-xl text-sm text-gray-700 bg-gray-50 border border-gray-100 leading-relaxed">
                  {viewData.message}
                </p>
              </div>
            </div>

            <div className="px-5 pb-6 flex-shrink-0">
              <button onClick={() => setViewData(null)}
                className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90"
                style={{ backgroundColor: THEME }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <FaTrash className="text-2xl text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">Delete Contact?</h3>
            <p className="text-sm text-gray-400 mb-6">Yeh action undo nahi hoga.</p>
            <div className="flex gap-3">
              <button onClick={handleDelete} className="flex-1 py-3 rounded-xl font-bold text-sm text-white bg-red-500 hover:bg-red-600 transition-all">
                Delete
              </button>
              <button onClick={() => setDeleteId(null)} className="flex-1 py-3 rounded-xl font-bold text-sm border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
