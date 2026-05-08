import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import {
  getAllPandits, createPandit, updatePandit,
  deletePandit, togglePandit, getEnums,
} from "../services/panditService";
import { FaEye, FaEdit, FaTrash, FaPlus, FaWhatsapp, FaTimes, FaSearch, FaInbox, FaVideo, FaImage, FaCheckCircle, FaUserCircle } from "react-icons/fa";
import PanditCharts from "../components/PanditCharts";

const THEME = "#E8621A";
const THEME_LIGHT = "#fff4ee";
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
  basicPujaCharges: "", akhandPaathCharges: "", perDayCharges: "", travelCharges: "",
  mantraLevel: "", timeDiscipline: "", dressCode: "", eventHandling: "",
  bhajanKirtan: false, astrology: false, vastu: false, havan: false, corporateExperience: false,
  availableCities: [], travelWillingness: "", maxDistance: "",
  availabilityType: "", availableDays: [], emergencyBooking: "",
  bankDetails: "", declaration: false,
};

const inputCls = "w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400 bg-white text-gray-700 placeholder:text-gray-300";
const labelCls = "block text-xs font-semibold text-gray-500 mb-1.5";

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
  <label className="flex items-center gap-2 cursor-pointer">
    <input type="checkbox" name={name} checked={checked} onChange={onChange} className="w-4 h-4 accent-orange-500" />
    <span className="text-xs font-bold text-gray-600">{label}</span>
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
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [viewData, setViewData] = useState(null);
  const [step, setStep] = useState(1);
  const [search, setSearch] = useState("");

  const fetchAll = async () => {
    setLoading(true);
    const [data, enumData] = await Promise.all([getAllPandits(token), getEnums()]);
    setPandits(Array.isArray(data) ? data : []);
    setEnums(enumData);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const openCreate = () => { setEditData(null); setForm(EMPTY); setStep(1); setShowModal(true); };
  const openEdit = (p) => { setEditData(p); setForm({ ...EMPTY, ...p }); setStep(1); setShowModal(true); };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

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

  const handleToggle = async (id) => {
    const res = await togglePandit(token, id);
    if (res.message) {
      toast.success(res.message);
      setPandits(pandits.map(p => p._id === id ? { ...p, isActive: !p.isActive } : p));
    }
  };

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
        </button>
      </div>

      {/* Charts */}
      {!loading && pandits.length > 0 && <PanditCharts pandits={pandits} />}

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
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-32">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2" style={{ borderColor: THEME }} />
        </div>
      ) : filtered.length === 0 ? (
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
                  <th key={h} className="px-4 py-3.5 text-left text-xs font-bold text-white whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
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
                      {p.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex gap-1.5">
                      <button onClick={() => handleWhatsApp(p)} title="WhatsApp" className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110 bg-green-50 text-green-600 border border-green-100"><FaWhatsapp /></button>
                      <button onClick={() => setViewData(p)} title="View" className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110" style={{ backgroundColor: THEME_LIGHT, color: THEME }}><FaEye /></button>
                      <button onClick={() => openEdit(p)} title="Edit" className="w-8 h-8 rounded-lg flex items-center justify-center border transition-all hover:scale-110" style={{ borderColor: "#f97316", color: "#f97316", backgroundColor: "#fff7ed" }}><FaEdit /></button>
                      <button onClick={() => setDeleteId(p._id)} title="Delete" className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110" style={{ backgroundColor: "#fef2f2", color: "#ef4444" }}><FaTrash /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
              </div>
            </form>
          </div>
        </div>
      )}

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

            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0 flex gap-3">
               <button onClick={() => handleWhatsApp(viewData)} className="flex-1 py-3 rounded-xl bg-green-500 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-green-100 hover:bg-green-600 transition-all"><FaWhatsapp size={16} /> WhatsApp Pandit</button>
               <button onClick={() => setViewData(null)} className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all">Close Details</button>
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
