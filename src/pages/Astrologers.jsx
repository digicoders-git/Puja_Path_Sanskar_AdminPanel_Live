import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { FaUserTie, FaLanguage, FaStar, FaPhoneAlt, FaInbox, FaSearch, FaTimes, FaChevronLeft, FaChevronRight, FaTrash, FaEdit, FaPlus, FaCheckCircle, FaTimesCircle, FaEye, FaUpload, FaCrop, FaUndo, FaSearchPlus, FaSearchMinus, FaRedo } from "react-icons/fa";

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

  // Image Cropper/Adjuster State
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [rawImageSrc, setRawImageSrc] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const cropImageRef = useRef(null);

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
    name: "", specialty: "", phone: "", mobile: "", experience: "", rating: 5, reviews: "0",
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
        phone: astrologer.phone || astrologer.mobile || "",
        mobile: astrologer.mobile || astrologer.phone || "",
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

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        toast.error("Image size must be less than 8MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setRawImageSrc(reader.result);
        setZoom(1);
        setRotation(0);
        setPan({ x: 0, y: 0 });
        setCropModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
    // reset input value so re-selecting same image works
    e.target.value = "";
  };

  const handleOpenAdjustExisting = () => {
    const src = formData.image?.startsWith('data:') ? formData.image : getImageSrc(formData.image);
    if (!src) return;
    setRawImageSrc(src);
    setZoom(1);
    setRotation(0);
    setPan({ x: 0, y: 0 });
    setCropModalOpen(true);
  };

  const handleApplyCroppedImage = () => {
    if (!cropImageRef.current) return;
    const img = cropImageRef.current;
    
    const canvas = document.createElement("canvas");
    const outputSize = 500; // High-res square avatar
    canvas.width = outputSize;
    canvas.height = outputSize;
    const ctx = canvas.getContext("2d");

    // Clear background
    ctx.clearRect(0, 0, outputSize, outputSize);

    // Center transformation
    ctx.translate(outputSize / 2, outputSize / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);
    ctx.translate(pan.x * (outputSize / 280), pan.y * (outputSize / 280));

    // Draw image centered
    const aspect = img.naturalWidth / img.naturalHeight;
    let drawW, drawH;
    if (aspect >= 1) {
      drawH = outputSize;
      drawW = outputSize * aspect;
    } else {
      drawW = outputSize;
      drawH = outputSize / aspect;
    }

    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);

    const croppedDataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setFormData({ ...formData, image: croppedDataUrl });
    setCropModalOpen(false);
    toast.success("Profile photo adjusted & updated!");
  };

  // Dragging handlers for Cropper
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y
      });
    }
  };

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPan({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Clean and sanitize numerical fields before submitting
      const sanitizedPayload = {
        ...formData,
        phone: formData.phone?.trim() || "",
        mobile: formData.phone?.trim() || formData.mobile?.trim() || "",
        fees: Number(formData.fees) || 0,
        rating: Number(formData.rating) || 5,
        plans: (formData.plans || []).map(p => ({
          ...p,
          price: Number(p.price) || 0,
          duration: Number(p.duration) || 0
        }))
      };

      if (currentAstrologer) {
        await fetch(`${BASE}/api/astrologers/${currentAstrologer._id}`, {
          method: "PUT",
          headers: { ...h(), "Content-Type": "application/json" },
          body: JSON.stringify(sanitizedPayload),
        });
        toast.success("Astrologer updated");
      } else {
        await fetch(`${BASE}/api/astrologers`, {
          method: "POST",
          headers: { ...h(), "Content-Type": "application/json" },
          body: JSON.stringify(sanitizedPayload),
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
      a.specialty?.toLowerCase().includes(q) ||
      a.phone?.toLowerCase().includes(q) ||
      a.mobile?.toLowerCase().includes(q)
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
          <button onClick={() => handleOpenModal()} className="px-4 py-2 rounded-xl text-sm font-bold text-white transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer" style={{ background: `linear-gradient(135deg, ${THEME}, ${THEME_DARK})` }}>
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
                        {(a.phone || a.mobile) && (
                          <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5 font-medium">
                            <FaPhoneAlt className="text-[9px] text-blue-500" /> {a.phone || a.mobile}
                          </div>
                        )}
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
                        <button onClick={() => navigate(`/astrologers/view/${a._id}`)} title="View" className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:shadow-md hover:scale-110 cursor-pointer" style={{ backgroundColor: "#e0f2fe", color: "#0284c7" }}>
                          <FaEye className="text-sm" />
                        </button>
                        <button onClick={() => handleOpenModal(a)} title="Edit" className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:shadow-md hover:scale-110 cursor-pointer" style={{ backgroundColor: THEME_LIGHT, color: THEME }}>
                          <FaEdit className="text-sm" />
                        </button>
                        <button onClick={() => handleDelete(a._id)} title="Delete" className="w-8 h-8 rounded-full flex items-center justify-center bg-red-50 text-red-500 transition-all hover:shadow-md hover:scale-110 cursor-pointer">
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
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 disabled:opacity-30 hover:bg-gray-50 transition-all cursor-pointer">
                  <FaChevronLeft className="text-xs" />
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => setCurrentPage(p)} className="w-9 h-9 flex items-center justify-center rounded-lg border text-sm font-medium transition-all cursor-pointer" style={currentPage === p ? { backgroundColor: THEME, borderColor: THEME, color: "white" } : { borderColor: "#e5e7eb", color: "#6b7280" }}>
                      {p}
                    </button>
                  ))}
                </div>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 disabled:opacity-30 hover:bg-gray-50 transition-all cursor-pointer">
                  <FaChevronRight className="text-xs" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100" style={{ backgroundColor: THEME_LIGHT }}>
              <h3 className="text-lg font-bold" style={{ color: THEME_DARK }}>
                {currentAstrologer ? "Edit Astrologer" : "Add Astrologer"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-gray-400 hover:text-red-500 shadow-sm transition-all hover:scale-105 cursor-pointer">
                <FaTimes />
              </button>
            </div>

            <div className="flex border-b border-gray-100 bg-gray-50 px-6 pt-3 gap-6">
              {['basic', 'services', 'plans', 'availability'].map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 text-sm font-bold border-b-2 transition-all capitalize cursor-pointer ${activeTab === tab ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
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
                      <label className="text-sm font-semibold text-gray-600 flex items-center gap-1.5">
                        <FaPhoneAlt className="text-xs text-orange-600" /> Phone Number (कॉलिंग नंबर) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone || ""}
                        onChange={e => {
                          const val = e.target.value.replace(/[^0-9+]/g, '');
                          setFormData({ ...formData, phone: val, mobile: val });
                        }}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 bg-white transition-all"
                        style={{ "--tw-ring-color": THEME_LIGHT, borderColor: formData.phone ? THEME : "" }}
                        placeholder="e.g. 9876543210"
                      />
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
                      <input type="number" required value={formData.fees === '' ? '' : formData.fees} onChange={e => setFormData({...formData, fees: e.target.value === '' ? '' : e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 bg-white transition-all" style={{ "--tw-ring-color": THEME_LIGHT }} placeholder="e.g. 151" />
                    </div>
                    
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-sm font-semibold text-gray-600">Bio</label>
                      <textarea value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 bg-white transition-all" rows="3" style={{ "--tw-ring-color": THEME_LIGHT }} placeholder="10+ years of experience in Vedic Astrology..." />
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-600">Rating (Out of 5)</label>
                      <input type="number" step="0.1" value={formData.rating === '' ? '' : formData.rating} onChange={e => setFormData({...formData, rating: e.target.value === '' ? '' : e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 bg-white transition-all" style={{ "--tw-ring-color": THEME_LIGHT }} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-600">Reviews Count</label>
                      <input value={formData.reviews} onChange={e => setFormData({...formData, reviews: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 bg-white transition-all" style={{ "--tw-ring-color": THEME_LIGHT }} placeholder="e.g. 2.1k" />
                    </div>

                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-sm font-semibold text-gray-600">Profile Photo</label>
                      <div className="flex flex-col sm:flex-row items-center gap-4 p-3 bg-white border border-gray-200 rounded-xl">
                        <div className="relative w-20 h-20 rounded-full border-2 border-orange-300 bg-orange-50 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-inner">
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
                            className="w-full h-full rounded-full flex items-center justify-center font-bold text-xl text-orange-600 bg-orange-100"
                            style={{ display: formData.image ? 'none' : 'flex' }}
                          >
                            {(formData.name || 'A')[0].toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 w-full space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <label className="flex items-center gap-2 px-3 py-2 rounded-lg border border-orange-400 bg-orange-50 text-orange-700 text-xs font-bold cursor-pointer hover:bg-orange-100 transition-all shadow-sm">
                              <FaUpload /> Choose & Adjust Photo
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileSelect}
                              />
                            </label>
                            {formData.image && (
                              <button
                                type="button"
                                onClick={handleOpenAdjustExisting}
                                className="flex items-center gap-1 px-3 py-2 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 text-xs font-bold cursor-pointer hover:bg-blue-100 transition-all shadow-sm"
                              >
                                <FaCrop /> Adjust / Crop
                              </button>
                            )}
                            {formData.image && (
                              <button
                                type="button"
                                onClick={() => setFormData({ ...formData, image: "" })}
                                className="text-xs text-red-500 hover:text-red-700 font-semibold px-2 py-1 cursor-pointer"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                          <input
                            value={formData.image?.startsWith('data:') ? '(Custom cropped photo uploaded)' : formData.image}
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
                        <input type="checkbox" checked={formData.isVerified} onChange={e => setFormData({...formData, isVerified: e.target.checked})} className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500 cursor-pointer" />
                        <span className="ml-2 text-sm text-gray-700">Yes, show verification badge</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-semibold text-gray-600">Status</label>
                      <div className="flex gap-4 mt-1">
                        <label className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border cursor-pointer transition-all ${formData.status === 'online' ? 'bg-green-50 border-green-500 text-green-700 font-bold' : 'bg-white border-gray-200 text-gray-500'}`}>
                          <input type="radio" name="status" value="online" checked={formData.status === 'online'} onChange={e => setFormData({...formData, status: e.target.value})} className="hidden" />
                          <div className={`w-3 h-3 rounded-full ${formData.status === 'online' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <span className="text-sm">Online</span>
                        </label>
                        <label className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border cursor-pointer transition-all ${formData.status === 'offline' ? 'bg-gray-100 border-gray-400 text-gray-700 font-bold' : 'bg-white border-gray-200 text-gray-500'}`}>
                          <input type="radio" name="status" value="offline" checked={formData.status === 'offline'} onChange={e => setFormData({...formData, status: e.target.value})} className="hidden" />
                          <div className={`w-3 h-3 rounded-full ${formData.status === 'offline' ? 'bg-gray-500' : 'bg-gray-300'}`}></div>
                          <span className="text-sm">Offline</span>
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
                      <button type="button" onClick={() => setFormData({...formData, services: [...formData.services, { name: "", icon: "✨" }]})} className="text-xs px-3 py-1.5 rounded-lg bg-orange-100 text-orange-700 font-bold hover:bg-orange-200 cursor-pointer">+ Add Service</button>
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
                        }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"><FaTrash /></button>
                      </div>
                    ))}
                    
                    <h4 className="font-bold text-gray-700 mt-8 mb-2 border-t pt-6">Consultation Modes</h4>
                    <div className="flex gap-4">
                      {["Chat", "Voice Call", "Video Call"].map(mode => (
                        <label key={mode} className="flex items-center gap-2 cursor-pointer bg-white px-4 py-2 border rounded-xl">
                          <input type="checkbox" checked={formData.consultationModes.includes(mode)} onChange={e => {
                            if (e.target.checked) setFormData({...formData, consultationModes: [...formData.consultationModes, mode]});
                            else setFormData({...formData, consultationModes: formData.consultationModes.filter(m => m !== mode)});
                          }} className="w-4 h-4 text-orange-500 rounded cursor-pointer" />
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
                      <button type="button" onClick={() => setFormData({...formData, plans: [...formData.plans, { title: "नया प्लान", duration: 10, price: 100, description: "", features: [""], isPopular: false, isBest: false, color: "#E65100" }]})} className="text-xs px-3 py-1.5 rounded-lg bg-orange-100 text-orange-700 font-bold hover:bg-orange-200 cursor-pointer">+ Add Plan</button>
                    </div>
                    {formData.plans.map((plan, index) => (
                      <div key={index} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative space-y-4">
                        <button type="button" onClick={() => {
                          const newPlans = formData.plans.filter((_, i) => i !== index);
                          setFormData({...formData, plans: newPlans});
                        }} className="absolute top-4 right-4 p-2 text-red-500 hover:bg-red-50 rounded-lg text-xs cursor-pointer"><FaTrash /></button>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pr-10">
                          <div>
                            <label className="text-xs text-gray-500">Title</label>
                            <input value={plan.title} onChange={e => {
                              const newPlans = [...formData.plans]; newPlans[index].title = e.target.value; setFormData({...formData, plans: newPlans});
                            }} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Plan Title" />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500">Duration (Mins)</label>
                            <input type="number" value={plan.duration === '' ? '' : plan.duration} onChange={e => {
                              const val = e.target.value;
                              const newPlans = [...formData.plans]; 
                              newPlans[index].duration = val === '' ? '' : val; 
                              setFormData({...formData, plans: newPlans});
                            }} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="10" />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500">Price (₹)</label>
                            <input type="number" value={plan.price === '' ? '' : plan.price} onChange={e => {
                              const val = e.target.value;
                              const newPlans = [...formData.plans]; 
                              newPlans[index].price = val === '' ? '' : val; 
                              setFormData({...formData, plans: newPlans});
                            }} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="151" />
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-xs text-gray-500">Description</label>
                          <input value={plan.description} onChange={e => {
                            const newPlans = [...formData.plans]; newPlans[index].description = e.target.value; setFormData({...formData, plans: newPlans});
                          }} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Short description..." />
                        </div>
                        
                        <div className="flex gap-4 items-center">
                          <label className="flex items-center text-xs font-bold gap-2 cursor-pointer"><input type="checkbox" checked={plan.isPopular} onChange={e => {
                            const newPlans = [...formData.plans]; newPlans[index].isPopular = e.target.checked; setFormData({...formData, plans: newPlans});
                          }} className="cursor-pointer"/> Is Popular</label>
                          <label className="flex items-center text-xs font-bold gap-2 cursor-pointer"><input type="checkbox" checked={plan.isBest} onChange={e => {
                            const newPlans = [...formData.plans]; newPlans[index].isBest = e.target.checked; setFormData({...formData, plans: newPlans});
                          }} className="cursor-pointer"/> Is Best</label>
                          <div className="flex items-center gap-2 ml-4">
                            <label className="text-xs text-gray-500">Color (Hex):</label>
                            <input value={plan.color} onChange={e => {
                              const newPlans = [...formData.plans]; newPlans[index].color = e.target.value; setFormData({...formData, plans: newPlans});
                            }} className="w-24 px-2 py-1 border rounded text-xs uppercase" />
                          </div>
                        </div>

                        <div>
                          <label className="text-xs text-gray-500 flex justify-between">Features <button type="button" onClick={()=>{
                            const newPlans = [...formData.plans]; newPlans[index].features.push(""); setFormData({...formData, plans: newPlans});
                          }} className="text-orange-500 font-bold cursor-pointer">+ Add</button></label>
                          <div className="grid grid-cols-2 gap-2 mt-1">
                            {plan.features.map((feat, fIndex) => (
                              <div key={fIndex} className="flex items-center gap-1">
                                <input value={feat} onChange={e => {
                                  const newPlans = [...formData.plans]; newPlans[index].features[fIndex] = e.target.value; setFormData({...formData, plans: newPlans});
                                }} className="w-full px-2 py-1.5 border rounded-lg text-xs" placeholder="Feature" />
                                <button type="button" onClick={() => {
                                  const newPlans = [...formData.plans]; newPlans[index].features.splice(fIndex, 1); setFormData({...formData, plans: newPlans});
                                }} className="text-red-400 p-1 cursor-pointer"><FaTimes /></button>
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
              <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-all shadow-sm cursor-pointer">
                Cancel
              </button>
              <button type="submit" form="astrologer-form" className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-md hover:shadow-lg cursor-pointer" style={{ background: `linear-gradient(135deg, ${THEME}, ${THEME_DARK})` }}>
                {currentAstrologer ? "Update Astrologer" : "Save Astrologer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IMAGE ADJUST / CROP MODAL */}
      {cropModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-gray-100" style={{ backgroundColor: THEME_LIGHT }}>
              <div className="flex items-center gap-2">
                <FaCrop className="text-orange-600" />
                <h3 className="text-base font-bold" style={{ color: THEME_DARK }}>
                  Adjust Profile Photo
                </h3>
              </div>
              <button onClick={() => setCropModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-gray-400 hover:text-red-500 shadow-sm transition-all cursor-pointer">
                <FaTimes />
              </button>
            </div>

            <div className="p-6 flex flex-col items-center bg-gray-50/50">
              <p className="text-xs text-gray-500 mb-3 text-center">
                Drag to pan • Use controls below to zoom and rotate for a perfect circular fit
              </p>

              {/* Viewport Area with circular crop overlay */}
              <div
                className="relative w-64 h-64 sm:w-72 sm:h-72 bg-gray-900 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center cursor-grab active:cursor-grabbing border-2 border-orange-200 select-none"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleMouseUp}
              >
                {/* Circular Mask Overlay */}
                <div className="absolute inset-0 pointer-events-none rounded-full border-[3px] border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.55)] z-20" />
                
                {/* Crosshair guidelines */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10 opacity-30">
                  <div className="w-full h-px bg-white border-dashed" />
                </div>
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10 opacity-30">
                  <div className="h-full w-px bg-white border-dashed" />
                </div>

                {rawImageSrc && (
                  <img
                    ref={cropImageRef}
                    src={rawImageSrc}
                    alt="Crop preview"
                    crossOrigin="anonymous"
                    className="max-w-none transition-transform duration-75 select-none pointer-events-none"
                    style={{
                      transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                      transformOrigin: 'center center'
                    }}
                    draggable={false}
                  />
                )}
              </div>

              {/* Zoom Controls */}
              <div className="w-full max-w-xs mt-5 space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-gray-600">
                    <span className="flex items-center gap-1"><FaSearchMinus className="text-gray-400" /> Zoom</span>
                    <span>{Math.round(zoom * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.05"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-full accent-orange-500 cursor-pointer"
                  />
                </div>

                {/* Quick Action Buttons */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setRotation((r) => (r - 90) % 360)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-all cursor-pointer shadow-sm"
                  >
                    <FaUndo className="text-[10px]" /> -90°
                  </button>
                  <button
                    type="button"
                    onClick={() => setRotation((r) => (r + 90) % 360)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-all cursor-pointer shadow-sm"
                  >
                    <FaRedo className="text-[10px]" /> +90°
                  </button>
                  <button
                    type="button"
                    onClick={() => { setZoom(1); setRotation(0); setPan({ x: 0, y: 0 }); }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-gray-100 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-200 transition-all cursor-pointer"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-white">
              <button
                type="button"
                onClick={() => setCropModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyCroppedImage}
                className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold text-white transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer"
                style={{ background: `linear-gradient(135deg, ${THEME}, ${THEME_DARK})` }}
              >
                <FaCheckCircle /> Crop & Set Photo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

