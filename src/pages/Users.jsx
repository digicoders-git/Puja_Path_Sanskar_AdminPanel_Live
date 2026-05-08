import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getAllUsers, updateUser, deleteUser, toggleUserStatus } from "../services/userService";
import { FaUser, FaPhone, FaInbox, FaSearch, FaTimes, FaChevronLeft, FaChevronRight, FaTrash, FaEdit } from "react-icons/fa";
import { toast } from "sonner";

const THEME = "#E8621A";
const THEME_LIGHT = "#fff4ee";
const THEME_DARK = "#c9541a";
const PAGE_OPTIONS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

export default function Users() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteId, setDeleteId] = useState(null);
  const [editData, setEditData] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    const data = await getAllUsers(token);
    if (data.success && data.users) {
      setUsers(data.users);
    } else {
      setUsers([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);
  useEffect(() => { setCurrentPage(1); }, [search, perPage]);

  const handleDelete = async () => {
    const res = await deleteUser(token, deleteId);
    if (res.success) {
      toast.success("User deleted!");
      setUsers(users.filter(u => u._id !== deleteId));
      setDeleteId(null);
    } else {
      toast.error(res.message || "Delete failed");
    }
  };

  const handleToggle = async (id) => {
    const res = await toggleUserStatus(token, id);
    if (res.success) {
      toast.success(res.message);
      setUsers(users.map(u => u._id === id ? { ...u, isActive: res.isActive } : u));
    } else {
      toast.error(res.message || "Toggle failed");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const res = await updateUser(token, editData._id, { name: editData.name, mobile: editData.mobile });
    if (res.success) {
      toast.success("User updated!");
      setUsers(users.map(u => u._id === editData._id ? res.user : u));
      setEditData(null);
    } else {
      toast.error(res.message || "Update failed");
    }
  };

  // Filter
  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.mobile?.toLowerCase().includes(q)
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
            <h2 className="text-lg sm:text-2xl font-bold text-gray-800">App Users</h2>
            <span className="sm:hidden px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: THEME_LIGHT, color: THEME }}>
              {filtered.length} / {users.length} Total
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">All registered users on the app</p>
        </div>
        <span className="hidden sm:inline self-start sm:self-auto px-4 py-1.5 rounded-full text-xs font-bold" style={{ backgroundColor: THEME_LIGHT, color: THEME }}>
          {filtered.length} / {users.length} Total
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
            placeholder="Search by name, mobile..."
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
            <p className="text-sm text-gray-400">Loading users...</p>
          </div>
        </div>

      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-gray-300">
          <FaInbox className="text-6xl mb-4" />
          <p className="text-base font-medium text-gray-400">{search ? "No results found" : "No users found"}</p>
        </div>

      ) : (
        <>
          {/* Scrollable Table */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr style={{ background: `linear-gradient(135deg, ${THEME}, ${THEME_DARK})` }}>
                  {["#", "Full Name", "Mobile Number", "Registration Date", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-8 py-4 text-left text-xs font-bold text-white whitespace-nowrap tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((u, i) => (
                  <tr key={u._id} className="border-t border-gray-50 transition-colors hover:bg-orange-50">
                    <td className="px-8 py-4 text-gray-400 font-medium">{(currentPage - 1) * perPage + i + 1}</td>
                    <td className="px-8 py-4 font-semibold text-gray-800 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <FaUser className="text-gray-300" />
                        {u.name}
                      </div>
                    </td>
                    <td className="px-8 py-4 text-gray-500 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <FaPhone className="text-gray-300" />
                        {u.mobile}
                      </div>
                    </td>
                    <td className="px-8 py-4 text-gray-500 text-xs whitespace-nowrap">
                      {new Date(u.createdAt).toLocaleString("en-IN", {
                        day: "2-digit", month: "short", year: "numeric",
                        hour: "2-digit", minute: "2-digit"
                      })}
                    </td>
                    <td className="px-8 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggle(u._id)}
                        className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all inline-block ${
                          u.isActive ? "bg-green-100 text-green-600 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                      >
                        {u.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-8 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => setEditData(u)}
                          title="Edit User"
                          className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:shadow-md hover:scale-110"
                          style={{ backgroundColor: THEME_LIGHT, color: THEME }}>
                          <FaEdit className="text-sm" />
                        </button>
                        <button onClick={() => setDeleteId(u._id)}
                          title="Delete User"
                          className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:shadow-md hover:scale-110 bg-red-50 text-red-500">
                          <FaTrash className="text-sm" />
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

      {/* Edit Modal */}
      {editData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between" style={{ background: `linear-gradient(135deg, ${THEME}, ${THEME_DARK})` }}>
              <h3 className="text-base font-bold text-white">Edit User</h3>
              <button onClick={() => setEditData(null)} className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-lg hover:bg-white hover:bg-opacity-20 transition-all">
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none"
                    onFocus={(e) => e.target.style.borderColor = THEME}
                    onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Mobile Number</label>
                  <input
                    type="text"
                    required
                    value={editData.mobile}
                    onChange={(e) => setEditData({ ...editData, mobile: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none"
                    onFocus={(e) => e.target.style.borderColor = THEME}
                    onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
                  />
                </div>
              </div>
              <button type="submit" className="w-full mt-6 py-3 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90" style={{ backgroundColor: THEME }}>
                Save Changes
              </button>
            </form>
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
            <h3 className="text-lg font-bold text-gray-800 mb-1">Delete User?</h3>
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
