import { useEffect, useState, useRef } from "react";
import { useGooglePlacesAutocomplete } from "../hooks/useGooglePlacesAutocomplete";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import {
  getAllPandits, createPandit, updatePandit,
  deletePandit, togglePandit, getEnums,
} from "../services/panditService";
import { getAllPujas } from "../services/pujaService";
import { 
  FaEye, FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaPlus, 
  FaWhatsapp, FaTimes, FaSearch, FaInbox, FaVideo, FaImage, 
  FaCheckCircle, FaUserCircle, FaPhoneAlt, FaFileAlt, FaTag, FaEnvelope, FaStar
} from "react-icons/fa";
import PanditCharts from "../components/PanditCharts";

const THEME = "#E8621A";
const THEME_LIGHT = "#fff4ee";
const THEME_DARK = "#c9541a";

const EMPTY = {
  // --- Step 1: 14 Important Points ---
  fullName: "", mobileNumber: "", whatsappNumber: "",
  state: "", city: "", district: "",
  experience: "", specializations: [], languages: [],
  idProof: null, profilePhoto: null,
  serviceArea: "", samagriArrangement: "",
  bankUpiDetails: "", samagriExperience: "",
  travelAvailability: "", liveEventExperience: [],

  // --- Step 2: Verification & Media (Optional) ---
  introVideo: null, pujaPhotos: [], pujaVideoClips: [],
  traditionalDress: "", audioClarity: "", mediaPermission: "",
  alternateNumber: "", emailId: "", dob: "", gender: "",
  currentAddress: "", permanentAddress: "", pincode: "",
  aadharNumber: "", panCard: "", trainingGurukul: "",
  basicPujaCharges: "", akhandPathCharges: "", perDayCharges: "", travelCharges: "",
  mantraLevel: "", timeDiscipline: "", dressCode: "", eventHandling: "",
  bhajanKirtan: false, astrology: false, vastu: false, havan: false, corporateExperience: false,
  availableCities: [], travelWillingness: "", maxDistance: "",
  availabilityType: "", availableDays: [], emergencyBooking: "",
  bankDetails: "", declaration: false,
  selectedPujas: [],
};

const STEPS = ["Basic & Address", "Identity & Media", "Experience & Pricing", "Skills & Quality", "Logistics & Payment"];

const inputCls = "w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-orange-400 bg-white text-gray-700";
const labelCls = "block text-xs font-semibold text-gray-500 mb-1";

const SelectField = ({ name, label, options = [], value, onChange }) => (
  <div>
    <label className={labelCls}>{label}</label>
    <select name={name} value={value} onChange={onChange} className={inputCls}>
      <option value="">Select {label}</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

const InputField = ({ name, label, type = "text", placeholder, value, onChange, ref }) => (
  <div>
    <label className={labelCls}>{label}</label>
    <input ref={ref} type={type} name={name} value={value} onChange={onChange}
      placeholder={placeholder} className={inputCls} />
  </div>
);

const CheckField = ({ name, label, checked, onChange }) => (
  <label className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${checked ? "border-orange-400 bg-orange-50" : "border-gray-200 bg-white"}`}>
    <input type="checkbox" name={name} checked={checked} onChange={onChange} className="hidden" />
    <div className={`w-4 h-4 rounded flex items-center justify-center ${checked ? "bg-orange-500" : "bg-gray-200"}`}>
      {checked && <span className="text-white text-xs">✓</span>}
    </div>
    <span className={`text-xs font-semibold ${checked ? "text-orange-600" : "text-gray-500"}`}>{label}</span>
  </label>
);

const FilePreview = ({ file, existingPath, type = "image", onRemove }) => {
  let url = "";
  if (file) url = URL.createObjectURL(file);
  else if (existingPath) url = existingPath;

  if (!url) return null;

  return (
    <div className="relative mt-2 group w-full max-w-[150px]">
      <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-gray-50 aspect-video flex items-center justify-center">
        {type === "image" ? (
          <img src={url} alt="preview" className="w-full h-full object-cover" />
        ) : (
          <video src={url} className="w-full h-full object-cover" />
        )}
      </div>
      {file && (
        <button 
          type="button" 
          onClick={onRemove}
          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] shadow-lg"
        >✕</button>
      )}
    </div>
  );
};

export default function PanditPage() {
  const { token } = useAuth();
  const [pandits, setPandits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enums, setEnums] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [aadharImageFile, setAadharImageFile] = useState(null);
  const [introVideoFile, setIntroVideoFile] = useState(null);
  const [pujaPhotosFiles, setPujaPhotosFiles] = useState([]);
  const [pujaVideoClipsFiles, setPujaVideoClipsFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [viewData, setViewData] = useState(null);
  const [step, setStep] = useState(1);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;
  const [pujasList, setPujasList] = useState([]);
  
  const { inputRef: addressInputRef, place: selectedPlace } = useGooglePlacesAutocomplete();

  useEffect(() => {
    if (selectedPlace.address) {
      setForm((prev) => ({
        ...prev,
        currentAddress: selectedPlace.address,
        latitude: selectedPlace.lat,
        longitude: selectedPlace.lng,
      }));
    }
  }, [selectedPlace]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [data, enumData, pujasData] = await Promise.all([getAllPandits(token), getEnums(), getAllPujas()]);
      setPandits(Array.isArray(data) ? data : []);
      setEnums(enumData);
      setPujasList(Array.isArray(pujasData) ? pujasData : []);
    } catch (err) {
      toast.error("Failed to fetch data");
    }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const openCreate = () => {
    setEditData(null); setForm(EMPTY);
    setProfilePhotoFile(null); setAadharImageFile(null); setIntroVideoFile(null); setPujaPhotosFiles([]); setPujaVideoClipsFiles([]);
    setStep(1); setShowModal(true);
  };

  const openEdit = (p) => {
    setEditData(p);
    setForm({
      ...EMPTY, ...p,
      selectedPujas: p.selectedPujas ? p.selectedPujas.map((s) => ({
        puja: s.puja?._id || s.puja || s,
        price: s.price || 0
      })) : [],
    });
    setProfilePhotoFile(null); setAadharImageFile(null); setIntroVideoFile(null); setPujaPhotosFiles([]); setPujaVideoClipsFiles([]);
    setStep(1); setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step < 5) { setStep((s) => s + 1); return; }
    setSubmitting(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (Array.isArray(v)) {
        // Special handling for selectedPujas and other arrays
        fd.append(k, JSON.stringify(v));
      } else if (v !== null && v !== undefined) {
        fd.append(k, v);
      }
    });

    // Files
    if (profilePhotoFile) fd.append("profilePhoto", profilePhotoFile);
    if (aadharImageFile) fd.append("idProof", aadharImageFile);
    if (introVideoFile) fd.append("introVideo", introVideoFile);
    pujaPhotosFiles.forEach((f) => fd.append("pujaPhotos", f));
    pujaVideoClipsFiles.forEach((f) => fd.append("pujaVideoClips", f));

    const res = editData
      ? await updatePandit(token, editData._id, fd)
      : await createPandit(token, fd);

    if (res._id || res.fullName) {
      toast.success(editData ? "Pandit updated!" : "Pandit created!");
      setShowModal(false); fetchAll();
    } else {
      toast.error(res.message || "Something went wrong");
    }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    const res = await deletePandit(token, deleteId);
    if (res.message) {
      toast.success("Pandit deleted!");
      setPandits(pandits.filter(p => p._id !== deleteId));
      setDeleteId(null);
    }
    else toast.error("Delete failed");
  };

  const handleToggle = async (id) => {
    const res = await togglePandit(token, id);
    if (res.message) {
      toast.success(res.message);
      setPandits(pandits.map(p => p._id === id ? { ...p, isActive: !p.isActive } : p));
    }
  };

  const handleWhatsApp = (p) => {
    const num = p.whatsappNumber || p.mobileNumber;
    const msg = `🙏 नमस्कार पंडित जी 🙏...`;
    window.open(`https://wa.me/91${num}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const handleSearch = (val) => { setSearch(val); setCurrentPage(1); };

  const filtered = pandits.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.fullName?.toLowerCase().includes(q) ||
      p.emailId?.toLowerCase().includes(q) ||
      p.mobileNumber?.toLowerCase().includes(q) ||
      p.specialization?.toLowerCase().includes(q) ||
      p.city?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="min-h-screen p-3 sm:p-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Pandit Management</h2>
          <p className="text-xs text-gray-400 mt-0.5">Manage all registered pandits</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-md"
          style={{ backgroundColor: THEME }}>
          <FaPlus /> Add Pandit
        </button>
      </div>

      {/* Charts */}
      {!loading && pandits.length > 0 && <PanditCharts pandits={pandits} />}

      {/* Search */}
      <div className="mb-4">
        <input type="text" value={search}
          placeholder="Search by name, email, phone, city, specialization..."
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none bg-white text-gray-700"
          onFocus={(e) => e.target.style.borderColor = THEME}
          onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
          onChange={(e) => handleSearch(e.target.value)} />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-32">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2" style={{ borderColor: THEME }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">No pandits found</div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm bg-white">
          <table className="w-full text-sm min-w-[2200px]">
            <thead>
              <tr style={{ background: `linear-gradient(135deg, ${THEME}, #c9541a)` }}>
                {["#", "Pandit Info", "Contact", "Location", "Specializations", "Exp.", "Languages", "Service Details", "Media", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3.5 text-left text-xs font-bold text-white whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((p, i) => (
                <tr key={p._id} className="border-t border-gray-50 hover:bg-orange-50 transition-colors">
                  <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{(currentPage - 1) * PAGE_SIZE + i + 1}</td>
                  
                  {/* Pandit Info */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 border-2 border-white shadow-sm overflow-hidden flex-shrink-0">
                        {p.profilePhoto 
                          ? <img src={p.profilePhoto} className="w-full h-full object-cover" /> 
                          : <FaUserCircle className="w-full h-full text-gray-300" />}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-sm leading-tight">{p.fullName}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{p.gender} • {p.dob || "N/A"}</p>
                      </div>
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-gray-700 flex items-center gap-1.5"><FaPhoneAlt className="text-[10px] text-blue-500" /> {p.mobileNumber}</p>
                      {p.whatsappNumber && <p className="text-xs font-bold text-gray-500 flex items-center gap-1.5"><FaWhatsapp className="text-[10px] text-green-500" /> {p.whatsappNumber}</p>}
                    </div>
                  </td>

                  {/* Location */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <p className="text-xs font-bold text-gray-700">{p.city}</p>
                    <p className="text-[10px] text-gray-400 font-bold">{p.state}</p>
                  </td>

                  {/* Specializations */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {(Array.isArray(p.specializations) ? p.specializations : [p.specialization]).filter(Boolean).slice(0, 2).map((s, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-orange-100 text-orange-600 border border-orange-200">{s}</span>
                      ))}
                      {(p.specializations?.length > 2) && <span className="text-[9px] text-gray-400 font-bold">+{p.specializations.length - 2}</span>}
                    </div>
                  </td>

                  {/* Exp */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-xs font-black text-gray-700">{p.experience || p.totalExperience || "—"}</span>
                  </td>

                  {/* Languages */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <p className="text-[10px] font-bold text-gray-600 uppercase tracking-tighter">
                      {Array.isArray(p.languages) ? p.languages.join(", ") : p.languagesKnown || "—"}
                    </p>
                  </td>

                  {/* Service Details */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-black uppercase text-gray-400">Pujas:</span>
                        <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 rounded">{p.selectedPujas?.length || 0} Listed</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-black uppercase text-gray-400">Travel:</span>
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 rounded">{p.serviceArea || "—"}</span>
                      </div>
                    </div>
                  </td>

                  {/* Media */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex gap-2 text-gray-300">
                      <FaVideo className={p.introVideo ? "text-orange-500" : ""} title="Intro Video" />
                      <FaImage className={p.pujaPhotos?.length > 0 ? "text-blue-500" : ""} title="Puja Photos" />
                      <FaFileAlt className={p.idProof ? "text-green-500" : ""} title="ID Proof" />
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <button onClick={() => handleToggle(p._id)}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all"
                      style={{ backgroundColor: p.isActive ? "#16a34a15" : "#dc262615", color: p.isActive ? "#16a34a" : "#dc2626", border: `1px solid ${p.isActive ? "#16a34a30" : "#dc262630"}` }}>
                      <div className={`w-1.5 h-1.5 rounded-full ${p.isActive ? "bg-green-500" : "bg-red-500"}`} />
                      {p.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex gap-1.5">
                      <button onClick={() => setViewData(p)} title="View Full Details"
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110 shadow-sm border border-orange-100"
                        style={{ backgroundColor: THEME_LIGHT, color: THEME }}>
                        <FaEye className="text-sm" />
                      </button>
                      <button onClick={() => openEdit(p)} title="Edit"
                        className="w-8 h-8 rounded-lg flex items-center justify-center border border-orange-100 transition-all hover:scale-110 shadow-sm"
                        style={{ borderColor: "#f97316", color: "#f97316", backgroundColor: "#fff7ed" }}>
                        <FaEdit className="text-sm" />
                      </button>
                      <button onClick={() => setDeleteId(p._id)} title="Delete"
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110 shadow-sm border border-red-50"
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

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-1">
          <p className="text-xs text-gray-400">
            Showing <span className="font-semibold text-gray-600">{(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)}</span> of <span className="font-semibold text-gray-600">{filtered.length}</span> pandits
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all disabled:opacity-30"
              style={{ backgroundColor: currentPage === 1 ? "#f3f4f6" : THEME_LIGHT, color: currentPage === 1 ? "#9ca3af" : THEME }}
            >‹</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
              .reduce((acc, p, idx, arr) => {
                if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
                acc.push(p);
                return acc;
              }, [])
              .map((p, idx) =>
                p === "..." ? (
                  <span key={`dots-${idx}`} className="w-8 h-8 flex items-center justify-center text-xs text-gray-400">…</span>
                ) : (
                  <button key={p} onClick={() => setCurrentPage(p)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all"
                    style={{ backgroundColor: currentPage === p ? THEME : "#f9fafb", color: currentPage === p ? "#fff" : "#374151", border: currentPage === p ? "none" : "1px solid #e5e7eb" }}
                  >{p}</button>
                )
              )}
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all disabled:opacity-30"
              style={{ backgroundColor: currentPage === totalPages ? "#f3f4f6" : THEME_LIGHT, color: currentPage === totalPages ? "#9ca3af" : THEME }}
            >›</button>
          </div>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            <div className="px-6 py-4 flex items-center justify-between flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${THEME}, #c9541a)` }}>
              <h3 className="text-base font-bold text-white">{editData ? "Edit Pandit" : "Add Pandit"}</h3>
              <button onClick={() => setShowModal(false)} className="text-white text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20">✕</button>
            </div>

            <div className="px-6 pt-4 flex-shrink-0">
              <div className="flex items-center gap-1">
                {STEPS.map((s, i) => (
                  <div key={i} className="flex items-center flex-1 last:flex-none">
                    <div onClick={() => i + 1 <= step && setStep(i + 1)}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold cursor-pointer transition-all"
                      style={{ backgroundColor: step > i ? THEME : step === i + 1 ? THEME : "#e5e7eb", color: step >= i + 1 ? "white" : "#9ca3af" }}>
                      {step > i + 1 ? "✓" : i + 1}
                    </div>
                    {i < 4 && <div className="flex-1 h-0.5 mx-1 rounded" style={{ backgroundColor: step > i + 1 ? THEME : "#e5e7eb" }} />}
                  </div>
                ))}
              </div>
              <p className="text-xs font-semibold mt-2 mb-3" style={{ color: THEME }}>Step {step}: {STEPS[step - 1]}</p>
            </div>

            <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 pb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {step === 1 && (<>
                  <InputField name="fullName" label="1. Full Name" placeholder="Name" value={form.fullName} onChange={handleChange} />
                  <InputField name="mobileNumber" label="2. Mobile Number" placeholder="10 Digit" value={form.mobileNumber} onChange={handleChange} />
                  <InputField name="whatsappNumber" label="WhatsApp Number" placeholder="Optional" value={form.whatsappNumber} onChange={handleChange} />
                  <InputField name="state" label="3. State" value={form.state} onChange={handleChange} />
                  <InputField name="city" label="City" value={form.city} onChange={handleChange} />
                  <InputField name="district" label="District" value={form.district} onChange={handleChange} />
                  <SelectField name="experience" label="4. Experience" options={["1–3 Years", "3–7 Years", "7+ Years"]} value={form.experience} onChange={handleChange} />
                  
                  <div className="sm:col-span-2 group">
                    <label className={labelCls}>5. Specialization (Select multiple)</label>
                    <div className="flex flex-wrap gap-2 p-3 border rounded-xl bg-gray-50">
                      {["Grih Pravesh", "Vivah", "Satyanarayan Katha", "Rudrabhishek", "Sunderkand", "Jagran", "Bhagwat Katha"].map(s => (
                        <button key={s} type="button" onClick={() => {
                          const current = form.specializations || [];
                          const updated = current.includes(s) ? current.filter(v => v !== s) : [...current, s];
                          setForm(prev => ({ ...prev, specializations: updated }));
                        }} className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all ${form.specializations?.includes(s) ? "bg-[#e8621a] text-white border-[#e8621a]" : "bg-white text-gray-500 border-gray-200"}`}>{s}</button>
                      ))}
                    </div>
                  </div>

                  <div className="sm:col-span-2 group">
                    <label className={labelCls}>6. Languages Known</label>
                    <div className="flex flex-wrap gap-2 p-3 border rounded-xl bg-gray-50">
                      {["Hindi", "Sanskrit", "English", "Others"].map(l => (
                        <button key={l} type="button" onClick={() => {
                          const current = form.languages || [];
                          const updated = current.includes(l) ? current.filter(v => v !== l) : [...current, l];
                          setForm(prev => ({ ...prev, languages: updated }));
                        }} className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all ${form.languages?.includes(l) ? "bg-gray-800 text-white border-gray-800" : "bg-white text-gray-400 border-gray-100"}`}>{l}</button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className={labelCls}>7. ID Proof Upload</label>
                    <input type="file" onChange={(e) => setAadharImageFile(e.target.files[0])} className={inputCls} accept="image/*" />
                    <FilePreview file={aadharImageFile} existingPath={form.idProof} onRemove={() => setAadharImageFile(null)} />
                  </div>
                  <div>
                    <label className={labelCls}>8. Photo Upload</label>
                    <input type="file" onChange={(e) => setProfilePhotoFile(e.target.files[0])} className={inputCls} accept="image/*" />
                    <FilePreview file={profilePhotoFile} existingPath={form.profilePhoto} onRemove={() => setProfilePhotoFile(null)} />
                  </div>

                  <SelectField name="serviceArea" label="9. Service Area" options={["Within 10 km", "Entire City", "Nearby Districts"]} value={form.serviceArea} onChange={handleChange} />
                  <SelectField name="samagriArrangement" label="10. Samagri Arrangement" options={["Yes", "No"]} value={form.samagriArrangement} onChange={handleChange} />
                  <InputField name="bankUpiDetails" label="11. Bank / UPI Details (Optional)" placeholder="UPI ID" value={form.bankUpiDetails} onChange={handleChange} />
                  <SelectField name="samagriExperience" label="12. Puja Kit / Experience" options={["Basic Setup", "Full Setup", "No"]} value={form.samagriExperience} onChange={handleChange} />
                  <SelectField name="travelAvailability" label="13. Travel Availability" options={["Only Local Area", "Entire District", "Other States Also"]} value={form.travelAvailability} onChange={handleChange} />

                  <div className="sm:col-span-2 group">
                    <label className={labelCls}>14. Live Event Experience</label>
                    <div className="flex flex-wrap gap-2 p-3 border rounded-xl bg-gray-50">
                      {["Jagran", "Bhagwat Katha", "Corporate Puja", "Mandir Event"].map(e => (
                        <button key={e} type="button" onClick={() => {
                          const current = form.liveEventExperience || [];
                          const updated = current.includes(e) ? current.filter(v => v !== e) : [...current, e];
                          setForm(prev => ({ ...prev, liveEventExperience: updated }));
                        }} className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all ${form.liveEventExperience?.includes(e) ? "bg-[#e8621a] text-white border-[#e8621a]" : "bg-white text-gray-500 border-gray-200"}`}>{e}</button>
                      ))}
                    </div>
                  </div>
                </>)}

                {step === 2 && (<>
                  <div className="sm:col-span-2 bg-orange-50 p-4 rounded-xl border border-orange-100 mb-2">
                    <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">Media Uploads (Optional)</p>
                  </div>
                  <div>
                    <label className={labelCls}>Intro Video Upload</label>
                    <input type="file" onChange={(e) => setIntroVideoFile(e.target.files[0])} className={inputCls} accept="video/*" />
                    <FilePreview file={introVideoFile} existingPath={form.introVideo} type="video" onRemove={() => setIntroVideoFile(null)} />
                  </div>
                  <div>
                    <label className={labelCls}>Puja Photos (Multiple)</label>
                    <input type="file" multiple onChange={(e) => setPujaPhotosFiles(Array.from(e.target.files))} className={inputCls} accept="image/*" />
                    <div className="flex flex-wrap gap-2 mt-2">
                      {form.pujaPhotos?.map((p, idx) => (
                        <div key={`existing-${idx}`} className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200">
                          <img src={p} className="w-full h-full object-cover" />
                        </div>
                      ))}
                      {pujaPhotosFiles.map((f, idx) => (
                        <div key={`new-${idx}`} className="w-12 h-12 rounded-lg overflow-hidden border border-orange-200 relative group">
                          <img src={URL.createObjectURL(f)} className="w-full h-full object-cover" />
                          <button type="button" onClick={() => setPujaPhotosFiles(prev => prev.filter((_, i) => i !== idx))}
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[8px]">✕</button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Puja Video Clips (Multiple)</label>
                    <input type="file" multiple onChange={(e) => setPujaVideoClipsFiles(Array.from(e.target.files))} className={inputCls} accept="video/*" />
                    <div className="flex flex-wrap gap-2 mt-2">
                      {form.pujaVideoClips?.map((v, idx) => (
                        <div key={`existing-vid-${idx}`} className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 bg-black flex items-center justify-center">
                          <FaVideo className="text-white/40 text-[10px]" />
                        </div>
                      ))}
                      {pujaVideoClipsFiles.map((f, idx) => (
                        <div key={`new-vid-${idx}`} className="w-12 h-12 rounded-lg overflow-hidden border border-orange-200 bg-black relative group flex items-center justify-center">
                          <video src={URL.createObjectURL(f)} className="w-full h-full object-cover" />
                          <button type="button" onClick={() => setPujaVideoClipsFiles(prev => prev.filter((_, i) => i !== idx))}
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[8px]">✕</button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <SelectField name="traditionalDress" label="Traditional Dress Confirmation" options={["Yes", "Sometimes", "No"]} value={form.traditionalDress} onChange={handleChange} />
                  <SelectField name="audioClarity" label="Audio Clarity Confirmation" options={["Yes", "Average", "Professional Level"]} value={form.audioClarity} onChange={handleChange} />
                  
                  <div className="sm:col-span-2 h-px bg-gray-100 my-2" />
                  
                  <InputField name="alternateNumber" label="Alternate Number" value={form.alternateNumber} onChange={handleChange} />
                  <InputField name="emailId" label="Email ID" type="email" value={form.emailId} onChange={handleChange} />
                  <InputField name="dob" label="Date of Birth" type="date" value={form.dob} onChange={handleChange} />
                  <SelectField name="gender" label="Gender" options={["Male", "Female"]} value={form.gender} onChange={handleChange} />
                  <InputField name="aadharNumber" label="Aadhar Number" placeholder="12 digit number" value={form.aadharNumber} onChange={handleChange} />
                  <InputField name="panCard" label="PAN Card" placeholder="ABCDE1234F" value={form.panCard} onChange={handleChange} />
                </>)}

                {step === 3 && (<>
                  <InputField name="totalExperience" label="Total Experience (Years)" type="number" value={form.totalExperience} onChange={handleChange} />
                  <InputField name="trainingGurukul" label="Training / Gurukul Name" value={form.trainingGurukul} onChange={handleChange} />
                  <SelectField name="specialization" label="Primary Specialization" options={enums.specialization || []} value={form.specialization} onChange={handleChange} />
                  <SelectField name="vedaSpecialization" label="Veda Specialization" options={enums.vedaSpecialization || []} value={form.vedaSpecialization} onChange={handleChange} />
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Select Pujas You Perform</label>
                    <div className="space-y-2 max-h-64 overflow-y-auto p-1 border rounded-xl">
                      {pujasList.map((puja) => {
                        const selection = form.selectedPujas.find((s) => s.puja === puja._id);
                        const isSelected = !!selection;
                        return (
                          <div key={puja._id} className={`p-3 rounded-xl border ${isSelected ? "border-orange-400 bg-orange-50" : "bg-white"}`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 cursor-pointer" onClick={() => {
                                let updated = isSelected ? form.selectedPujas.filter(s => s.puja !== puja._id) : [...form.selectedPujas, { puja: puja._id, price: 0 }];
                                setForm(prev => ({ ...prev, selectedPujas: updated }));
                              }}>
                                <div className={`w-5 h-5 rounded flex items-center justify-center ${isSelected ? "bg-orange-500" : "bg-gray-200"}`}>{isSelected && "✓"}</div>
                                <span className="text-sm font-bold">{puja.pujaType}</span>
                              </div>
                              {isSelected && <input type="number" value={selection.price} onChange={(e) => {
                                const updated = form.selectedPujas.map(s => s.puja === puja._id ? { ...s, price: e.target.value } : s);
                                setForm(prev => ({ ...prev, selectedPujas: updated }));
                              }} className="w-24 p-1 border rounded text-xs" placeholder="Price" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>)}

                {step === 4 && (<>
                  <SelectField name="mantraLevel" label="Mantra Level" options={enums.mantraLevel || []} value={form.mantraLevel} onChange={handleChange} />
                  <SelectField name="timeDiscipline" label="Time Discipline" options={enums.timeDiscipline || []} value={form.timeDiscipline} onChange={handleChange} />
                  <div className="sm:col-span-2 grid grid-cols-2 gap-2">
                    <CheckField name="bhajanKirtan" label="Bhajan" checked={form.bhajanKirtan} onChange={handleChange} />
                    <CheckField name="astrology" label="Astrology" checked={form.astrology} onChange={handleChange} />
                  </div>
                </>)}

                {step === 5 && (<>
                  <InputField name="availableCities" label="Available Cities" value={form.availableCities} onChange={handleChange} />
                  <InputField name="maxDistance" label="Max Travel Distance (KM)" type="number" value={form.maxDistance} onChange={handleChange} />
                  <InputField name="upiId" label="UPI ID" value={form.upiId} onChange={handleChange} />
                  <CheckField name="emergencyBooking" label="Accept Emergency Booking" checked={form.emergencyBooking} onChange={handleChange} />
                  <CheckField name="declaration" label="I declare all info is true" checked={form.declaration} onChange={handleChange} />
                </>)}
              </div>

              <div className="flex gap-3 pt-5 mt-4 border-t border-gray-100">
                {step > 1 && <button type="button" onClick={() => setStep(s => s - 1)} className="flex-1 py-2.5 rounded-xl border text-gray-600">Back</button>}
                <button type="submit" disabled={submitting} className="flex-[2] py-2.5 rounded-xl font-bold text-white" style={{ backgroundColor: THEME }}>
                  {submitting ? "Saving..." : step < 5 ? "Continue" : "Finish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {viewData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3" style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col border border-white/20">
            
            {/* Modal Header */}
            <div className="px-6 py-6 relative overflow-hidden flex-shrink-0" style={{ background: `linear-gradient(135deg, ${THEME}, ${THEME_DARK})` }}>
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <span className="text-9xl font-black text-white leading-none">ॐ</span>
              </div>
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 rounded-2xl bg-white/20 p-1 backdrop-blur-md flex items-center justify-center overflow-hidden border-2 border-white/40 shadow-xl">
                    {viewData.profilePhoto 
                      ? <img src={viewData.profilePhoto} className="w-full h-full object-cover rounded-xl" /> 
                      : <FaUserCircle className="text-5xl text-white/50" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-2xl font-black text-white tracking-tight">{viewData.fullName}</h3>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${viewData.isActive ? "bg-green-400/30 text-green-100" : "bg-red-400/30 text-red-100"}`}>
                        {viewData.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="text-white/80 font-medium text-sm flex items-center gap-1.5 mt-1">
                      <FaTag className="text-[10px]" /> {(Array.isArray(viewData.specializations) ? viewData.specializations[0] : viewData.specialization) || "Pandit"} • {viewData.totalExperience || viewData.experience} Years Exp.
                    </p>
                  </div>
                </div>
                <button onClick={() => setViewData(null)} className="w-10 h-10 rounded-full bg-white/10 text-white text-xl flex items-center justify-center hover:bg-white/20 transition-all">✕</button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto flex-1 p-6 space-y-8 bg-gray-50/50">
              
              {/* 1. Quick Actions & Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <a href={`tel:${viewData.mobileNumber}`} className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-orange-200 transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform"><FaPhoneAlt /></div>
                  <div><p className="text-[10px] text-gray-400 font-bold uppercase">Mobile</p><p className="text-sm font-black text-gray-800">{viewData.mobileNumber}</p></div>
                </a>
                <button onClick={() => handleWhatsApp(viewData)} className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-green-200 transition-all group text-left">
                  <div className="w-10 h-10 rounded-xl bg-green-50 text-green-500 flex items-center justify-center group-hover:scale-110 transition-transform"><FaWhatsapp /></div>
                  <div><p className="text-[10px] text-gray-400 font-bold uppercase">WhatsApp</p><p className="text-sm font-black text-gray-800">{viewData.whatsappNumber || viewData.mobileNumber}</p></div>
                </button>
                <div className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-orange-200 transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform"><FaEnvelope /></div>
                  <div><p className="text-[10px] text-gray-400 font-bold uppercase">Email</p><p className="text-sm font-black text-gray-800 truncate max-w-[150px]">{viewData.emailId || "N/A"}</p></div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Left Column: Personal & Address */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <div className="w-1 h-4 rounded-full bg-orange-500"></div> Personal Details
                    </h4>
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                      <div className="flex justify-between border-b border-gray-50 pb-2"><span className="text-xs text-gray-400 font-bold">Gender / DOB</span><span className="text-xs font-bold text-gray-700">{viewData.gender} / {viewData.dob}</span></div>
                      <div className="flex justify-between border-b border-gray-50 pb-2"><span className="text-xs text-gray-400 font-bold">Gotra</span><span className="text-xs font-bold text-gray-700">{viewData.gotra || "—"}</span></div>
                      <div className="flex justify-between border-b border-gray-50 pb-2"><span className="text-xs text-gray-400 font-bold">Aadhar No.</span><span className="text-xs font-bold text-gray-700">{viewData.aadharNumber}</span></div>
                      <div className="flex justify-between border-b border-gray-50 pb-2"><span className="text-xs text-gray-400 font-bold">PAN Card</span><span className="text-xs font-bold text-gray-700">{viewData.panCard || "—"}</span></div>
                      <div className="flex justify-between"><span className="text-xs text-gray-400 font-bold">Languages</span><span className="text-xs font-bold text-gray-700">{Array.isArray(viewData.languages) ? viewData.languages.join(", ") : viewData.languagesKnown || "Hindi"}</span></div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <div className="w-1 h-4 rounded-full bg-orange-500"></div> Address & Location
                    </h4>
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                      <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Current Address</p><p className="text-xs font-semibold text-gray-600 leading-relaxed">{viewData.currentAddress}</p></div>
                      <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-1">City / District / State</p><p className="text-xs font-bold text-gray-800">{viewData.city}, {viewData.district}, {viewData.state} - {viewData.pincode}</p></div>
                      {viewData.availableCities?.length > 0 && (
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Available In Cities</p>
                          <div className="flex flex-wrap gap-1">
                            {viewData.availableCities.map((c, idx) => (
                              <span key={idx} className="px-2 py-0.5 bg-gray-100 text-[9px] font-bold rounded">{c}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <div className="w-1 h-4 rounded-full bg-orange-500"></div> Logistics & Travel
                    </h4>
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm grid grid-cols-2 gap-4">
                      <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Service Area</p><p className="text-xs font-bold text-gray-800">{viewData.serviceArea || "—"}</p></div>
                      <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Max Distance</p><p className="text-xs font-bold text-gray-800">{viewData.maxDistance || "—"} KM</p></div>
                      <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Travel Availability</p><p className="text-xs font-bold text-gray-800">{viewData.travelAvailability || "—"}</p></div>
                      <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Travel Willingness</p><p className="text-xs font-bold text-gray-800">{viewData.travelWillingness || "—"}</p></div>
                      <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Samagri Arrangement</p><p className="text-xs font-bold text-gray-800">{viewData.samagriArrangement || "—"}</p></div>
                      <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Puja Kit / Experience</p><p className="text-xs font-bold text-gray-800">{viewData.samagriExperience || "—"}</p></div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Pujas, Skills & Media */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2"><div className="w-1 h-4 rounded-full bg-orange-500"></div> Puja Services & Rates</div>
                      <span className="text-[10px] font-bold bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">{viewData.selectedPujas?.length || 0} Pujas</span>
                    </h4>
                    <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-sm max-h-[300px] overflow-y-auto space-y-1">
                      {viewData.selectedPujas?.map((s, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center text-xs font-bold">{idx + 1}</div>
                            <p className="text-xs font-bold text-gray-700">{s.puja?.pujaType || "Puja Service"}</p>
                          </div>
                          <p className="text-sm font-black text-orange-600">₹{s.price}</p>
                        </div>
                      ))}
                      {(!viewData.selectedPujas || viewData.selectedPujas.length === 0) && <p className="text-center py-8 text-xs text-gray-400 italic">No puja rates defined</p>}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <div className="w-1 h-4 rounded-full bg-orange-500"></div> Skills & Quality
                    </h4>
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm grid grid-cols-2 gap-y-4 gap-x-2">
                      <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Mantra Level</p><p className="text-xs font-bold text-gray-800">{viewData.mantraLevel || "—"}</p></div>
                      <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Time Discipline</p><p className="text-xs font-bold text-gray-800">{viewData.timeDiscipline || "—"}</p></div>
                      <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Dress Code</p><p className="text-xs font-bold text-gray-800">{viewData.dressCode || "—"}</p></div>
                      <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Veda</p><p className="text-xs font-bold text-gray-800">{viewData.vedaSpecialization || "—"}</p></div>
                      <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Traditional Dress</p><p className="text-xs font-bold text-gray-800">{viewData.traditionalDress || "—"}</p></div>
                      <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Audio Clarity</p><p className="text-xs font-bold text-gray-800">{viewData.audioClarity || "—"}</p></div>
                      <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Event Handling</p><p className="text-xs font-bold text-gray-800">{viewData.eventHandling || "—"}</p></div>
                      <div className="col-span-2">
                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Live Event Experience</p>
                        <div className="flex flex-wrap gap-1">
                          {viewData.liveEventExperience?.map((e, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-orange-50 text-orange-600 text-[9px] font-black rounded border border-orange-100">{e}</span>
                          ))}
                          {(!viewData.liveEventExperience || viewData.liveEventExperience.length === 0) && <span className="text-[9px] text-gray-400">None</span>}
                        </div>
                      </div>
                      <div className="col-span-2 pt-2 flex flex-wrap gap-1.5">
                        {[
                          { l: "Bhajan", v: viewData.bhajanKirtan },
                          { l: "Astrology", v: viewData.astrology },
                          { l: "Vastu", v: viewData.vastu },
                          { l: "Havan", v: viewData.havan },
                          { l: "Corporate", v: viewData.corporateExperience },
                        ].filter(x => x.v).map(x => (
                          <span key={x.l} className="px-2.5 py-1 bg-green-50 text-green-600 text-[10px] font-black rounded-full border border-green-100 flex items-center gap-1">
                            <FaCheckCircle size={10} /> {x.l}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></div> Identity & Document Verification
                    </h4>
                    
                    <div className="space-y-5">
                      {/* Premium ID Card */}
                      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] overflow-hidden">
                        <div className="flex flex-col lg:flex-row">
                          {/* Left: Document Preview */}
                          <div className="lg:w-2/5 bg-gray-50/50 p-6 flex flex-col items-center justify-center border-r border-gray-50">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 w-full text-center">ID Proof Document</p>
                            <div className="relative group w-full aspect-[4/3] max-w-[240px]">
                              <div className="absolute inset-0 bg-orange-500/10 blur-2xl rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                              <div className="relative h-full rounded-2xl overflow-hidden border-2 border-white shadow-xl bg-white group-hover:-translate-y-1 transition-all duration-500 cursor-zoom-in"
                                   onClick={() => viewData.idProof && window.open(viewData.idProof, "_blank")}>
                                {viewData.idProof ? (
                                  <>
                                    <img src={viewData.idProof} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center p-4">
                                      <span className="text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                        <FaEye size={12} /> View Document
                                      </span>
                                    </div>
                                  </>
                                ) : (
                                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 bg-gray-50">
                                    <FaFileAlt className="text-4xl mb-2 opacity-20" />
                                    <span className="text-[10px] font-black uppercase">No Document</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            {viewData.idProof && (
                              <button onClick={() => window.open(viewData.idProof, "_blank")}
                                      className="mt-4 text-[10px] font-black text-orange-600 uppercase tracking-widest hover:text-orange-700 transition-colors">
                                Download Original File
                              </button>
                            )}
                          </div>

                          {/* Right: ID Numbers & Details */}
                          <div className="flex-1 p-6 sm:p-8 flex flex-col justify-center">
                            <div className="flex items-center gap-2 mb-6">
                              <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shadow-sm"><FaInbox size={14} /></div>
                              <h5 className="text-sm font-black text-gray-800 tracking-tight">Verification Particulars</h5>
                            </div>

                            <div className="space-y-4 mb-8">
                               <div className="p-5 rounded-[1.5rem] bg-[#fffaf4] border border-orange-100/50 relative overflow-hidden group/box">
                                  <div className="absolute top-1/2 -translate-y-1/2 right-4 opacity-[0.05] group-hover/box:scale-110 transition-transform duration-500">
                                    <FaCheckCircle size={50} className="text-orange-900" />
                                  </div>
                                  <div className="relative z-10">
                                    <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                      <div className="w-1.5 h-1.5 rounded-full bg-orange-400" /> Aadhaar Card Number
                                    </p>
                                    <p className={`text-xl font-black tracking-widest ${viewData.aadharNumber ? "text-gray-800" : "text-gray-300 italic text-base"}`}>
                                      {viewData.aadharNumber || "Not Provided"}
                                    </p>
                                  </div>
                               </div>
                               <div className="p-5 rounded-[1.5rem] bg-blue-50/30 border border-blue-100/50 relative overflow-hidden group/box">
                                  <div className="absolute top-1/2 -translate-y-1/2 right-4 opacity-[0.05] group-hover/box:scale-110 transition-transform duration-500">
                                    <FaTag size={50} className="text-blue-900" />
                                  </div>
                                  <div className="relative z-10">
                                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400" /> PAN Card Number
                                    </p>
                                    <p className={`text-xl font-black tracking-widest uppercase ${viewData.panCard ? "text-gray-800" : "text-gray-300 italic text-base"}`}>
                                      {viewData.panCard || "Not Provided"}
                                    </p>
                                  </div>
                               </div>
                            </div>

                            <div className="flex flex-wrap gap-3">
                               <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${viewData.idProof ? "bg-green-50 text-green-600 border-green-100 shadow-[0_4px_12px_-4px_rgba(22,163,74,0.3)]" : "bg-red-50 text-red-400 border-red-100"}`}>
                                  <div className={`w-1.5 h-1.5 rounded-full ${viewData.idProof ? "bg-green-500 animate-pulse" : "bg-red-400"}`} />
                                  {viewData.idProof ? "Identity Document Verified" : "Document Verification Pending"}
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest bg-orange-50 text-orange-600 border border-orange-100 shadow-[0_4px_12px_-4px_rgba(232,98,26,0.3)]">
                                  <FaStar size={10} className="fill-orange-500 text-orange-500" /> Trust Score: 100%
                                </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Intro Video Card */}
                      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 sm:p-8">
                        <div className="flex items-center justify-between mb-6">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-2xl bg-gray-900 text-white flex items-center justify-center shadow-lg"><FaVideo size={16} /></div>
                              <div>
                                 <h5 className="text-sm font-black text-gray-800 tracking-tight">Introduction Video</h5>
                                 <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Experience & Self-Intro</p>
                              </div>
                           </div>
                           {viewData.introVideo && <span className="text-[9px] font-black text-green-500 bg-green-50 px-2 py-1 rounded-lg uppercase tracking-widest">Clip Ready</span>}
                        </div>

                        <div className="group relative rounded-3xl overflow-hidden aspect-video bg-gray-900 border-4 border-white shadow-2xl cursor-pointer transition-transform duration-500 hover:scale-[1.01]"
                             onClick={() => viewData.introVideo && window.open(viewData.introVideo, "_blank")}>
                          {viewData.introVideo ? (
                            <div className="w-full h-full flex flex-col items-center justify-center">
                              <FaVideo className="text-white/10 text-6xl mb-2 transition-transform group-hover:scale-110 duration-700" />
                              <div className="absolute inset-0 bg-gradient-to-tr from-orange-600/20 via-transparent to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                              <div className="absolute inset-0 flex items-center justify-center">
                                 <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-orange-600 shadow-2xl scale-90 group-hover:scale-100 transition-all duration-500">
                                    <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[16px] border-l-current border-b-[10px] border-b-transparent ml-1"></div>
                                 </div>
                              </div>
                            </div>
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 bg-gray-950">
                              <FaVideo className="text-4xl mb-2 opacity-10" />
                              <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Video Not Uploaded</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Pricing & Charges */}
              <div>
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <div className="w-1 h-4 rounded-full bg-orange-500"></div> Pricing & Charges
                </h4>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm grid grid-cols-2 gap-4">
                  <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Basic Puja</p><p className="text-sm font-black text-orange-600">₹{viewData.basicPujaCharges || "—"}</p></div>
                  <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Akhand Path</p><p className="text-sm font-black text-orange-600">₹{viewData.akhandPathCharges || "—"}</p></div>
                  <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Per Day</p><p className="text-sm font-black text-orange-600">₹{viewData.perDayCharges || "—"}</p></div>
                  <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Travel Charges</p><p className="text-sm font-black text-orange-600">₹{viewData.travelCharges || "—"}</p></div>
                </div>
              </div>

              {/* 3. Availability & Schedule */}
              <div>
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <div className="w-1 h-4 rounded-full bg-orange-500"></div> Availability & Schedule
                </h4>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                  <div className="flex justify-between border-b border-gray-50 pb-2"><span className="text-xs text-gray-400 font-bold">Availability Type</span><span className="text-xs font-bold text-gray-700">{viewData.availabilityType || "—"}</span></div>
                  <div className="flex justify-between border-b border-gray-50 pb-2"><span className="text-xs text-gray-400 font-bold">Available Days</span><span className="text-xs font-bold text-gray-700">{Array.isArray(viewData.availableDays) && viewData.availableDays.length > 0 ? viewData.availableDays.join(", ") : "—"}</span></div>
                  <div className="flex justify-between"><span className="text-xs text-gray-400 font-bold">Emergency Booking</span><span className={`px-2 py-0.5 rounded text-[10px] font-bold ${viewData.emergencyBooking ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>{viewData.emergencyBooking ? "YES" : "NO"}</span></div>
                </div>
              </div>

              {/* 4. Training & Qualifications */}
              <div>
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <div className="w-1 h-4 rounded-full bg-orange-500"></div> Training & Qualifications
                </h4>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
                  <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Training / Gurukul</p><p className="text-xs font-semibold text-gray-600">{viewData.trainingGurukul || "—"}</p></div>
                  <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Media Permission</p><span className={`px-2 py-0.5 rounded text-[10px] font-bold ${viewData.mediaPermission === "Yes" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>{viewData.mediaPermission || "—"}</span></div>
                </div>
              </div>

              {/* 5. Photo Gallery */}
              {viewData.pujaPhotos?.length > 0 && (
                <div>
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <div className="w-1 h-4 rounded-full bg-orange-500"></div> Puja Performance Gallery
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {viewData.pujaPhotos.map((img, idx) => (
                      <div key={idx} className="group relative rounded-2xl overflow-hidden aspect-square shadow-sm border border-gray-100 cursor-pointer"
                           onClick={() => window.open(img, "_blank")}>
                        <img src={img} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-all flex items-end p-3">
                           <span className="text-white text-[9px] font-black uppercase tracking-widest flex items-center gap-1"><FaImage /> Expand</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 6. Video Clips Gallery */}
              {viewData.pujaVideoClips?.length > 0 && (
                <div>
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <div className="w-1 h-4 rounded-full bg-orange-500"></div> Puja Video Clips
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {viewData.pujaVideoClips.map((vid, idx) => (
                      <div key={idx} className="group relative rounded-2xl overflow-hidden aspect-video bg-gray-900 border border-gray-100 cursor-pointer shadow-sm flex items-center justify-center"
                           onClick={() => window.open(vid, "_blank")}>
                        <div className="flex flex-col items-center">
                           <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white mb-1 group-hover:bg-orange-500 group-hover:scale-110 transition-all">
                             <FaVideo size={14} />
                           </div>
                           <span className="text-white/50 text-[9px] font-black uppercase tracking-widest">Clip {idx + 1}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 7. Contact & Address Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <div className="w-1 h-4 rounded-full bg-orange-500"></div> Contact Information
                  </h4>
                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
                    <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Alternate Number</p><p className="text-sm font-black text-gray-800">{viewData.alternateNumber || "—"}</p></div>
                    <div className="h-px bg-gray-50"></div>
                    <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Current Address</p><p className="text-xs font-semibold text-gray-600 leading-relaxed">{viewData.currentAddress || "—"}</p></div>
                    <div className="h-px bg-gray-50"></div>
                    <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Permanent Address</p><p className="text-xs font-semibold text-gray-600 leading-relaxed">{viewData.permanentAddress || "—"}</p></div>
                    <div className="h-px bg-gray-50"></div>
                    <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Pincode</p><p className="text-sm font-black text-gray-800">{viewData.pincode || "—"}</p></div>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <div className="w-1 h-4 rounded-full bg-orange-500"></div> Payment & Banking
                  </h4>
                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
                    <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Bank/UPI Details</p><p className="text-xs font-bold text-gray-700 break-all">{viewData.bankUpiDetails || "—"}</p></div>
                    <div className="h-px bg-gray-50"></div>
                    <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Bank Details</p><p className="text-xs font-bold text-gray-600 italic">{viewData.bankDetails || "—"}</p></div>
                    <div className="h-px bg-gray-50"></div>
                    <div className="flex items-center gap-2">
                       <FaCheckCircle className="text-green-500 text-xs" />
                       <span className="text-[10px] font-bold text-gray-400">Declaration Accepted</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 8. Reviews & Ratings */}
              <div>
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2 justify-between">
                  <div className="flex items-center gap-2"><div className="w-1 h-4 rounded-full bg-orange-500"></div> Reviews & Ratings</div>
                  {viewData.totalReviews > 0 && (
                    <span className="text-[10px] font-bold bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <FaStar /> {viewData.averageRating} ({viewData.totalReviews} Reviews)
                    </span>
                  )}
                </h4>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                  {viewData.reviews && viewData.reviews.length > 0 ? (
                    viewData.reviews.map((r, idx) => (
                      <div key={idx} className="border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-[10px] font-bold">
                              {r.user?.name ? r.user.name.charAt(0).toUpperCase() : "U"}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-gray-700">{r.user?.name || "User"}</p>
                              <div className="flex items-center text-[10px] text-orange-400">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <span key={i} className={i < r.rating ? "text-orange-500" : "text-gray-200"}>★</span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <p className="text-[9px] text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</p>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed mb-2">{r.comment}</p>
                        {r.image && (
                          <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 cursor-pointer" onClick={() => window.open(r.image, "_blank")}>
                            <img src={r.image} className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400 italic text-center py-4">No reviews yet</p>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-white border-t border-gray-100 flex items-center justify-between flex-shrink-0">
               <p className="text-[10px] text-gray-300 font-bold uppercase">Registration ID: {viewData._id}</p>
               <div className="flex gap-3">
                  <button onClick={() => { setViewData(null); openEdit(viewData); }} className="px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest text-orange-600 border-2 border-orange-100 hover:bg-orange-50 transition-all flex items-center gap-2">
                    <FaEdit /> Edit Details
                  </button>
                  <button onClick={() => setViewData(null)} className="px-10 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest text-white shadow-xl shadow-orange-500/20 hover:-translate-y-0.5 transition-all" style={{ backgroundColor: THEME }}>
                    Close
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 text-center shadow-2xl">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl"><FaTrash /></div>
            <h3 className="text-lg font-bold mb-1 text-gray-800">Delete Pandit?</h3>
            <p className="text-sm text-gray-400 mb-6">Are you sure? This action is permanent.</p>
            <div className="flex gap-3">
              <button onClick={handleDelete} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-all">Delete Now</button>
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 font-bold text-gray-500 hover:bg-gray-50 transition-all">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
