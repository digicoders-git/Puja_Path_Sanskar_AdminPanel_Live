import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { getAllPujas, createPuja, updatePuja, deletePuja, togglePuja, getEnums } from "../services/pujaService";
import { FaEye, FaTrash, FaEdit, FaPlus, FaTimes, FaSearch, FaInbox } from "react-icons/fa";
import PujaCharts from "../components/PujaCharts";

const THEME = "#E8621A";
const THEME_LIGHT = "#fff4ee";
const THEME_DARK = "#c9541a";

const EMPTY = { pujaType: "", duration: "", description: "", whatIsIncluded: "" };

const inputCls = "w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 bg-white text-gray-700";
const labelCls = "block text-xs font-semibold text-gray-500 mb-1.5";

export default function PujaPage() {
  const { token } = useAuth();
  const [pujas, setPujas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enums, setEnums] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [viewData, setViewData] = useState(null);
  const [search, setSearch] = useState("");

  const fetchAll = async () => {
    setLoading(true);
    const [data, enumData] = await Promise.all([getAllPujas(token), getEnums()]);
    setPujas(Array.isArray(data) ? data : []);
    setEnums(enumData);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const openCreate = () => {
    setEditData(null); setForm(EMPTY); setImageFile(null); setShowModal(true);
  };

  const openEdit = (p) => {
    setEditData(p); setForm({ ...EMPTY, ...p }); setImageFile(null); setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (imageFile) fd.append("image", imageFile);

    const res = editData ? await updatePuja(token, editData._id, fd) : await createPuja(token, fd);

    if (res._id || res.pujaName) {
      toast.success(editData ? "Puja updated!" : "Puja created!");
      setShowModal(false); fetchAll();
    } else {
      toast.error(res.message || "Something went wrong");
    }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    const res = await deletePuja(token, deleteId);
    if (res.message) { 
      toast.success("Puja deleted!"); 
      setPujas(pujas.filter(p => p._id !== deleteId));
      setDeleteId(null); 
    }
    else toast.error("Delete failed");
  };

  const handleToggle = async (id) => {
    const res = await togglePuja(token, id);
    if (res.message) { 
      toast.success(res.message); 
      setPujas(pujas.map(p => p._id === id ? { ...p, isActive: !p.isActive } : p));
    }
  };

  const filtered = pujas.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.pujaType?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen p-3 sm:p-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Puja Services</h2>
          <p className="text-xs text-gray-400 mt-0.5">Manage all puja offerings</p>
        </div>
        <button onClick={openCreate} className="px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-md flex items-center gap-2"
          style={{ backgroundColor: THEME }}>
          <FaPlus className="text-xs" /> Add Puja
        </button>
      </div>

      {/* Charts */}
      {!loading && pujas.length > 0 && <PujaCharts pujas={pujas} />}

      {/* Search */}
      <div className="mb-4 relative">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-sm" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by puja name, type, description..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none bg-white text-gray-700"
          onFocus={(e) => e.target.style.borderColor = THEME}
          onBlur={(e) => e.target.style.borderColor = "#e5e7eb"} />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
            <FaTimes className="text-xs" />
          </button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-32">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2" style={{ borderColor: THEME }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-gray-300">
          <FaInbox className="text-6xl mb-4" />
          <p className="text-base font-medium text-gray-400">{search ? "No results found" : "No pujas found"}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: `linear-gradient(135deg, ${THEME}, ${THEME_DARK})` }}>
                {["#", "Image", "Type", "Duration", "What's Included", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3.5 text-left text-xs font-bold text-white whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={p._id} className="border-t border-gray-50 hover:bg-orange-50 transition-colors">
                  <td className="px-4 py-3 text-gray-400 text-xs">{i + 1}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 bg-orange-50 flex items-center justify-center">
                      {p.image
                        ? <img src={`${import.meta.env.VITE_API_BASE_URL}/${p.image.replace(/\\/g, "/")}`} className="w-full h-full object-cover" />
                        : <span className="text-lg">🕉️</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="px-2 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: THEME_LIGHT, color: THEME }}>{p.pujaType}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{p.duration}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs max-w-[200px] truncate">{p.whatIsIncluded}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <button onClick={() => handleToggle(p._id)}
                      className="px-3 py-1 rounded-full text-xs font-bold transition-all"
                      style={{ backgroundColor: p.isActive ? "#16a34a20" : "#dc262620", color: p.isActive ? "#16a34a" : "#dc2626" }}>
                      {p.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex gap-1.5">
                      <button onClick={() => setViewData(p)} title="View"
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                        style={{ backgroundColor: THEME_LIGHT, color: THEME }}>
                        <FaEye className="text-sm" />
                      </button>
                      <button onClick={() => openEdit(p)} title="Edit"
                        className="w-8 h-8 rounded-lg flex items-center justify-center border transition-all hover:scale-110"
                        style={{ borderColor: "#f97316", color: "#f97316", backgroundColor: "#fff7ed" }}>
                        <FaEdit className="text-sm" />
                      </button>
                      <button onClick={() => setDeleteId(p._id)} title="Delete"
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                        style={{ backgroundColor: "#fef2f2", color: "#ef4444" }}>
                        <FaTrash className="text-sm" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ===== CREATE / EDIT MODAL ===== */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

            {/* Header */}
            <div className="px-5 py-4 flex items-center justify-between flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${THEME}, ${THEME_DARK})` }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <span className="text-base">{editData ? "✏️" : "➕"}</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{editData ? "Edit Puja" : "Add New Puja"}</h3>
                  <p className="text-xs text-white/70">{editData ? "Update puja details" : "Fill in puja information"}</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/20 transition-all"
                style={{ color: "#fff" }}>
                <FaTimes className="text-sm" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-5 py-4">
              <div className="space-y-3">

                {/* Type + Duration */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Puja Type *</label>
                    <input name="pujaType" value={form.pujaType} onChange={handleChange} required
                      placeholder="e.g. Wedding, Havan" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Duration *</label>
                    <input name="duration" value={form.duration} onChange={handleChange} required
                      placeholder="e.g. 2-3 Hours" className={inputCls} />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className={labelCls}>Description *</label>
                  <textarea name="description" value={form.description} onChange={handleChange} required rows={3}
                    placeholder="A sacred Hindu ceremony performed with Vedic rituals..."
                    className={inputCls + " resize-none"} />
                </div>

                {/* What's Included */}
                <div>
                  <label className={labelCls}>What's Included *</label>
                  <textarea name="whatIsIncluded" value={form.whatIsIncluded} onChange={handleChange} required rows={2}
                    placeholder="Pandit Ji, Samagri Kit, Havan Kund, Flowers..."
                    className={inputCls + " resize-none"} />
                </div>

                {/* Image Upload */}
                <div>
                  <label className={labelCls}>Puja Image</label>
                  <div className="border-2 border-dashed rounded-xl p-3 bg-gray-50 hover:bg-white transition-colors"
                    style={{ borderColor: imageFile ? THEME : "#e5e7eb" }}>
                    {(imageFile || editData?.image) && (
                      <img
                        src={imageFile ? URL.createObjectURL(imageFile) : `${import.meta.env.VITE_API_BASE_URL}/${editData.image.replace(/\\/g, "/")}`}
                        className="w-full h-28 rounded-lg object-cover mb-2 border border-orange-100" />
                    )}
                    <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={(e) => setImageFile(e.target.files[0])}
                      className="w-full text-xs text-gray-500" />
                    {imageFile
                      ? <p className="text-xs text-green-600 mt-1 font-semibold">✓ {imageFile.name}</p>
                      : <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP — Max 5MB</p>
                    }
                  </div>
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="flex gap-3 pt-4 mt-4 border-t border-gray-100">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl font-bold text-sm border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-[2] py-2.5 rounded-xl font-bold text-sm text-white disabled:opacity-50 transition-all"
                  style={{ backgroundColor: THEME }}>
                  {submitting ? "Saving..." : editData ? "Update Puja" : "Create Puja"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== VIEW MODAL ===== */}
      {viewData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

            {/* Header */}
            <div className="relative flex-shrink-0" style={{ background: `linear-gradient(135deg, ${THEME}, ${THEME_DARK})` }}>
              <div className="px-5 pt-5 pb-8">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-white/30 flex-shrink-0 bg-white/20 flex items-center justify-center">
                      {viewData.image
                        ? <img src={`${import.meta.env.VITE_API_BASE_URL}/${viewData.image.replace(/\\/g, "/")}`} className="w-full h-full object-cover" />
                        : <span className="text-2xl">🕉️</span>}
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white">{viewData.pujaType}</h3>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white">{viewData.pujaType}</span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white">⏱ {viewData.duration}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${viewData.isActive ? "bg-green-400/30 text-green-100" : "bg-red-400/30 text-red-100"}`}>
                          {viewData.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setViewData(null)}
                    className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/20 transition-all flex-shrink-0"
                    style={{ color: "#fff" }}>
                    <FaTimes className="text-xs" />
                  </button>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-4 bg-white rounded-t-2xl" />
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 px-5 pb-5 space-y-4">

              {/* Description */}
              <div>
                <p className="text-xs font-black uppercase tracking-wider mb-2" style={{ color: THEME }}>📖 Description</p>
                <p className="text-sm text-gray-600 leading-relaxed p-3 rounded-xl bg-gray-50">{viewData.description}</p>
              </div>

              {/* What's Included */}
              <div>
                <p className="text-xs font-black uppercase tracking-wider mb-2" style={{ color: THEME }}>✅ What's Included</p>
                <div className="p-3 rounded-xl bg-gray-50 space-y-1.5">
                  {viewData.whatIsIncluded.split(",").map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: THEME }} />
                      <span className="text-sm text-gray-600">{item.trim()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-gray-50">
                  <p className="text-xs text-gray-400">Created</p>
                  <p className="text-xs font-semibold text-gray-700">{new Date(viewData.createdAt).toLocaleDateString("en-IN")}</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50">
                  <p className="text-xs text-gray-400">Updated</p>
                  <p className="text-xs font-semibold text-gray-700">{new Date(viewData.updatedAt).toLocaleDateString("en-IN")}</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-gray-100 flex-shrink-0">
              <button onClick={() => setViewData(null)}
                className="w-full py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90"
                style={{ backgroundColor: THEME }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== DELETE MODAL ===== */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <FaTrash className="text-2xl text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">Delete Puja?</h3>
            <p className="text-sm text-gray-400 mb-5">Yeh action undo nahi hoga.</p>
            <div className="flex gap-3">
              <button onClick={handleDelete} className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white bg-red-500 hover:bg-red-600">Delete</button>
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl font-bold text-sm border border-gray-200 text-gray-500">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
