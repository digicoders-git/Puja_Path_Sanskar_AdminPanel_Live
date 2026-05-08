import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { FaUserCircle, FaEdit, FaLock, FaEnvelope, FaShieldAlt, FaCalendarAlt, FaSave, FaTimes, FaCamera } from "react-icons/fa";
import { getProfile, updateProfile, changePassword } from "../services/adminService";

const BASE = import.meta.env.VITE_API_BASE_URL;
const THEME = "#E8621A";
const THEME_LIGHT = "#fff4ee";
const THEME_DARK = "#c9541a";

const InputField = ({ label, type = "text", value, onChange, required }) => (
  <div>
    <label className="block text-xs font-semibold mb-1.5" style={{ color: "#555" }}>{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none transition-all"
      style={{ borderColor: "#e0e0e0", backgroundColor: "#fafafa", color: "#222" }}
      onFocus={e => e.target.style.borderColor = THEME}
      onBlur={e => e.target.style.borderColor = "#e0e0e0"}
    />
  </div>
);

export default function Profile() {
  const { token, setLoginData, admin } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("info");

  const [form, setForm] = useState({ name: "", email: "" });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [pwd, setPwd] = useState({ oldPassword: "", newPassword: "", confirm: "" });
  const [pwdSubmitting, setPwdSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await getProfile(token);
      setProfile(data);
      setForm({ name: data.name || "", email: data.email || "" });
      setLoading(false);
    })();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("email", form.email);
    if (imageFile) fd.append("image", imageFile);
    const res = await updateProfile(token, fd);
    if (res._id) {
      toast.success("Profile updated successfully!");
      setLoginData({ ...admin, name: res.name, email: res.email, token });
      setProfile(res);
      setActiveTab("info");
      setImageFile(null);
      setImagePreview(null);
    } else {
      toast.error(res.message || "Update failed");
    }
    setSubmitting(false);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (pwd.newPassword !== pwd.confirm) { toast.error("Passwords do not match!"); return; }
    setPwdSubmitting(true);
    const res = await changePassword(token, { oldPassword: pwd.oldPassword, newPassword: pwd.newPassword });
    if (res.message === "Password changed successfully") {
      toast.success("Password changed!");
      setActiveTab("info");
      setPwd({ oldPassword: "", newPassword: "", confirm: "" });
    } else {
      toast.error(res.message || "Failed");
    }
    setPwdSubmitting(false);
  };

  const avatarSrc = imagePreview ? imagePreview : profile?.image ? `${BASE}/${profile.image}` : null;

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 mx-auto mb-3" style={{ borderColor: THEME }} />
        <p className="text-sm text-gray-400">Loading profile...</p>
      </div>
    </div>
  );

  const infoItems = [
    { icon: FaUserCircle, label: "Full Name", value: profile?.name },
    { icon: FaEnvelope, label: "Email Address", value: profile?.email },
    { icon: FaShieldAlt, label: "Role", value: "Administrator" },
    { icon: FaCalendarAlt, label: "Member Since", value: profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "—" },
  ];

  const tabs = [
    { key: "info", label: "Profile Info" },
    { key: "edit", label: "Edit Profile", icon: FaEdit },
    { key: "password", label: "Password", icon: FaLock },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto px-3 sm:px-0 pt-4 sm:py-2">

      {/* Top Banner Card */}
      <div className="rounded-2xl mb-4 overflow-hidden shadow-md">
        {/* Orange banner */}
        <div className="h-20 sm:h-24" style={{ background: `linear-gradient(135deg, ${THEME}, ${THEME_DARK})` }} />

        {/* Avatar + info */}
        <div className="bg-white px-4 sm:px-6 pb-4 sm:pb-5">
          <div className="flex items-end gap-3 sm:gap-4 -mt-10 sm:-mt-12 mb-2 sm:mb-3">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-4 flex items-center justify-center"
                style={{ borderColor: "#ffffff", backgroundColor: THEME_LIGHT }}
              >
                {avatarSrc
                  ? <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" />
                  : <FaUserCircle className="text-4xl sm:text-5xl" style={{ color: THEME }} />
                }
              </div>
              <span className="absolute bottom-0.5 right-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border-2 border-white bg-green-500" />
            </div>

            {/* Name + email */}
            <div className="pb-1 min-w-0 flex-1">
              <h2 className="text-base sm:text-lg font-bold text-gray-800 truncate">{profile?.name}</h2>
              <p className="text-xs text-gray-500 truncate">{profile?.email}</p>
            </div>

            {/* Badge */}
            <span
              className="mb-1 px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0"
              style={{ backgroundColor: THEME_LIGHT, color: THEME }}
            >
              Admin
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl overflow-hidden mb-4 shadow-sm border border-gray-100">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="flex-1 py-2.5 text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1"
            style={{
              backgroundColor: activeTab === tab.key ? THEME : "#ffffff",
              color: activeTab === tab.key ? "#ffffff" : "#888",
            }}
          >
            {tab.icon && <tab.icon className="text-xs" />}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="rounded-2xl border border-gray-100 p-4 sm:p-6 bg-white shadow-sm">

        {/* INFO TAB */}
        {activeTab === "info" && (
          <div className="space-y-2.5 sm:space-y-3">
            {infoItems.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 p-3 sm:p-3.5 rounded-xl" style={{ backgroundColor: THEME_LIGHT }}>
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: THEME + "25" }}>
                  <Icon className="text-xs sm:text-sm" style={{ color: THEME }} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs mb-0.5 text-gray-400">{label}</p>
                  <p className="text-sm font-semibold text-gray-800 truncate">{value}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* EDIT TAB */}
        {activeTab === "edit" && (
          <form onSubmit={handleProfileSubmit} className="space-y-3 sm:space-y-4">
            <InputField label="Full Name" value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} required />
            <InputField label="Email Address" type="email" value={form.email} onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))} required />

            {/* Image Upload */}
            <div>
              <label className="block text-xs font-semibold mb-1.5 text-gray-500">Profile Photo</label>
              <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100" style={{ backgroundColor: THEME_LIGHT }}>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0" style={{ backgroundColor: THEME + "25" }}>
                  {imagePreview
                    ? <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                    : <FaUserCircle className="text-xl sm:text-2xl" style={{ color: THEME }} />
                  }
                </div>
                <label className="cursor-pointer px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5"
                  style={{ borderColor: THEME, color: THEME }}>
                  <FaCamera className="text-xs" /> Choose Photo
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>
            </div>

            <div className="flex gap-2 sm:gap-3 pt-1">
              <button type="submit" disabled={submitting}
                className="flex-1 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 text-white"
                style={{ backgroundColor: THEME }}>
                <FaSave className="text-xs" />
                {submitting ? "Saving..." : "Save Changes"}
              </button>
              <button type="button" onClick={() => { setActiveTab("info"); setImagePreview(null); setImageFile(null); }}
                className="flex-1 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 border text-gray-500"
                style={{ borderColor: "#e0e0e0" }}>
                <FaTimes className="text-xs" /> Cancel
              </button>
            </div>
          </form>
        )}

        {/* PASSWORD TAB */}
        {activeTab === "password" && (
          <form onSubmit={handlePasswordSubmit} className="space-y-3 sm:space-y-4">
            {[
              { key: "oldPassword", label: "Current Password" },
              { key: "newPassword", label: "New Password" },
              { key: "confirm", label: "Confirm New Password" },
            ].map(({ key, label }) => (
              <InputField key={key} label={label} type="password" value={pwd[key]}
                onChange={(e) => setPwd(p => ({ ...p, [key]: e.target.value }))} required />
            ))}

            <div className="flex gap-2 sm:gap-3 pt-1">
              <button type="submit" disabled={pwdSubmitting}
                className="flex-1 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 text-white"
                style={{ backgroundColor: THEME }}>
                <FaLock className="text-xs" />
                {pwdSubmitting ? "Updating..." : "Update Password"}
              </button>
              <button type="button" onClick={() => { setActiveTab("info"); setPwd({ oldPassword: "", newPassword: "", confirm: "" }); }}
                className="flex-1 py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 border text-gray-500"
                style={{ borderColor: "#e0e0e0" }}>
                <FaTimes className="text-xs" /> Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
