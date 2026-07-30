import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { FaBell, FaPaperPlane, FaMagic, FaUser } from "react-icons/fa";
import { sendNotification, triggerRashiNotifications } from "../services/adminService";
import { getAllUsers } from "../services/userService";

const THEME = "#E8621A";
const THEME_LIGHT = "#fff4ee";
const THEME_DARK = "#c9541a";

export default function Notifications() {
  const { token } = useAuth();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [userId, setUserId] = useState("all");
  const [loading, setLoading] = useState(false);
  const [triggerLoading, setTriggerLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await getAllUsers(token);
      if (data.success) {
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error("Failed to fetch users", error);
    }
  };

  const handleTriggerRashi = async () => {
    if (window.confirm("Are you sure you want to trigger today's daily Rashi notifications now?")) {
      setTriggerLoading(true);
      try {
        const data = await triggerRashiNotifications(token);
        if (data.success) {
          toast.success(data.message || "Rashi notifications triggered successfully!");
        } else {
          toast.error(data.message || "Failed to trigger rashi notifications.");
        }
      } catch (error) {
        console.error(error);
        toast.error(error.message || "An error occurred.");
      } finally {
        setTriggerLoading(false);
      }
    }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      toast.error("Title and body are required!");
      return;
    }

    setLoading(true);
    try {
      const data = await sendNotification(token, { title, body, userId });

      if (data.success) {
        toast.success(`Notification sent! Success: ${data.successCount}, Failed: ${data.failureCount}`);
        setTitle("");
        setBody("");
        setUserId("all");
      } else {
        toast.error(data.message || "Failed to send notification.");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || "An error occurred while sending notification.");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const term = searchTerm.toLowerCase();
    const name = (user.name || "").toLowerCase();
    const email = (user.email || "").toLowerCase();
    const mobile = (user.mobile || "").toLowerCase();
    return name.includes(term) || email.includes(term) || mobile.includes(term);
  });

  const selectedUserObj = userId === 'all' ? null : users.find(u => u._id === userId);
  const displaySelectedUser = selectedUserObj ? `${selectedUserObj.name || 'Unknown'} (${selectedUserObj.mobile || 'No Mobile'})` : "All Users";

  return (
    <div className="min-h-screen p-3 pt-8 sm:p-4 sm:pt-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
        <div className="pl-1">
          <div className="flex items-center gap-2">
            <FaBell className="text-xl" style={{ color: THEME }} />
            <h2 className="text-lg sm:text-2xl font-bold text-gray-800">App Notifications</h2>
          </div>
          <p className="text-xs text-gray-400 mt-1">Manage and send push notifications to users.</p>
        </div>
        
        <button
          onClick={handleTriggerRashi}
          disabled={triggerLoading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {triggerLoading ? (
             <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white" />
          ) : (
            <FaMagic />
          )}
          Send Today's Rashi Notifications
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden max-w-2xl">
        <div className="px-6 py-4" style={{ background: `linear-gradient(135deg, ${THEME}, ${THEME_DARK})` }}>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FaPaperPlane /> Compose Custom Notification
          </h3>
        </div>
        
        <form onSubmit={handleSendNotification} className="p-6">
          <div className="space-y-5">
            <div className="relative">
              <label className="block text-xs font-bold text-gray-600 mb-1">Select User</label>
              
              <div 
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white cursor-pointer flex justify-between items-center"
                style={{ borderColor: userId !== 'all' ? THEME : '#e5e7eb' }}
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <span className="truncate">{displaySelectedUser}</span>
                <span className="text-gray-400 text-xs">▼</span>
              </div>

              {dropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                  <div className="p-2 border-b border-gray-100">
                    <input
                      type="text"
                      placeholder="Search by name, email, or number..."
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    <div 
                      className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-50 ${userId === 'all' ? 'bg-orange-50 font-medium' : ''}`}
                      onClick={() => {
                        setUserId("all");
                        setDropdownOpen(false);
                        setSearchTerm("");
                      }}
                    >
                      All Users
                    </div>
                    {filteredUsers.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-gray-500 text-center">No users found</div>
                    ) : (
                      filteredUsers.map(user => (
                        <div 
                          key={user._id}
                          className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-50 border-t border-gray-50 ${userId === user._id ? 'bg-orange-50 font-medium' : ''}`}
                          onClick={() => {
                            setUserId(user._id);
                            setDropdownOpen(false);
                            setSearchTerm("");
                          }}
                        >
                          <div className="font-medium">{user.name || 'Unknown'}</div>
                          <div className="text-xs text-gray-500 flex gap-2">
                            <span>{user.mobile || 'No Mobile'}</span>
                            {user.email && <span>• {user.email}</span>}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Notification Title</label>
              <input
                type="text"
                placeholder="e.g. Special Puja Offer!"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none"
                onFocus={(e) => e.target.style.borderColor = THEME}
                onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Notification Message (Body)</label>
              <textarea
                placeholder="Enter the detailed message here..."
                required
                rows={4}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none resize-none"
                onFocus={(e) => e.target.style.borderColor = THEME}
                onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
              ></textarea>
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-6 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 disabled:opacity-70 disabled:cursor-not-allowed" 
            style={{ backgroundColor: THEME }}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white" />
                Sending...
              </>
            ) : (
              <>
                <FaPaperPlane /> Send Notification Now
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
