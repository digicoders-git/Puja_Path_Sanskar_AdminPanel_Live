<<<<<<< HEAD
import { useEffect, useState } from "react";
=======
import { useEffect, useState, useRef } from "react";
import { useGooglePlacesAutocomplete } from "../hooks/useGooglePlacesAutocomplete";
>>>>>>> 54351168fd47951aa69da6dcf7208ea9793fd6b4
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import {
  getAllPandits, createPandit, updatePandit,
  deletePandit, togglePandit, getEnums,
} from "../services/panditService";
<<<<<<< HEAD
import { FaEye, FaEdit, FaTrash, FaPlus, FaWhatsapp, FaTimes, FaSearch, FaInbox, FaVideo, FaImage, FaCheckCircle, FaUserCircle } from "react-icons/fa";
=======
import { getAllPujas } from "../services/pujaService";
import { FaEye, FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaPlus } from "react-icons/fa";
>>>>>>> 54351168fd47951aa69da6dcf7208ea9793fd6b4
import PanditCharts from "../components/PanditCharts";

const THEME = "#E8621A";
const THEME_LIGHT = "#fff4ee";
<<<<<<< HEAD
const THEME_DARK = "#c9541a";

const EMPTY = {
  fullName: "", mobileNumber: "", whatsappNumber: "",
  state: "", city: "", district: "",
  experience: "", specializations: [], languages: [],
  idProof: null, profilePhoto: null,
  serviceArea: "", samagriArrangement: "",
  bankUpiDetails: "", samagriExperience: "",
  travelAvailability: "", liveEventExperience: [],
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
};

const inputCls = "w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 bg-white text-gray-700 placeholder:text-gray-300";
const labelCls = "block text-xs font-semibold text-gray-500 mb-1.5";
=======

const EMPTY = {
  fullName: "", mobileNumber: "", alternateNumber: "", emailId: "",
  dob: "", gender: "", gotra: "",
  currentAddress: "", permanentAddress: "", city: "", pincode: "",
  aadharNumber: "", panNumber: "", videoLink: "", socialLink: "",
  totalExperience: "", trainingGurukul: "", specialization: "",
  vedaSpecialization: "", shakha: "", languagesKnown: "",
  pujaKitProvided: "",
  mantraLevel: "", timeDiscipline: "", dressCode: "", eventHandling: "",
  bhajanKirtan: false, astrology: false, vastu: false, havan: false,
  corporateExperience: false, onlinePujaSupport: false,
  availableCities: "", travelWillingness: "", maxDistance: "",
  availabilityType: "", availableDays: "", emergencyBooking: false,
  upiId: "", bankDetails: "", referenceName: "", referenceContact: "",
  declaration: false,
  latitude: null, longitude: null,
  selectedPujas: [],
};

const STEPS = ["Basic & Address", "Identity & Media", "Experience & Pricing", "Skills & Quality", "Logistics & Payment"];

const inputCls = "w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-orange-400 bg-white text-gray-700";
const labelCls = "block text-xs font-semibold text-gray-500 mb-1";
>>>>>>> 54351168fd47951aa69da6dcf7208ea9793fd6b4

const SelectField = ({ name, label, options = [], required, value, onChange }) => (
  <div>
    <label className={labelCls}>{label}{required && " *"}</label>
    <select name={name} value={value} onChange={onChange} required={required} className={inputCls}>
      <option value="">Select {label}</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

const InputField = ({ name, label, type = "text", placeholder, required, value, onChange }) => (
  <div>
    <label className={labelCls}>{label}{required && " *"}</label>
    <input type={type} name={name} value={value} onChange={onChange}
      placeholder={placeholder} required={required} className={inputCls} />
  </div>
);

const CheckField = ({ name, label, checked, onChange }) => (
<<<<<<< HEAD
  <label className="flex items-center gap-2 cursor-pointer">
    <input type="checkbox" name={name} checked={checked} onChange={onChange} className="w-4 h-4 accent-orange-500" />
    <span className="text-xs font-bold text-gray-600">{label}</span>
=======
  <label className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${checked ? "border-orange-400 bg-orange-50" : "border-gray-200 bg-white"}`}>
    <input type="checkbox" name={name} checked={checked} onChange={onChange} className="hidden" />
    <div className={`w-4 h-4 rounded flex items-center justify-center ${checked ? "bg-orange-500" : "bg-gray-200"}`}>
      {checked && <span className="text-white text-xs">✓</span>}
    </div>
    <span className={`text-xs font-semibold ${checked ? "text-orange-600" : "text-gray-500"}`}>{label}</span>
>>>>>>> 54351168fd47951aa69da6dcf7208ea9793fd6b4
  </label>
);

export default function PanditPage() {
  const { token } = useAuth();
  const [pandits, setPandits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enums, setEnums] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [form, setForm] = useState(EMPTY);
<<<<<<< HEAD
=======
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [aadharImageFile, setAadharImageFile] = useState(null);
  const [pujaPhotosFiles, setPujaPhotosFiles] = useState([]);
>>>>>>> 54351168fd47951aa69da6dcf7208ea9793fd6b4
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [viewData, setViewData] = useState(null);
  const [step, setStep] = useState(1);
  const [search, setSearch] = useState("");
<<<<<<< HEAD

  const fetchAll = async () => {
    setLoading(true);
    const [data, enumData] = await Promise.all([getAllPandits(token), getEnums()]);
    setPandits(Array.isArray(data) ? data : []);
    setEnums(enumData);
=======
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
    const [data, enumData, pujasData] = await Promise.all([getAllPandits(token), getEnums(), getAllPujas()]);
    setPandits(Array.isArray(data) ? data : []);
    setEnums(enumData);
    setPujasList(Array.isArray(pujasData) ? pujasData : []);
>>>>>>> 54351168fd47951aa69da6dcf7208ea9793fd6b4
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

<<<<<<< HEAD
  const openCreate = () => { setEditData(null); setForm(EMPTY); setStep(1); setShowModal(true); };
  const openEdit = (p) => { setEditData(p); setForm({ ...EMPTY, ...p }); setStep(1); setShowModal(true); };
=======
  const openCreate = () => {
    setEditData(null); setForm(EMPTY);
    setProfilePhotoFile(null); setAadharImageFile(null); setPujaPhotosFiles([]);
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
    setProfilePhotoFile(null); setAadharImageFile(null); setPujaPhotosFiles([]);
    setStep(1); setShowModal(true);
  };
>>>>>>> 54351168fd47951aa69da6dcf7208ea9793fd6b4

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

<<<<<<< HEAD
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (name === 'pujaPhotos' || name === 'pujaVideoClips') {
      setForm(prev => ({ ...prev, [name]: Array.from(files) }));
    } else {
      setForm(prev => ({ ...prev, [name]: files[0] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step < 2) { setStep(2); return; }
    setSubmitting(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (Array.isArray(v)) {
        if (k === "pujaPhotos" || k === "pujaVideoClips") {
          v.forEach(f => { if (f instanceof File) fd.append(k, f); });
        } else {
          fd.append(k, JSON.stringify(v));
        }
      } else if (v instanceof File) {
        fd.append(k, v);
      } else if (v !== null && v !== undefined) {
        fd.append(k, v);
      }
    });
    const res = editData ? await updatePandit(token, editData._id, fd) : await createPandit(token, fd);
    if (res._id || res.fullName) { toast.success("Success!"); setShowModal(false); fetchAll(); }
    else { toast.error(res.message || "Error"); }
    setSubmitting(false);
  };

=======
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step < 5) { setStep((s) => s + 1); return; }
    setSubmitting(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (k === "selectedPujas") {
        fd.append(k, JSON.stringify(v));
      } else {
        fd.append(k, v);
      }
    });
    if (profilePhotoFile) fd.append("profilePhoto", profilePhotoFile);
    if (aadharImageFile) fd.append("aadharCardImage", aadharImageFile);
    pujaPhotosFiles.forEach((f) => fd.append("pujaPhotos", f));

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

>>>>>>> 54351168fd47951aa69da6dcf7208ea9793fd6b4
  const handleToggle = async (id) => {
    const res = await togglePandit(token, id);
    if (res.message) {
      toast.success(res.message);
      setPandits(pandits.map(p => p._id === id ? { ...p, isActive: !p.isActive } : p));
    }
  };

<<<<<<< HEAD
  const handleDelete = async () => {
    const res = await deletePandit(token, deleteId);
    if (res.message) { toast.success("Deleted!"); setPandits(pandits.filter(p => p._id !== deleteId)); setDeleteId(null); }
  };

  const handleWhatsApp = (p) => {
    const num = p.whatsappNumber || p.mobileNumber;
    const msg = `🙏 नमस्कार पंडित जी 🙏...`;
    window.open(`https://wa.me/91${num}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const filtered = pandits.filter((p) => {
    const q = search.toLowerCase();
    return p.fullName?.toLowerCase().includes(q) || p.mobileNumber?.toLowerCase().includes(q) || p.city?.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen p-3 sm:p-5">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Pandits</h2>
          <p className="text-xs text-gray-400 mt-0.5">Manage pandit registrations</p>
        </div>
        <button onClick={openCreate} className="px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-md flex items-center gap-2"
          style={{ backgroundColor: THEME }}>
          <FaPlus className="text-xs" /> Add Pandit
=======
  // search change hone pe page 1 pe reset
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
>>>>>>> 54351168fd47951aa69da6dcf7208ea9793fd6b4
        </button>
      </div>

      {/* Charts */}
      {!loading && pandits.length > 0 && <PanditCharts pandits={pandits} />}

<<<<<<< HEAD
      {/* Search Bar */}
      <div className="mb-4 relative">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-sm" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, mobile, city..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none bg-white text-gray-700"
          onFocus={(e) => e.target.style.borderColor = THEME}
          onBlur={(e) => e.target.style.borderColor = "#e5e7eb"} />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
            <FaTimes className="text-xs" />
          </button>
        )}
=======
      {/* Search */}
      <div className="mb-4">
        <input type="text" value={search}
          placeholder="Search by name, email, phone, city, specialization..."
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none bg-white text-gray-700"
          onFocus={(e) => e.target.style.borderColor = THEME}
          onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
          onChange={(e) => handleSearch(e.target.value)} />
>>>>>>> 54351168fd47951aa69da6dcf7208ea9793fd6b4
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-32">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2" style={{ borderColor: THEME }} />
        </div>
      ) : filtered.length === 0 ? (
<<<<<<< HEAD
        <div className="flex flex-col items-center justify-center py-32 text-gray-300">
          <FaInbox className="text-6xl mb-4" />
          <p className="text-base font-medium text-gray-400">{search ? "No results found" : "No pandits found"}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: `linear-gradient(135deg, ${THEME}, ${THEME_DARK})` }}>
                {["#", "Image", "Name", "Mobile", "City", "Status", "Actions"].map(h => (
=======
        <div className="text-center py-20 text-gray-400">No pandits found</div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm bg-white">
          <table className="w-full text-sm min-w-[2200px]">
            <thead>
              <tr style={{ background: `linear-gradient(135deg, ${THEME}, #c9541a)` }}>
                {["#", "Name", "Mobile", "Alt Mobile", "Email", "DOB", "Gender", "City", "Pincode", "Aadhar No", "PAN No", "Specialization", "Veda", "Experience", "Pujas & Rates", "Puja Kit", "Mantra Level", "Time Discipline", "Dress Code", "Event Handling", "Bhajan", "Astrology", "Vastu", "Havan", "Corporate", "Online Puja", "Max Distance", "Availability", "Travel", "Emergency", "UPI ID", "Ref Contact", "Status", "Actions"].map((h) => (
>>>>>>> 54351168fd47951aa69da6dcf7208ea9793fd6b4
                  <th key={h} className="px-4 py-3.5 text-left text-xs font-bold text-white whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
<<<<<<< HEAD
              {filtered.map((p, i) => (
                <tr key={p._id} className="border-t border-gray-50 hover:bg-orange-50 transition-colors">
                  <td className="px-4 py-3 text-gray-400 text-xs">{i + 1}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="w-9 h-9 rounded-xl overflow-hidden bg-orange-50 flex items-center justify-center border">
                      {p.profilePhoto 
                        ? <img src={`${import.meta.env.VITE_API_BASE_URL}/${p.profilePhoto.replace(/\\/g, "/")}`} className="w-full h-full object-cover" />
                        : <span className="text-lg">🕉️</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-bold text-gray-800 whitespace-nowrap">{p.fullName}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{p.mobileNumber}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{p.city}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <button onClick={() => handleToggle(p._id)}
                      className="px-3 py-1 rounded-full text-xs font-bold transition-all"
                      style={{ backgroundColor: p.isActive ? "#16a34a20" : "#dc262620", color: p.isActive ? "#16a34a" : "#dc2626" }}>
=======
              {paginated.map((p, i) => (
                <tr key={p._id} className="border-t border-gray-50 hover:bg-orange-50 transition-colors">
                  <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{(currentPage - 1) * PAGE_SIZE + i + 1}</td>
                  <td className="px-4 py-3 font-semibold text-gray-800 whitespace-nowrap">{p.fullName}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{p.mobileNumber}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{p.alternateNumber || "—"}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{p.emailId}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{p.dob}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{p.gender}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{p.city}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{p.pincode}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{p.aadharNumber}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{p.panNumber || "—"}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="px-2 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: THEME_LIGHT, color: THEME }}>{p.specialization}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{p.vedaSpecialization}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{p.totalExperience} yrs</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      {p.selectedPujas?.slice(0, 2).map((s, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-[10px] bg-orange-50 px-2 py-0.5 rounded border border-orange-100">
                          <span className="font-bold text-orange-700 truncate max-w-[80px]">{s.puja?.pujaType || "Puja"}</span>
                          <span className="font-black text-gray-700">₹{s.price}</span>
                        </div>
                      ))}
                      {p.selectedPujas?.length > 2 && (
                        <span className="text-[9px] text-gray-400 font-bold ml-1">+{p.selectedPujas.length - 2} more...</span>
                      )}
                      {(!p.selectedPujas || p.selectedPujas.length === 0) && <span className="text-gray-300 italic text-[10px]">No pujas</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{p.pujaKitProvided}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{p.mantraLevel}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{p.timeDiscipline}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{p.dressCode}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{p.eventHandling}</td>
                  {[p.bhajanKirtan, p.astrology, p.vastu, p.havan, p.corporateExperience, p.onlinePujaSupport].map((val, idx) => (
                    <td key={idx} className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${val ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                        {val ? "Yes" : "No"}
                      </span>
                    </td>
                  ))}
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{p.maxDistance} km</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{p.availabilityType}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{p.travelWillingness}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${p.emergencyBooking ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                      {p.emergencyBooking ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{p.upiId}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{p.referenceContact}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <button onClick={() => handleToggle(p._id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all"
                      style={{ backgroundColor: p.isActive ? "#16a34a20" : "#dc262620", color: p.isActive ? "#16a34a" : "#dc2626" }}>
                      {p.isActive ? <FaToggleOn className="text-base" /> : <FaToggleOff className="text-base" />}
>>>>>>> 54351168fd47951aa69da6dcf7208ea9793fd6b4
                      {p.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex gap-1.5">
<<<<<<< HEAD
                      <button onClick={() => handleWhatsApp(p)} title="WhatsApp" className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110 bg-green-50 text-green-600 border border-green-100"><FaWhatsapp /></button>
                      <button onClick={() => setViewData(p)} title="View" className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110" style={{ backgroundColor: THEME_LIGHT, color: THEME }}><FaEye /></button>
                      <button onClick={() => openEdit(p)} title="Edit" className="w-8 h-8 rounded-lg flex items-center justify-center border transition-all hover:scale-110" style={{ borderColor: "#f97316", color: "#f97316", backgroundColor: "#fff7ed" }}><FaEdit /></button>
                      <button onClick={() => setDeleteId(p._id)} title="Delete" className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110" style={{ backgroundColor: "#fef2f2", color: "#ef4444" }}><FaTrash /></button>
=======
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
>>>>>>> 54351168fd47951aa69da6dcf7208ea9793fd6b4
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

<<<<<<< HEAD
      {/* ===== ADD / EDIT MODAL ===== */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-5 py-4 flex items-center justify-between flex-shrink-0" style={{ background: `linear-gradient(135deg, ${THEME}, ${THEME_DARK})` }}>
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white">{editData ? "✏️" : "➕"}</div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{editData ? "Edit Pandit" : "Add New Pandit"}</h3>
                    <p className="text-xs text-white/70">Step {step} of 2</p>
                  </div>
               </div>
               <button onClick={() => setShowModal(false)} className="text-white hover:bg-white/10 p-2 rounded-full transition-all"><FaTimes /></button>
            </div>
            <form onSubmit={handleSubmit} className="overflow-y-auto p-5 flex-1 space-y-4">
              {step === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <h4 className="md:col-span-2 text-xs font-bold text-orange-500 uppercase tracking-widest border-b pb-1">1. Important Details (Mandatory)</h4>
                   <InputField name="fullName" label="Full Name" required value={form.fullName} onChange={handleChange} />
                   <InputField name="mobileNumber" label="Mobile Number" required value={form.mobileNumber} onChange={handleChange} />
                   <InputField name="whatsappNumber" label="WhatsApp Number" value={form.whatsappNumber} onChange={handleChange} />
                   <InputField name="state" label="State" required value={form.state} onChange={handleChange} />
                   <InputField name="city" label="City" required value={form.city} onChange={handleChange} />
                   <InputField name="district" label="District" required value={form.district} onChange={handleChange} />
                   <SelectField name="experience" label="Experience" options={["1–3 Years", "3–7 Years", "7+ Years"]} required value={form.experience} onChange={handleChange} />
                   <div className="md:col-span-2"><label className={labelCls}>Specializations *</label>
                      <div className="flex flex-wrap gap-2">
                        {["Grih Pravesh", "Vivah", "Satyanarayan Katha", "Rudrabhishek", "Sunderkand", "Jagran", "Bhagwat Katha"].map(s => (
                          <CheckField key={s} label={s} checked={form.specializations.includes(s)} onChange={(e) => {
                            const updated = e.target.checked ? [...form.specializations, s] : form.specializations.filter(x => x !== s);
                            setForm(prev => ({ ...prev, specializations: updated }));
                          }} />
                        ))}
                      </div>
                   </div>
                   <div className="md:col-span-2"><label className={labelCls}>Languages Known *</label>
                      <div className="flex flex-wrap gap-2">
                        {["Hindi", "Sanskrit", "English", "Others"].map(l => (
                          <CheckField key={l} label={l} checked={form.languages.includes(l)} onChange={(e) => {
                            const updated = e.target.checked ? [...form.languages, l] : form.languages.filter(x => x !== l);
                            setForm(prev => ({ ...prev, languages: updated }));
                          }} />
                        ))}
                      </div>
                   </div>
                   <div><label className={labelCls}>ID Proof Upload *</label><input type="file" required={!editData} onChange={handleFileChange} name="idProof" className={inputCls} /></div>
                   <div><label className={labelCls}>Profile Photo *</label><input type="file" required={!editData} onChange={handleFileChange} name="profilePhoto" className={inputCls} /></div>
                   <SelectField name="serviceArea" label="Service Area" options={["Within 10 km", "Entire City", "Nearby Districts"]} required value={form.serviceArea} onChange={handleChange} />
                   <SelectField name="samagriArrangement" label="Samagri Arrangement" options={["Yes", "No"]} required value={form.samagriArrangement} onChange={handleChange} />
                   <InputField name="bankUpiDetails" label="UPI ID (Optional)" value={form.bankUpiDetails} onChange={handleChange} />
                   <SelectField name="samagriExperience" label="Puja Kit Experience" options={["Basic Setup", "Full Setup", "No"]} required value={form.samagriExperience} onChange={handleChange} />
                   <SelectField name="travelAvailability" label="Travel Availability" options={["Only Local Area", "Entire District", "Other States Also"]} required value={form.travelAvailability} onChange={handleChange} />
                   <div className="md:col-span-2"><label className={labelCls}>Live Event Experience *</label>
                      <div className="flex flex-wrap gap-2">
                        {["Jagran", "Bhagwat Katha", "Corporate Puja", "Mandir Event"].map(ex => (
                          <CheckField key={ex} label={ex} checked={form.liveEventExperience.includes(ex)} onChange={(e) => {
                            const updated = e.target.checked ? [...form.liveEventExperience, ex] : form.liveEventExperience.filter(x => x !== ex);
                            setForm(prev => ({ ...prev, liveEventExperience: updated }));
                          }} />
                        ))}
                      </div>
                   </div>
                </div>
              )}
              {step === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in">
                   <h4 className="md:col-span-2 text-xs font-bold text-gray-400 uppercase tracking-widest border-b pb-1">2. Media & Additional Details (Optional)</h4>
                   <div><label className={labelCls}>Intro Video</label><input type="file" name="introVideo" onChange={handleFileChange} className={inputCls} accept="video/*" /></div>
                   <div><label className={labelCls}>Puja Photos (Multi)</label><input type="file" multiple name="pujaPhotos" onChange={handleFileChange} className={inputCls} accept="image/*" /></div>
                   <div><label className={labelCls}>Puja Video Clips (Multi)</label><input type="file" multiple name="pujaVideoClips" onChange={handleFileChange} className={inputCls} accept="video/*" /></div>
                   <SelectField name="traditionalDress" label="Traditional Dress" options={["Yes", "Sometimes", "No"]} value={form.traditionalDress} onChange={handleChange} />
                   <SelectField name="audioClarity" label="Audio Clarity" options={["Yes", "Average", "Professional"]} value={form.audioClarity} onChange={handleChange} />
                   <div className="md:col-span-2"><label className={labelCls}>Media Permission</label>
                      <div className="flex gap-4 mt-1">
                        {["Yes", "No"].map(o => (
                          <label key={o} className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="mediaPermission" value={o} checked={form.mediaPermission === o} onChange={handleChange} className="w-4 h-4 accent-orange-500" />
                            <span className="text-xs font-bold text-gray-600">{o}</span>
                          </label>
                        ))}
                      </div>
                   </div>
                   <InputField name="emailId" label="Email ID" value={form.emailId} onChange={handleChange} />
                   <InputField name="alternateNumber" label="Alternate No" value={form.alternateNumber} onChange={handleChange} />
                   <InputField name="dob" label="DOB" type="date" value={form.dob} onChange={handleChange} />
                   <SelectField name="gender" label="Gender" options={["Male", "Female"]} value={form.gender} onChange={handleChange} />
                   <InputField name="aadharNumber" label="Aadhar No" value={form.aadharNumber} onChange={handleChange} />
                   <div className="md:col-span-2 mt-2"><CheckField name="declaration" label="I declare all information is correct." checked={form.declaration} onChange={handleChange} /></div>
                </div>
              )}
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                {step > 1 && <button type="button" onClick={() => setStep(1)} className="flex-1 py-2.5 rounded-xl border font-bold text-sm text-gray-500 hover:bg-gray-50">Back</button>}
                <button type="submit" className="flex-[2] py-2.5 rounded-xl font-bold text-sm text-white shadow-md" style={{ backgroundColor: THEME }}>{step < 2 ? "Next Step" : submitting ? "Saving..." : "Save Pandit"}</button>
=======
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

      {/* ===== CREATE / EDIT MODAL ===== */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">

            {/* Modal Header */}
            <div className="px-6 py-4 flex items-center justify-between flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${THEME}, #c9541a)` }}>
              <h3 className="text-base font-bold text-white">{editData ? "Edit Pandit" : "Add Pandit"}</h3>
              <button onClick={() => setShowModal(false)} className="text-white text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20">✕</button>
            </div>

            {/* Step Indicator */}
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

            {/* Form */}
            <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 pb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* Step 1 - Basic & Address */}
                {step === 1 && (<>
                  <InputField name="fullName" label="Full Name" placeholder="Pt. Ramesh Sharma" required value={form.fullName} onChange={handleChange} />
                  <InputField name="mobileNumber" label="Mobile Number" placeholder="10 digit number" required value={form.mobileNumber} onChange={handleChange} />
                  <InputField name="alternateNumber" label="Alternate Number" placeholder="Optional" value={form.alternateNumber} onChange={handleChange} />
                  <InputField name="emailId" label="Email ID" type="email" placeholder="email@example.com" required value={form.emailId} onChange={handleChange} />
                  <InputField name="dob" label="Date of Birth" type="date" required value={form.dob} onChange={handleChange} />
                  <SelectField name="gender" label="Gender" options={enums.gender || []} required value={form.gender} onChange={handleChange} />
                  <InputField name="gotra" label="Gotra" placeholder="e.g. Bhardwaj, Kashyap" value={form.gotra} onChange={handleChange} />
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Current Address *</label>
                    <input 
                      ref={addressInputRef}
                      name="currentAddress" 
                      value={form.currentAddress} 
                      onChange={handleChange}
                      required 
                      autoComplete="off"
                      placeholder="Search your address on Google Maps..."
                      className={inputCls}
                    />
                    <div className="flex gap-4 mt-2">
                       <div className="flex-1 p-2 rounded-lg bg-gray-50 border border-gray-100">
                          <p className="text-[10px] text-gray-400 font-bold uppercase">Latitude</p>
                          <p className="text-xs font-mono font-bold text-orange-600">{form.latitude || "—"}</p>
                       </div>
                       <div className="flex-1 p-2 rounded-lg bg-gray-50 border border-gray-100">
                          <p className="text-[10px] text-gray-400 font-bold uppercase">Longitude</p>
                          <p className="text-xs font-mono font-bold text-orange-600">{form.longitude || "—"}</p>
                       </div>
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Permanent Address *</label>
                    <textarea name="permanentAddress" value={form.permanentAddress} onChange={handleChange}
                      required rows={2} placeholder="If same, type 'Same'"
                      className={inputCls + " resize-none"} />
                  </div>
                </>)}

                {/* Step 2 - Identity & Media */}
                {step === 2 && (<>
                  <InputField name="aadharNumber" label="Aadhar Number" placeholder="12 digit number" required value={form.aadharNumber} onChange={handleChange} />
                  <InputField name="panNumber" label="PAN Number" placeholder="ABCDE1234F" value={form.panNumber} onChange={handleChange} />

                  {/* Aadhar Card Image Upload */}
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Aadhar Card Upload (Front & Back) *</label>
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 bg-gray-50 hover:bg-white transition-colors">
                      <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                        onChange={(e) => setAadharImageFile(e.target.files[0])}
                        className="w-full text-sm text-gray-500" />
                      {aadharImageFile && (
                        <p className="text-xs text-green-600 mt-1 font-semibold">✓ {aadharImageFile.name}</p>
                      )}
                      {!aadharImageFile && editData?.aadharCardImage && (
                        <p className="text-xs text-orange-500 mt-1">Current: {editData.aadharCardImage.split("/").pop()}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP, PDF (Max 5MB)</p>
                    </div>
                  </div>

                  {/* Profile Photo Upload */}
                  <div>
                    <label className={labelCls}>Profile Photo *</label>
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 bg-gray-50 hover:bg-white transition-colors">
                      {(profilePhotoFile || editData?.profilePhoto) && (
                        <img
                          src={profilePhotoFile ? URL.createObjectURL(profilePhotoFile) : `${import.meta.env.VITE_API_BASE_URL}/${editData.profilePhoto}`}
                          alt="Profile Preview"
                          className="w-16 h-16 rounded-full object-cover mx-auto mb-2 border-2 border-orange-300"
                        />
                      )}
                      <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={(e) => setProfilePhotoFile(e.target.files[0])}
                        className="w-full text-sm text-gray-500" />
                      {profilePhotoFile && (
                        <p className="text-xs text-green-600 mt-1 font-semibold">✓ {profilePhotoFile.name}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP (Max 5MB)</p>
                    </div>
                  </div>

                  {/* Puja Photos Upload */}
                  <div>
                    <label className={labelCls}>Puja Performance Photos (Max 5)</label>
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 bg-gray-50 hover:bg-white transition-colors">
                      <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" multiple
                        onChange={(e) => setPujaPhotosFiles(Array.from(e.target.files).slice(0, 5))}
                        className="w-full text-sm text-gray-500" />
                      {pujaPhotosFiles.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {pujaPhotosFiles.map((f, i) => (
                            <img key={i} src={URL.createObjectURL(f)}
                              className="w-12 h-12 rounded-lg object-cover border border-orange-200" />
                          ))}
                        </div>
                      )}
                      {pujaPhotosFiles.length === 0 && editData?.pujaPhotos?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {editData.pujaPhotos.map((p, i) => (
                            <img key={i} src={`${import.meta.env.VITE_API_BASE_URL}/${p}`}
                              className="w-12 h-12 rounded-lg object-cover border border-orange-200" />
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP (Max 5 photos, 5MB each)</p>
                    </div>
                  </div>

                  <InputField name="videoLink" label="Video Introduction Link" placeholder="YouTube / Drive link" value={form.videoLink} onChange={handleChange} />
                  <InputField name="socialLink" label="Social Media / YouTube" placeholder="Link to your work" value={form.socialLink} onChange={handleChange} />
                </>)}

                {/* Step 3 - Experience & Pricing */}
                {step === 3 && (<>
                  <InputField name="totalExperience" label="Total Experience (Years)" type="number" placeholder="e.g. 15" required value={form.totalExperience} onChange={handleChange} />
                  <InputField name="trainingGurukul" label="Training / Gurukul Name" placeholder="Where did you study?" required value={form.trainingGurukul} onChange={handleChange} />
                  <SelectField name="specialization" label="Primary Specialization" options={enums.specialization || []} required value={form.specialization} onChange={handleChange} />
                  <SelectField name="vedaSpecialization" label="Veda Specialization" options={enums.vedaSpecialization || []} required value={form.vedaSpecialization} onChange={handleChange} />
                  <InputField name="shakha" label="Shakha" placeholder="e.g. Shaakala, Madhyandina" value={form.shakha} onChange={handleChange} />
                  <InputField name="languagesKnown" label="Languages Known" placeholder="Hindi, Sanskrit, etc." required value={form.languagesKnown} onChange={handleChange} />
                  <div className="sm:col-span-2">
                    <SelectField name="pujaKitProvided" label="Puja Kit (Samagri) Policy" options={enums.pujaKitProvided || []} required value={form.pujaKitProvided} onChange={handleChange} />
                  </div>

                  {/* Puja Multi Select */}
                  <div className="sm:col-span-2">
                    <label className={labelCls}>Select Pujas You Perform *</label>
                    {pujasList.length === 0 ? (
                      <p className="text-xs text-gray-400 p-3 rounded-xl bg-gray-50">Koi puja available nahi hai. Pehle Puja page pe pujas add karo.</p>
                    ) : (
                      <div className="space-y-2 max-h-64 overflow-y-auto p-1 border rounded-xl">
                        {pujasList.map((puja) => {
                          const selection = form.selectedPujas.find((s) => s.puja === puja._id);
                          const isSelected = !!selection;
                          return (
                            <div key={puja._id} className={`p-3 rounded-xl border transition-all ${isSelected ? "border-orange-400 bg-orange-50" : "border-gray-100 bg-white"}`}>
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer" 
                                  onClick={() => {
                                    let updated;
                                    if (isSelected) {
                                      updated = form.selectedPujas.filter((s) => s.puja !== puja._id);
                                    } else {
                                      updated = [...form.selectedPujas, { puja: puja._id, price: 0 }];
                                    }
                                    setForm((prev) => ({ ...prev, selectedPujas: updated }));
                                  }}
                                >
                                  <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${isSelected ? "bg-orange-500" : "bg-gray-200"}`}>
                                    {isSelected && <span className="text-white text-xs">✓</span>}
                                  </div>
                                  <div className="min-w-0">
                                    <p className={`text-sm font-bold truncate ${isSelected ? "text-orange-600" : "text-gray-800"}`}>{puja.pujaType}</p>
                                    <p className="text-xs text-gray-400 truncate">Duration: {puja.duration}</p>
                                  </div>
                                </div>
                                {isSelected && (
                                  <div className="w-32">
                                    <div className="relative">
                                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">₹</span>
                                      <input 
                                        type="number" 
                                        value={selection.price} 
                                        placeholder="Price"
                                        onChange={(e) => {
                                          const val = parseInt(e.target.value) || 0;
                                          const updated = form.selectedPujas.map((s) => 
                                            s.puja === puja._id ? { ...s, price: val } : s
                                          );
                                          setForm((prev) => ({ ...prev, selectedPujas: updated }));
                                        }}
                                        className="w-full pl-7 pr-3 py-1.5 rounded-lg border border-orange-200 text-xs font-bold focus:outline-none focus:border-orange-500"
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {form.selectedPujas.length > 0 && (
                      <p className="text-xs font-semibold mt-1.5" style={{ color: THEME }}>
                        ✓ {form.selectedPujas.length} puja(s) selected
                      </p>
                    )}
                  </div>
                </>)}

                {/* Step 4 - Skills & Quality */}
                {step === 4 && (<>
                  <SelectField name="mantraLevel" label="Mantra Level" options={enums.mantraLevel || []} required value={form.mantraLevel} onChange={handleChange} />
                  <SelectField name="timeDiscipline" label="Time Discipline" options={enums.timeDiscipline || []} required value={form.timeDiscipline} onChange={handleChange} />
                  <SelectField name="dressCode" label="Dress Code" options={enums.dressCode || []} required value={form.dressCode} onChange={handleChange} />
                  <SelectField name="eventHandling" label="Large Event Handling" options={enums.eventHandling || []} required value={form.eventHandling} onChange={handleChange} />
                  <div className="sm:col-span-2">
                    <label className={labelCls + " mb-2"}>Extra Skills</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <CheckField name="bhajanKirtan" label="Bhajan / Kirtan" checked={form.bhajanKirtan} onChange={handleChange} />
                      <CheckField name="astrology" label="Astrology" checked={form.astrology} onChange={handleChange} />
                      <CheckField name="vastu" label="Vastu Shastra" checked={form.vastu} onChange={handleChange} />
                      <CheckField name="havan" label="Special Havan" checked={form.havan} onChange={handleChange} />
                      <CheckField name="corporateExperience" label="Corporate Events" checked={form.corporateExperience} onChange={handleChange} />
                      <CheckField name="onlinePujaSupport" label="E-Puja / Online Puja" checked={form.onlinePujaSupport} onChange={handleChange} />
                    </div>
                  </div>
                </>)}

                {/* Step 5 - Logistics & Payment */}
                {step === 5 && (<>
                  <InputField name="availableCities" label="Available Cities" placeholder="e.g. Varanasi, Lucknow" required value={form.availableCities} onChange={handleChange} />
                  <InputField name="maxDistance" label="Max Travel Distance (KM)" type="number" placeholder="e.g. 100" required value={form.maxDistance} onChange={handleChange} />
                  <SelectField name="availabilityType" label="Availability Type" options={enums.availabilityType || []} required value={form.availabilityType} onChange={handleChange} />
                  <SelectField name="travelWillingness" label="Travel Willingness" options={enums.travelWillingness || []} required value={form.travelWillingness} onChange={handleChange} />
                  <InputField name="availableDays" label="Available Days" placeholder="e.g. Mon-Sat, All Days" value={form.availableDays || ""} onChange={handleChange} />
                  <InputField name="upiId" label="UPI ID" placeholder="name@upi" required value={form.upiId} onChange={handleChange} />
                  <InputField name="bankDetails" label="Bank Details (Acc / IFSC)" placeholder="Acc No, IFSC, Branch" required value={form.bankDetails} onChange={handleChange} />
                  <InputField name="referenceName" label="Reference Name" placeholder="Guru / Senior Pandit" required value={form.referenceName} onChange={handleChange} />
                  <InputField name="referenceContact" label="Reference Contact" placeholder="Reference Mobile" required value={form.referenceContact} onChange={handleChange} />
                  <div className="sm:col-span-2">
                    <CheckField name="emergencyBooking" label="Accept Emergency / Same Day Booking" checked={form.emergencyBooking} onChange={handleChange} />
                  </div>
                  <div className="sm:col-span-2">
                    <CheckField name="declaration" label="I declare all information is true and accurate" checked={form.declaration} onChange={handleChange} />
                  </div>
                </>)}
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-3 pt-5 mt-4 border-t border-gray-100">
                {step > 1 && (
                  <button type="button" onClick={() => setStep((s) => s - 1)}
                    className="flex-1 py-2.5 rounded-xl font-bold text-sm border border-gray-200 text-gray-600 hover:bg-gray-50">
                    ← Back
                  </button>
                )}
                <button type="submit" disabled={submitting}
                  className="flex-[2] py-2.5 rounded-xl font-bold text-sm text-white disabled:opacity-50"
                  style={{ backgroundColor: THEME }}>
                  {submitting ? "Saving..." : step < 5 ? "Continue →" : editData ? "Update Pandit" : "Create Pandit"}
                </button>
>>>>>>> 54351168fd47951aa69da6dcf7208ea9793fd6b4
              </div>
            </form>
          </div>
        </div>
      )}

<<<<<<< HEAD
      {/* ===== VIEW MODAL (ALL DATA) ===== */}
      {viewData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
          <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            
            {/* Header */}
            <div className="relative flex-shrink-0" style={{ background: `linear-gradient(135deg, ${THEME}, ${THEME_DARK})` }}>
              <div className="px-5 pt-5 pb-8">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-white/30 flex-shrink-0 bg-white/20 flex items-center justify-center shadow-lg">
                      {viewData.profilePhoto ? <img src={`${import.meta.env.VITE_API_BASE_URL}/${viewData.profilePhoto}`} className="w-full h-full object-cover" /> : <FaUserCircle className="text-4xl text-white/50" />}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white leading-tight">{viewData.fullName}</h3>
                      <p className="text-xs text-white/80 font-bold uppercase tracking-wider">{viewData.city}, {viewData.district}, {viewData.state}</p>
                      <div className="flex gap-2 mt-1.5">
                         <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${viewData.isActive ? "bg-green-400 text-white" : "bg-red-400 text-white"}`}>{viewData.isActive ? "Active" : "Inactive"}</span>
                         <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-white/20 text-white">{viewData.experience} EXP</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setViewData(null)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/20 transition-all text-white"><FaTimes /></button>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-4 bg-white rounded-t-2xl" />
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 px-6 pb-6 space-y-8">
               
               {/* 1. Essential Points */}
               <section>
                 <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-4 bg-orange-500 rounded-full" />
                    <h4 className="text-xs font-black text-gray-800 uppercase tracking-widest">Essential Information</h4>
                 </div>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      ["Mobile", viewData.mobileNumber], ["WhatsApp", viewData.whatsappNumber || "N/A"],
                      ["Languages", viewData.languages?.join(", ")], ["UPI ID", viewData.bankUpiDetails || "N/A"],
                      ["Service Area", viewData.serviceArea], ["Samagri", viewData.samagriArrangement],
                      ["Kit Exp", viewData.samagriExperience], ["Travel", viewData.travelAvailability],
                      ["Aadhar No", viewData.aadharNumber || "N/A"], ["Gender", viewData.gender || "N/A"],
                      ["Email", viewData.emailId || "N/A"], ["DOB", viewData.dob || "N/A"]
                    ].map(([l, v]) => (
                      <div key={l} className="p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-orange-100 transition-colors">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{l}</p>
                        <p className="text-[11px] font-bold text-gray-700 truncate" title={v}>{v}</p>
                      </div>
                    ))}
                 </div>
               </section>

               {/* 2. Specializations */}
               <section>
                 <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-4 bg-orange-500 rounded-full" />
                    <h4 className="text-xs font-black text-gray-800 uppercase tracking-widest">Specializations & Events</h4>
                 </div>
                 <div className="flex flex-wrap gap-2">
                    {viewData.specializations?.map(s => <span key={s} className="px-3 py-1.5 rounded-xl bg-orange-50 text-orange-600 text-[10px] font-black uppercase border border-orange-100">{s}</span>)}
                    {viewData.liveEventExperience?.map(e => <span key={e} className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 text-[10px] font-black uppercase border border-blue-100">Live: {e}</span>)}
                 </div>
               </section>

               {/* 3. Media & Uploads */}
               <section>
                 <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-4 bg-orange-500 rounded-full" />
                    <h4 className="text-xs font-black text-gray-800 uppercase tracking-widest">Verification Media</h4>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {viewData.introVideo && (
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-gray-400 uppercase flex items-center gap-1.5"><FaVideo /> Intro Video</p>
                        <video controls className="w-full rounded-2xl border bg-black aspect-video shadow-sm">
                          <source src={`${import.meta.env.VITE_API_BASE_URL}/${viewData.introVideo}`} />
                        </video>
                      </div>
                    )}
                    {viewData.idProof && (
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-gray-400 uppercase flex items-center gap-1.5"><FaImage /> ID Proof</p>
                        <div className="w-full aspect-video rounded-2xl border overflow-hidden bg-gray-50 flex items-center justify-center">
                           <img src={`${import.meta.env.VITE_API_BASE_URL}/${viewData.idProof}`} className="w-full h-full object-contain" />
                        </div>
                      </div>
                    )}
                 </div>
                 
                 {viewData.pujaPhotos?.length > 0 && (
                   <div className="mt-6 space-y-2">
                      <p className="text-[10px] font-black text-gray-400 uppercase flex items-center gap-1.5"><FaImage /> Puja Photos ({viewData.pujaPhotos.length})</p>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                         {viewData.pujaPhotos.map((p, idx) => (
                           <div key={idx} className="aspect-square rounded-xl border overflow-hidden bg-gray-50 shadow-sm hover:scale-105 transition-all">
                              <img src={`${import.meta.env.VITE_API_BASE_URL}/${p}`} className="w-full h-full object-cover" />
                           </div>
                         ))}
                      </div>
                   </div>
                 )}
               </section>
=======
      {/* ===== VIEW MODAL ===== */}
      {viewData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">

            {/* Header with Profile */}
            <div className="relative flex-shrink-0" style={{ background: `linear-gradient(135deg, ${THEME}, #c9541a)` }}>
              <div className="px-6 pt-6 pb-10">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    {/* Profile Photo */}
                    <div className="w-16 h-16 rounded-2xl border-2 border-white/40 overflow-hidden bg-white/20 flex items-center justify-center flex-shrink-0">
                      {viewData.profilePhoto
                        ? <img src={`${import.meta.env.VITE_API_BASE_URL}/${viewData.profilePhoto.replace(/\\/g, "/")}`} className="w-full h-full object-cover" />
                        : <span className="text-2xl font-black text-white">{viewData.fullName?.charAt(0)}</span>
                      }
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white">{viewData.fullName}</h3>
                      <p className="text-xs text-white/80 mt-0.5">{viewData.emailId}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white">{viewData.specialization}</span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white">{viewData.totalExperience} yrs exp</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${viewData.isActive ? "bg-green-400/30 text-green-100" : "bg-red-400/30 text-red-100"}`}>
                          {viewData.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setViewData(null)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold hover:bg-white/20 transition-all">
                    ✕
                  </button>
                </div>
              </div>
              {/* Wave bottom */}
              <div className="absolute bottom-0 left-0 right-0 h-5 bg-white rounded-t-3xl" />
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 px-6 pb-6 space-y-5">

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Mobile", value: viewData.mobileNumber },
                  { label: "City", value: viewData.city },
                  { label: "Pincode", value: viewData.pincode },
                ].map(({ label, value }) => (
                  <div key={label} className="text-center p-3 rounded-2xl" style={{ backgroundColor: THEME_LIGHT }}>
                    <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                    <p className="text-sm font-bold text-gray-800">{value || "—"}</p>
                  </div>
                ))}
              </div>

              {/* Section Component */}
              {[{
                title: "👤 Basic Details",
                fields: [
                  ["Full Name", viewData.fullName],
                  ["Alternate Mobile", viewData.alternateNumber || "—"],
                  ["Date of Birth", viewData.dob],
                  ["Gender", viewData.gender],
                  ["Gotra", viewData.gotra || "—"],
                ]
              }, {
                title: "📍 Address",
                fields: [
                  ["Current Address", viewData.currentAddress, true],
                  ["Permanent Address", viewData.permanentAddress, true],
                ]
              }, {
                title: "🪪 Identity",
                fields: [
                  ["Aadhar Number", viewData.aadharNumber],
                  ["PAN Number", viewData.panNumber || "—"],
                  ["Video Link", viewData.videoLink || "—"],
                  ["Social Link", viewData.socialLink || "—"],
                ]
              }, {
                title: "🎓 Experience & Pricing",
                fields: [
                  ["Total Experience", `${viewData.totalExperience} yrs`],
                  ["Gurukul / Training", viewData.trainingGurukul],
                  ["Veda Specialization", viewData.vedaSpecialization],
                  ["Shakha", viewData.shakha || "—"],
                  ["Languages Known", viewData.languagesKnown],
                  ["Puja Kit Policy", viewData.pujaKitProvided],
                ]
              }, {
                title: "⭐ Skills & Quality",
                fields: [
                  ["Mantra Level", viewData.mantraLevel],
                  ["Time Discipline", viewData.timeDiscipline],
                  ["Dress Code", viewData.dressCode],
                  ["Event Handling", viewData.eventHandling],
                ]
              }, {
                title: "🚗 Logistics & Payment",
                fields: [
                  ["Available Cities", viewData.availableCities],
                  ["Available Days", viewData.availableDays || "—"],
                  ["Max Distance", `${viewData.maxDistance} km`],
                  ["Availability Type", viewData.availabilityType],
                  ["Travel Willingness", viewData.travelWillingness],
                  ["Emergency Booking", viewData.emergencyBooking ? "✓ Yes" : "✗ No"],
                  ["UPI ID", viewData.upiId],
                  ["Bank Details", viewData.bankDetails],
                  ["Reference Name", viewData.referenceName],
                  ["Reference Contact", viewData.referenceContact],
                  ["Declaration", viewData.declaration ? "✓ Accepted" : "✗ Not Accepted"],
                ]
              }].map(({ title, fields }) => (
                <div key={title}>
                  <h4 className="text-xs font-black uppercase tracking-wider mb-3 flex items-center gap-2"
                    style={{ color: THEME }}>{title}</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {fields.map(([label, value, full]) => (
                      <div key={label}
                        className={`p-3 rounded-2xl ${full ? "col-span-2" : ""}`}
                        style={{ backgroundColor: THEME_LIGHT }}>
                        <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                        <p className="text-xs font-semibold text-gray-800 break-words leading-relaxed">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Selected Pujas & Pricing */}
              {viewData.selectedPujas?.length > 0 && (
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider mb-3" style={{ color: THEME }}>🙏 Selected Pujas & Pricing</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {viewData.selectedPujas.map((s, idx) => (
                      <div key={idx} className="p-3 rounded-2xl flex items-center justify-between" style={{ backgroundColor: THEME_LIGHT }}>
                        <div>
                          <p className="text-xs font-bold text-gray-800">{s.puja?.pujaType || s.puja?.pujaName || "Puja"}</p>
                          <p className="text-[10px] text-gray-400">{s.puja?.duration}</p>
                        </div>
                        <span className="text-sm font-black" style={{ color: THEME }}>₹{s.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Extra Skills */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider mb-3" style={{ color: THEME }}>🛠️ Extra Skills</h4>
                <div className="grid grid-cols-3 gap-2">
                  {[["Bhajan/Kirtan", viewData.bhajanKirtan], ["Astrology", viewData.astrology],
                  ["Vastu", viewData.vastu], ["Havan", viewData.havan],
                  ["Corporate", viewData.corporateExperience], ["Online Puja", viewData.onlinePujaSupport]
                  ].map(([label, val]) => (
                    <div key={label} className="flex items-center gap-2 p-2.5 rounded-xl"
                      style={{ backgroundColor: val ? "#16a34a15" : "#f3f4f6" }}>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${val ? "bg-green-500 text-white" : "bg-gray-300 text-gray-500"}`}>
                        {val ? "✓" : "✗"}
                      </div>
                      <span className={`text-xs font-semibold ${val ? "text-green-700" : "text-gray-400"}`}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Aadhar Card Image */}
              {viewData.aadharCardImage && (
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider mb-3" style={{ color: THEME }}>🪪 Aadhar Card</h4>
                  {viewData.aadharCardImage.endsWith(".pdf") ? (
                    <a
                      href={`${import.meta.env.VITE_API_BASE_URL}/${viewData.aadharCardImage.replace(/\\/g, "/")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 p-4 rounded-2xl border border-dashed border-orange-300 hover:bg-orange-50 transition-all"
                      style={{ backgroundColor: THEME_LIGHT }}>
                      <span className="text-2xl">📄</span>
                      <div>
                        <p className="text-sm font-bold text-gray-800">Aadhar Card PDF</p>
                        <p className="text-xs text-orange-500">Click to open PDF</p>
                      </div>
                    </a>
                  ) : (
                    <img
                      src={`${import.meta.env.VITE_API_BASE_URL}/${viewData.aadharCardImage.replace(/\\/g, "/")}`}
                      alt="Aadhar Card"
                      className="w-full rounded-2xl border border-gray-100 shadow-sm"
                      onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
                    />
                  )}
                  <div className="hidden items-center gap-2 p-3 rounded-xl bg-red-50 mt-2">
                    <span className="text-red-400 text-xs">⚠ Image load nahi hui</span>
                  </div>
                </div>
              )}

              {/* Puja Photos */}
              {viewData.pujaPhotos?.length > 0 && (
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider mb-3" style={{ color: THEME }}>📸 Puja Photos</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {viewData.pujaPhotos.map((p, i) => (
                      <img key={i}
                        src={`${import.meta.env.VITE_API_BASE_URL}/${p.replace(/\\/g, "/")}`}
                        className="w-full aspect-square rounded-2xl object-cover border border-gray-100 shadow-sm"
                        onError={(e) => { e.target.src = ""; e.target.style.background = "#f3f4f6"; }}
                      />
                    ))}
                  </div>
                </div>
              )}
>>>>>>> 54351168fd47951aa69da6dcf7208ea9793fd6b4

            </div>

            {/* Footer */}
<<<<<<< HEAD
            <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0 flex gap-3">
               <button onClick={() => handleWhatsApp(viewData)} className="flex-1 py-3 rounded-xl bg-green-500 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-green-100 hover:bg-green-600 transition-all"><FaWhatsapp size={16} /> WhatsApp Pandit</button>
               <button onClick={() => setViewData(null)} className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all">Close Details</button>
=======
            <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0">
              <button onClick={() => setViewData(null)}
                className="w-full py-3 rounded-2xl font-bold text-sm text-white transition-all hover:opacity-90"
                style={{ backgroundColor: THEME }}>Close</button>
>>>>>>> 54351168fd47951aa69da6dcf7208ea9793fd6b4
            </div>

          </div>
        </div>
      )}

<<<<<<< HEAD
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
=======
      {/* ===== DELETE MODAL ===== */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🗑️</span>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">Delete Pandit?</h3>
            <p className="text-sm text-gray-400 mb-5">Yeh action undo nahi hoga.</p>
            <div className="flex gap-3">
              <button onClick={handleDelete} className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white bg-red-500 hover:bg-red-600">Delete</button>
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl font-bold text-sm border border-gray-200 text-gray-500">Cancel</button>
>>>>>>> 54351168fd47951aa69da6dcf7208ea9793fd6b4
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
