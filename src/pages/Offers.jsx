import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { getAllOffersAdmin, createOffer, updateOffer, toggleOffer, deleteOffer } from "../services/offerService";
import { getAllPujas } from "../services/pujaService";
import { FaTrash, FaEdit, FaPlus, FaTimes, FaSearch, FaInbox, FaTag } from "react-icons/fa";

const THEME = "#E8621A";
const THEME_LIGHT = "#fff4ee";
const THEME_DARK = "#c9541a";

const EMPTY = {
  title: "", description: "", discountType: "percentage", discountValue: "",
  applicableTo: "all", pujas: [], minAmount: 0, priority: 0,
  startDate: "", endDate: "",
};

const inputCls = "w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 bg-white text-gray-700";
const labelCls = "block text-xs font-semibold text-gray-500 mb-1.5";

export default function OffersPage() {
  const { token } = useAuth();
  const [offers, setOffers] = useState([]);
  const [pujasList, setPujasList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState("");

  const fetchAll = async () => {
    setLoading(true);
    const [data, pujas] = await Promise.all([getAllOffersAdmin(token), getAllPujas(token)]);
    setOffers(Array.isArray(data.offers) ? data.offers : []);
    setPujasList(Array.isArray(pujas) ? pujas : []);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const openCreate = () => { setEditData(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (o) => { setEditData(o); setForm({ ...EMPTY, ...o, startDate: o.startDate?.slice(0, 10), endDate: o.endDate?.slice(0, 10) }); setShowModal(true); };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePujaCheck = (id) => {
    setForm((prev) => ({
      ...prev,
      pujas: prev.pujas.includes(id)
        ? prev.pujas.filter((p) => p !== id)
        : [...prev.pujas, id],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = { ...form, discountValue: Number(form.discountValue), minAmount: Number(form.minAmount), priority: Number(form.priority) };
    const res = editData ? await updateOffer(token, editData._id, payload) : await createOffer(token, payload);
    if (res.success) {
      toast.success(editData ? "Offer updated!" : "Offer created!");
      setShowModal(false); fetchAll();
    } else {
      toast.error(res.message || "Something went wrong");
    }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    const res = await deleteOffer(token, deleteId);
    if (res.success) {
      toast.success("Offer deleted!");
      setOffers(offers.filter((o) => o._id !== deleteId));
      setDeleteId(null);
    } else toast.error("Delete failed");
  };

  const handleToggle = async (id) => {
    const res = await toggleOffer(token, id);
    if (res.success) {
      toast.success(res.message);
      setOffers(offers.map((o) => o._id === id ? { ...o, isActive: !o.isActive } : o));
    }
  };

  const filtered = offers.filter((o) => {
    const q = search.toLowerCase();
    return o.title?.toLowerCase().includes(q) || o.discountType?.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen p-3 sm:p-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Offers & Discounts</h2>
          <p className="text-xs text-gray-400 mt-0.5">Manage all offers and discounts</p>
        </div>
        <button onClick={openCreate} className="px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-md flex items-center gap-2"
          style={{ backgroundColor: THEME }}>
          <FaPlus className="text-xs" /> Add Offer
        </button>
      </div>

      {/* Stats Cards */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {[
            { label: "Total Offers", value: offers.length, color: THEME },
            { label: "Active", value: offers.filter((o) => o.isActive).length, color: "#16a34a" },
            { label: "Inactive", value: offers.filter((o) => !o.isActive).length, color: "#dc2626" },
            { label: "Specific", value: offers.filter((o) => o.applicableTo === "specific").length, color: "#7c3aed" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <p className="text-xs text-gray-400">{s.label}</p>
              <p className="text-2xl font-black mt-1" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="mb-4 relative">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-sm" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title, discount type..."
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
          <p className="text-base font-medium text-gray-400">{search ? "No results found" : "No offers found"}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: `linear-gradient(135deg, ${THEME}, ${THEME_DARK})` }}>
                {["#", "Title", "Discount", "Applicable", "Priority", "Min Amount", "Validity", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3.5 text-left text-xs font-bold text-white whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((o, i) => (
                <tr key={o._id} className="border-t border-gray-50 hover:bg-orange-50 transition-colors">
                  <td className="px-4 py-3 text-gray-400 text-xs">{i + 1}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: THEME_LIGHT }}>
                        <FaTag style={{ color: THEME }} className="text-xs" />
                      </div>
                      <span className="font-semibold text-gray-700 text-xs">{o.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="px-2 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: THEME_LIGHT, color: THEME }}>
                      {o.discountType === "percentage" ? `${o.discountValue}%` : `₹${o.discountValue}`} off
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${o.applicableTo === "all" ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"}`}>
                      {o.applicableTo === "all" ? "All Pujas" : "Specific"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{o.priority}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">₹{o.minAmount}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                    {new Date(o.startDate).toLocaleDateString("en-IN")} → {new Date(o.endDate).toLocaleDateString("en-IN")}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <button onClick={() => handleToggle(o._id)}
                      className="px-3 py-1 rounded-full text-xs font-bold transition-all"
                      style={{ backgroundColor: o.isActive ? "#16a34a20" : "#dc262620", color: o.isActive ? "#16a34a" : "#dc2626" }}>
                      {o.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex gap-1.5">
                      <button onClick={() => openEdit(o)} title="Edit"
                        className="w-8 h-8 rounded-lg flex items-center justify-center border transition-all hover:scale-110"
                        style={{ borderColor: "#f97316", color: "#f97316", backgroundColor: "#fff7ed" }}>
                        <FaEdit className="text-sm" />
                      </button>
                      <button onClick={() => setDeleteId(o._id)} title="Delete"
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

      {/* CREATE / EDIT MODAL */}
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
                  <h3 className="text-sm font-bold text-white">{editData ? "Edit Offer" : "Add New Offer"}</h3>
                  <p className="text-xs text-white/70">{editData ? "Update offer details" : "Fill in offer information"}</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/20 transition-all text-white">
                <FaTimes className="text-sm" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-5 py-4">
              <div className="space-y-3">

                {/* Title */}
                <div>
                  <label className={labelCls}>Title *</label>
                  <input name="title" value={form.title} onChange={handleChange} required placeholder="e.g. Diwali Special 20% off" className={inputCls} />
                </div>

                {/* Description */}
                <div>
                  <label className={labelCls}>Description</label>
                  <textarea name="description" value={form.description} onChange={handleChange} rows={2}
                    placeholder="Offer description..." className={inputCls + " resize-none"} />
                </div>

                {/* Discount Type + Value */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Discount Type *</label>
                    <select name="discountType" value={form.discountType} onChange={handleChange} className={inputCls}>
                      <option value="percentage">Percentage (%)</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Discount Value *</label>
                    <input name="discountValue" type="number" value={form.discountValue} onChange={handleChange} required
                      placeholder={form.discountType === "percentage" ? "e.g. 20" : "e.g. 200"} className={inputCls} />
                  </div>
                </div>

                {/* Applicable To + Priority */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Applicable To *</label>
                    <select name="applicableTo" value={form.applicableTo} onChange={handleChange} className={inputCls}>
                      <option value="all">All Pujas</option>
                      <option value="specific">Specific Puja</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Priority</label>
                    <input name="priority" type="number" value={form.priority} onChange={handleChange}
                      placeholder="e.g. 5 (jitna zyada utna pehle)" className={inputCls} />
                  </div>
                </div>

                {/* Specific Pujas Checkboxes */}
                {form.applicableTo === "specific" && (
                  <div>
                    <label className={labelCls}>Select Pujas * <span className="text-red-400">(kam se kam ek select karo)</span></label>
                    <div className="border border-gray-200 rounded-xl p-3 max-h-40 overflow-y-auto space-y-2 bg-gray-50">
                      {pujasList.length === 0 ? (
                        <p className="text-xs text-gray-400">Koi puja nahi mili</p>
                      ) : pujasList.map((p) => (
                        <label key={p._id} className="flex items-center gap-2 cursor-pointer hover:bg-white rounded-lg px-2 py-1 transition-all">
                          <input
                            type="checkbox"
                            checked={form.pujas.includes(p._id)}
                            onChange={() => handlePujaCheck(p._id)}
                            className="accent-orange-500"
                          />
                          <span className="text-xs text-gray-700 font-medium">{p.pujaType}</span>
                        </label>
                      ))}
                    </div>
                    {form.pujas.length > 0 && (
                      <p className="text-xs text-green-600 mt-1 font-semibold">✓ {form.pujas.length} puja selected</p>
                    )}
                  </div>
                )}

                {/* Min Amount */}
                <div>
                  <label className={labelCls}>Minimum Amount (₹)</label>
                  <input name="minAmount" type="number" value={form.minAmount} onChange={handleChange}
                    placeholder="e.g. 500" className={inputCls} />
                </div>

                {/* Start + End Date */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Start Date *</label>
                    <input name="startDate" type="date" value={form.startDate} onChange={handleChange} required className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>End Date *</label>
                    <input name="endDate" type="date" value={form.endDate} onChange={handleChange} required className={inputCls} />
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
                  {submitting ? "Saving..." : editData ? "Update Offer" : "Create Offer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <FaTrash className="text-2xl text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">Delete Offer?</h3>
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
