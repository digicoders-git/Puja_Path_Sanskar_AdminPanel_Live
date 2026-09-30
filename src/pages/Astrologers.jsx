import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { FaUserTie, FaLanguage, FaStar, FaInbox, FaSearch, FaTimes, FaChevronLeft, FaChevronRight, FaTrash, FaEdit, FaPlus, FaCheckCircle, FaTimesCircle, FaEye, FaUpload } from "react-icons/fa";

const THEME = "#E8621A";
const THEME_LIGHT = "#fff4ee";
const THEME_DARK = "#c9541a";
const PAGE_OPTIONS = [10, 20, 30, 40, 50];

const BASE = import.meta.env.VITE_API_BASE_URL;
const h = () => {
  const token = localStorage.getItem("admin-token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const getImageSrc = (url) => {
  if (!url) return null;
  const str = String(url).trim();
  if (!str) return null;
  if (str.startsWith("data:")) return str;
  if (str.includes("api.pujapathsanskar.com/uploads/")) {
    const filename = str.split("/uploads/").pop();
    return `${BASE}/uploads/${filename}`;
  }
  if (str.startsWith("http://") || str.startsWith("https://")) return str;
  return `${BASE}/${str.replace(/^\/+/, "")}`;
};

export default function Astrologers() {
  const [astrologers, setAstrologers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAstrologer, setCurrentAstrologer] = useState(null);
  const navigate = useNavigate();

  const defaultPlans = [
    { title: "लोकप्रिय", duration: 10, price: 151, description: "व्यक्तिगत कुंडली विश्लेषण और त्वरित समाधान के लिए सही विकल्प।", features: ["कुंडली विश्लेषण", "त्वरित उपाय", "HD वीडियो कॉल", "1 प्रश्न"], isPopular: true, isBest: false, color: "#E65100" },
    { title: "सर्वश्रेष्ठ", duration: 15, price: 251, description: "गहन विश्लेषण, विस्तृत उपाय और मंत्र जाप मार्गदर्शन।", features: ["गहन कुंडली विश्लेषण", "उपाय व मंत्र", "HD वीडियो कॉल", "3 प्रश्न"], isPopular: false, isBest: true, color: "#9C27B0" }
  ];

  const defaultServices = [
    { name: "शुभ मुहूर्त", icon: "✨" },
    { name: "सामान्य मार्गदर्शन", icon: "🔮" },
    { name: "व्यापार मार्गदर्शन", icon: "💼" }
  ];

  const defaultAvailability = {
    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    startTime: "09:00 AM",
    endTime: "09:00 PM"
  };

  const defaultFormData = {
    name: "", specialty: "", experience: "", rating: 5, reviews: "0",
    languages: "", badge: "", badgeColor: "#E65100", status: "online", fees: 151, image: "", 
    bio: "", location: "", isVerified: false,
    consultationModes: ["Chat", "Voice Call", "Video Call"],
    services: defaultServices,
    plans: defaultPlans,
    availability: defaultAvailability
  };

  // Form State
  const [formData, setFormData] = useState(defaultFormData);
  const [activeTab, setActiveTab] = useState("basic");

  const fetchAstrologers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/api/astrologers/admin/all`, { headers: h() });
      const data = await res.json();
      setAstrologers(data.astrologers || []);
    } catch (error) {
      toast.error("Failed to fetch astrologers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAstrologers(); }, []);
  useEffect(() => { setCurrentPage(1); }, [search, perPage]);

  const handleOpenModal = (astrologer = null) => {
    if (astrologer) {
      setCurrentAstrologer(astrologer);
      
      // Parse legacy string services to array of objects if needed
      let parsedServices = astrologer.services;
      if (typeof parsedServices === 'string') {
        parsedServices = parsedServices.split(',').map(s => ({ name: s.trim(), icon: "✨" }));
      }

      setFormData({
        ...defaultFormData,
        ...astrologer,
        services: parsedServices || defaultServices,
        plans: astrologer.plans && astrologer.plans.length > 0 ? astrologer.plans : defaultPlans,
        availability: astrologer.availability?.days ? astrologer.availability : defaultAvailability,
        consultationModes: astrologer.consultationModes?.length > 0 ? astrologer.consultationModes : defaultFormData.consultationModes
      });
    } else {
      setCurrentAstrologer(null);
      setFormData(defaultFormData);
    }
    setActiveTab("basic");
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this astrologer?")) {
      try {
        await fetch(`${BASE}/api/astrologers/${id}`, {
          method: "DELETE",
          headers: h(),
        });
        toast.success("Astrologer deleted successfully");
        fetchAstrologers();
      } catch (error) {
        toast.error("Error deleting astrologer");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentAstrologer) {
        await fetch(`${BASE}/api/astrologers/${currentAstrologer._id}`, {
          method: "PUT",
          headers: { ...h(), "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        toast.success("Astrologer updated");
      } else {
        await fetch(`${BASE}/api/astrologers`, {
          method: "POST",
          headers: { ...h(), "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        toast.success("Astrologer created");
      }
      setIsModalOpen(false);
      fetchAstrologers();
    } catch (error) {
      toast.error("Error saving astrologer");
    }
  };

  // Filter
  const filtered = astrologers.filter((a) => {
    const q = search.toLowerCase();
    return (
      a.name?.toLowerCase().includes(q) ||
      a.specialty?.toLowerCase().includes(q)
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
            <h2 className="text-lg sm:text-2xl font-bold text-gray-800">Astrologers</h2>
            <span className="sm:hidden px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: THEME_LIGHT, color: THEME }}>
              {filtered.length} / {astrologers.length} Total
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">Manage astrologers on the app</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline px-4 py-1.5 rounded-full text-xs font-bold" style={{ backgroundColor: THEME_LIGHT, color: THEME }}>
            {filtered.length} / {astrologers.length} Total
          </span>
          <button onClick={() => handleOpenModal()} className="px-4 py-2 rounded-xl text-sm font-bold text-white transition-all shadow-md hover:shadow-lg flex items-center gap-2" style={{ background: `linear-gradient(135deg, ${THEME}, ${THEME_DARK})` }}>
            <FaPlus /> Add Astrologer
          </button>
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
            placeholder="Search by name, specialty..."
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
            <p className="text-sm text-gray-400">Loading astrologers...</p>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-gray-300">
          <FaInbox className="text-6xl mb-4" />
          <p className="text-base font-medium text-gray-400">{search ? "No results found" : "No astrologers found"}</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead>
                <tr style={{ background: `linear-gradient(135deg, ${THEME}, ${THEME_DARK})` }}>
                  {["#", "Astrologer", "Specialty", "Experience", "Languages", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-6 py-4 text-left text-xs font-bold text-white whitespace-nowrap tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((a, i) => (
                  <tr key={a._id} className="border-t border-gray-50 transition-colors hover:bg-orange-50">
                    <td className="px-6 py-4 text-gray-400 font-medium">{(currentPage - 1) * perPage + i + 1}</td>
                    <td className="px-6 py-4 font-semibold text-gray-800 whitespace-nowrap flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-lg shadow-sm border border-orange-200 overflow-hidden flex-shrink-0">
                        {(() => {
                          const src = getImageSrc(a.image);
                          const initial = (a.name || 'A')[0].toUpperCase();
                          if (src) {
                            return (
                              <img
                                src={src}
                                alt={a.name}
                                className="w-full h-full rounded-full object-cover"
                                onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }}
                              />
                            );
                          }
                          return null;
                        })()}
                        <span
                          className="w-full h-full rounded-full flex items-center justify-center font-bold text-sm text-orange-600 bg-orange-100"
                          style={{ display: getImageSrc(a.image) ? 'none' : 'flex' }}
                        >
                          {(a.name || 'A')[0].toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div>{a.name} {a.isVerified && <FaCheckCircle className="inline text-green-500 text-xs ml-1" />}</div>
                        <div className="text-xs text-yellow-600 flex items-center gap-1 mt-0.5">
                          <FaStar className="text-[10px]" /> {a.rating} ({a.reviews})
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{a.specialty}</td>
                    <td className="px-6 py-4 text-gray-600">{a.experience}</td>
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap flex items-center gap-2">
                      <FaLanguage className="text-gray-400" /> {a.languages}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-1 w-max ${
                        a.status === 'online' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {a.status === 'online' ? <FaCheckCircle /> : <FaTimesCircle />}
                        {a.status === 'online' ? 'Online' : 'Offline'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => navigate(`/astrologers/view/${a._id}`)} title="View" className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:shadow-md hover:scale-110" style={{ backgroundColor: "#e0f2fe", color: "#0284c7" }}>
                          <FaEye className="text-sm" />
                        </button>
                        <button onClick={() => handleOpenModal(a)} title="Edit" className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:shadow-md hover:scale-110" style={{ backgroundColor: THEME_LIGHT, color: THEME }}>
                          <FaEdit className="text-sm" />
                        </button>
                        <button onClick={() => handleDelete(a._id)} title="Delete" className="w-8 h-8 rounded-full flex items-center justify-center bg-red-50 text-red-500 transition-all hover:shadow-md hover:scale-110">
                          <FaTrash className="text-sm" />
                        </button>
                      </div>
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
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100" style={{ backgroundColor: THEME_LIGHT }}>
              <h3 className="text-lg font-bold" style={{ color: THEME_DARK }}>
                {currentAstrologer ? "Edit Astrologer" : "Add Astrologer"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-gray-400 hover:text-red-500 shadow-sm transition-all hover:scale-105">
                <FaTimes />
              </button>
            </div>

            <div className="flex border-b border-gray-100 bg-gray-50 px-6 pt-3 gap-6">
              {['basic', 'services', 'plans', 'availability'].map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 text-sm font-bold border-b-2 transition-all capitalize ${activeTab === tab ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-gray-50/30">
              <form id="astrologer-form" onSubmit={handleSubmit} className="space-y-6">
                
                {/* BASIC TAB */}
                {activeTab === 'basic' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-600">Name</label>
                      <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 bg-white transition-all" style={{ "--tw-ring-color": THEME_LIGHT, borderColor: formData.name ? THEME : "" }} placeholder="e.g. Pt. Rajesh" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-600">Specialty</label>
                      <input required value={formData.specialty} onChange={e => setFormData({...formData, specialty: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 bg-white transition-all" style={{ "--tw-ring-color": THEME_LIGHT }} placeholder="e.g. Vedic Astrology" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-600">Location</label>
                      <input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 bg-white transition-all" style={{ "--tw-ring-color": THEME_LIGHT }} placeholder="e.g. Lucknow, Uttar Pradesh" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-600">Experience</label>
                      <input required value={formData.experience} onChange={e => setFormData({...formData, experience: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 bg-white transition-all" style={{ "--tw-ring-color": THEME_LIGHT }} placeholder="e.g. 15 Years" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-600">Languages</label>
                      <input required value={formData.languages} onChange={e => setFormData({...formData, languages: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 bg-white transition-all" style={{ "--tw-ring-color": THEME_LIGHT }} placeholder="e.g. Hindi, English" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-600">Base Fees (₹)</label>
                      <input type="number" required value={formData.fees} onChange={e => setFormData({...formData, fees: e.target.value === '' ? '' : Number(e.target.value)})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 bg-white transition-all" style={{ "--tw-ring-color": THEME_LIGHT }} placeholder="e.g. 151" />
                    </div>
                    
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-sm font-semibold text-gray-600">Bio</label>
                      <textarea value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 bg-white transition-all" rows="3" style={{ "--tw-ring-color": THEME_LIGHT }} placeholder="10+ years of experience in Vedic Astrology..." />
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-600">Rating (Out of 5)</label>
                      <input type="number" step="0.1" value={formData.rating} onChange={e => setFormData({...formData, rating: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 bg-white transition-all" style={{ "--tw-ring-color": THEME_LIGHT }} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-600">Reviews Count</label>
                      <input value={formData.reviews} onChange={e => setFormData({...formData, reviews: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 bg-white transition-all" style={{ "--tw-ring-color": THEME_LIGHT }} placeholder="e.g. 2.1k" />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-sm font-semibold text-gray-600">Profile Photo</label>
                      <div className="flex flex-col sm:flex-row items-center gap-4 p-3 bg-white border border-gray-200 rounded-xl">
                        <div className="relative w-16 h-16 rounded-full border-2 border-orange-200 bg-orange-50 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-inner">
                          {(() => {
                            const previewSrc = formData.image?.startsWith('data:') ? formData.image : getImageSrc(formData.image);
                            if (previewSrc) {
                              return (
                                <img
                                  src={previewSrc}
                                  alt="Preview"
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    if (e.currentTarget.nextSibling) {
                                      e.currentTarget.nextSibling.style.display = 'flex';
                                    }
                                  }}
                                />
                              );
                            }
                            return null;
                          })()}
                          <span
                            className="w-full h-full rounded-full flex items-center justify-center font-bold text-lg text-orange-600 bg-orange-100"
                            style={{ display: formData.image ? 'none' : 'flex' }}
                          >
                            {(formData.name || 'A')[0].toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 w-full space-y-2">
                          <div className="flex items-center gap-2">
                            <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-orange-300 bg-orange-50 text-orange-700 text-xs font-bold cursor-pointer hover:bg-orange-100 transition-all">
                              <FaUpload /> Choose Photo from Device
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    if (file.size > 5 * 1024 * 1024) {
                                      toast.error("Image size must be less than 5MB");
                                      return;
                                    }
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      setFormData({ ...formData, image: reader.result });
                                      toast.success("Photo selected!");
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </label>
                            {formData.image && (
                              <button
                                type="button"
                                onClick={() => setFormData({ ...formData, image: "" })}
                                className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                          <input
                            value={formData.image?.startsWith('data:') ? '(Image file selected)' : formData.image}
                            onChange={e => {
                              if (!formData.image?.startsWith('data:')) {
                                setFormData({...formData, image: e.target.value});
                              }
                            }}
                            className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-1 bg-gray-50 text-gray-600"
                            placeholder="Or enter image URL (https://...)"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-600">Badge Text</label>
                      <input value={formData.badge} onChange={e => setFormData({...formData, badge: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 bg-white transition-all" style={{ "--tw-ring-color": THEME_LIGHT }} placeholder="e.g. Top Rated" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-600">Badge Color (Hex)</label>
                      <div className="flex gap-2">
                        <div className="w-10 h-10 rounded-xl border border-gray-200 flex-shrink-0" style={{ backgroundColor: formData.badgeColor }}></div>
                        <input value={formData.badgeColor} onChange={e => setFormData({...formData, badgeColor: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 bg-white transition-all uppercase" style={{ "--tw-ring-color": THEME_LIGHT }} placeholder="#E65100" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-600">Verified</label>
                      <div className="flex items-center mt-2">
                        <input type="checkbox" checked={formData.isVerified} onChange={e => setFormData({...formData, isVerified: e.target.checked})} className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500" />
                        <span className="ml-2 text-sm text-gray-700">Yes, show verification badge</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-600">Status</label>
                      <div className="flex gap-4 mt-1">
                        <label className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border cursor-pointer transition-all ${formData.status === 'online' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-white border-gray-200 text-gray-500'}`}>
                          <input type="radio" name="status" value="online" checked={formData.status === 'online'} onChange={e => setFormData({...formData, status: e.target.value})} className="hidden" />
                          <div className={`w-3 h-3 rounded-full ${formData.status === 'online' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <span className="font-bold text-sm">Online</span>
                        </label>
                        <label className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border cursor-pointer transition-all ${formData.status === 'offline' ? 'bg-gray-100 border-gray-400 text-gray-700' : 'bg-white border-gray-200 text-gray-500'}`}>
                          <input type="radio" name="status" value="offline" checked={formData.status === 'offline'} onChange={e => setFormData({...formData, status: e.target.value})} className="hidden" />
                          <div className={`w-3 h-3 rounded-full ${formData.status === 'offline' ? 'bg-gray-500' : 'bg-gray-300'}`}></div>
                          <span className="font-bold text-sm">Offline</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* SERVICES TAB */}
                {activeTab === 'services' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-bold text-gray-700">Services Provided</h4>
                      <button type="button" onClick={() => setFormData({...formData, services: [...formData.services, { name: "", icon: "✨" }]})} className="text-xs px-3 py-1.5 rounded-lg bg-orange-100 text-orange-700 font-bold hover:bg-orange-200">+ Add Service</button>
                    </div>
                    {formData.services.map((srv, index) => (
                      <div key={index} className="flex gap-3 items-center bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                        <input value={srv.icon} onChange={e => {
                          const newSrv = [...formData.services];
                          newSrv[index].icon = e.target.value;
                          setFormData({...formData, services: newSrv});
                        }} className="w-16 px-3 py-2 rounded-lg border text-center text-xl" placeholder="✨" />
                        <input value={srv.name} onChange={e => {
                          const newSrv = [...formData.services];
                          newSrv[index].name = e.target.value;
                          setFormData({...formData, services: newSrv});
                        }} className="flex-1 px-4 py-2 rounded-lg border text-sm" placeholder="Service Name (e.g. शुभ मुहूर्त)" />
                        <button type="button" onClick={() => {
                          const newSrv = formData.services.filter((_, i) => i !== index);
                          setFormData({...formData, services: newSrv});
                        }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><FaTrash /></button>
                      </div>
                    ))}
                    
                    <h4 className="font-bold text-gray-700 mt-8 mb-2 border-t pt-6">Consultation Modes</h4>
                    <div className="flex gap-4">
                      {["Chat", "Voice Call", "Video Call"].map(mode => (
                        <label key={mode} className="flex items-center gap-2 cursor-pointer bg-white px-4 py-2 border rounded-xl">
                          <input type="checkbox" checked={formData.consultationModes.includes(mode)} onChange={e => {
                            if (e.target.checked) setFormData({...formData, consultationModes: [...formData.consultationModes, mode]});
                            else setFormData({...formData, consultationModes: formData.consultationModes.filter(m => m !== mode)});
                          }} className="w-4 h-4 text-orange-500 rounded" />
                          <span className="text-sm font-medium">{mode}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* PLANS TAB */}
                {activeTab === 'plans' && (
                  <div className="space-y-5">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-bold text-gray-700">Consultation Plans</h4>
                      <button type="button" onClick={() => setFormData({...formData, plans: [...formData.plans, { title: "नया प्लान", duration: 10, price: 100, description: "", features: [""], isPopular: false, isBest: false, color: "#E65100" }]})} className="text-xs px-3 py-1.5 rounded-lg bg-orange-100 text-orange-700 font-bold hover:bg-orange-200">+ Add Plan</button>
                    </div>
                    {formData.plans.map((plan, index) => (
                      <div key={index} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative space-y-4">
                        <button type="button" onClick={() => {
                          const newPlans = formData.plans.filter((_, i) => i !== index);
                          setFormData({...formData, plans: newPlans});
                        }} className="absolute top-4 right-4 p-2 text-red-500 hover:bg-red-50 rounded-lg text-xs"><FaTrash /></button>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pr-10">
                          <div>
                            <label className="text-xs text-gray-500">Title</label>
                            <input value={plan.title} onChange={e => {
                              const newPlans = [...formData.plans]; newPlans[index].title = e.target.value; setFormData({...formData, plans: newPlans});
                            }} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Plan Title" />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500">Duration (Mins)</label>
                            <input type="number" value={plan.duration} onChange={e => {
                              const newPlans = [...formData.plans]; newPlans[index].duration = Number(e.target.value); setFormData({...formData, plans: newPlans});
                            }} className="w-full px-3 py-2 border rounded-lg text-sm" />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500">Price (₹)</label>
                            <input type="number" value={plan.price} onChange={e => {
                              const newPlans = [...formData.plans]; newPlans[index].price = Number(e.target.value); setFormData({...formData, plans: newPlans});
                            }} className="w-full px-3 py-2 border rounded-lg text-sm" />
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-xs text-gray-500">Description</label>
                          <input value={plan.description} onChange={e => {
                            const newPlans = [...formData.plans]; newPlans[index].description = e.target.value; setFormData({...formData, plans: newPlans});
                          }} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Short description..." />
                        </div>
                        
                        <div className="flex gap-4 items-center">
                          <label className="flex items-center text-xs font-bold gap-2"><input type="checkbox" checked={plan.isPopular} onChange={e => {
                            const newPlans = [...formData.plans]; newPlans[index].isPopular = e.target.checked; setFormData({...formData, plans: newPlans});
                          }}/> Is Popular</label>
                          <label className="flex items-center text-xs font-bold gap-2"><input type="checkbox" checked={plan.isBest} onChange={e => {
                            const newPlans = [...formData.plans]; newPlans[index].isBest = e.target.checked; setFormData({...formData, plans: newPlans});
                          }}/> Is Best</label>
                          <div className="flex items-center gap-2 ml-4">
                            <label className="text-xs text-gray-500">Color (Hex):</label>
                            <input value={plan.color} onChange={e => {
                              const newPlans = [...formData.plans]; newPlans[index].color = e.target.value; setFormData({...formData, plans: newPlans});
                            }} className="w-24 px-2 py-1 border rounded text-xs" />
                          </div>
                        </div>

                        <div>
                          <label className="text-xs text-gray-500 flex justify-between">Features <button type="button" onClick={()=>{
                            const newPlans = [...formData.plans]; newPlans[index].features.push(""); setFormData({...formData, plans: newPlans});
                          }} className="text-orange-500">+ Add</button></label>
                          <div className="grid grid-cols-2 gap-2 mt-1">
                            {plan.features.map((feat, fIndex) => (
                              <div key={fIndex} className="flex items-center gap-1">
                                <input value={feat} onChange={e => {
                                  const newPlans = [...formData.plans]; newPlans[index].features[fIndex] = e.target.value; setFormData({...formData, plans: newPlans});
                                }} className="w-full px-2 py-1.5 border rounded-lg text-xs" placeholder="Feature" />
                                <button type="button" onClick={() => {
                                  const newPlans = [...formData.plans]; newPlans[index].features.splice(fIndex, 1); setFormData({...formData, plans: newPlans});
                                }} className="text-red-400 p-1"><FaTimes /></button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* AVAILABILITY TAB */}
                {activeTab === 'availability' && (
                  <div className="space-y-5">
                    <h4 className="font-bold text-gray-700 mb-2">Weekly Availability</h4>
                    <div className="flex flex-wrap gap-2">
                      {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => (
                        <label key={day} className={`cursor-pointer px-4 py-2 border rounded-xl text-sm font-medium transition-all ${formData.availability.days.includes(day) ? 'bg-orange-50 border-orange-500 text-orange-700' : 'bg-white text-gray-500'}`}>
                          <input type="checkbox" className="hidden" checked={formData.availability.days.includes(day)} onChange={e => {
                            const newDays = e.target.checked 
                              ? [...formData.availability.days, day]
                              : formData.availability.days.filter(d => d !== day);
                            setFormData({...formData, availability: {...formData.availability, days: newDays}});
                          }} />
                          {day.substring(0, 3)}
                        </label>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-5 mt-4">
                      <div>
                        <label className="text-sm font-semibold text-gray-600">Start Time</label>
                        <input value={formData.availability.startTime} onChange={e => setFormData({...formData, availability: {...formData.availability, startTime: e.target.value}})} className="w-full px-4 py-2.5 mt-1 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 bg-white transition-all" placeholder="09:00 AM" />
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-gray-600">End Time</label>
                        <input value={formData.availability.endTime} onChange={e => setFormData({...formData, availability: {...formData.availability, endTime: e.target.value}})} className="w-full px-4 py-2.5 mt-1 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 bg-white transition-all" placeholder="09:00 PM" />
                      </div>
                    </div>
                  </div>
                )}
                
              </form>
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
              <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-all shadow-sm">
                Cancel
              </button>
              <button type="submit" form="astrologer-form" className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-md hover:shadow-lg" style={{ background: `linear-gradient(135deg, ${THEME}, ${THEME_DARK})` }}>
                {currentAstrologer ? "Update Astrologer" : "Save Astrologer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
