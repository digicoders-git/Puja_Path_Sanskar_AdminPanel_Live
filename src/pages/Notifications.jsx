import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { FaBell, FaPaperPlane } from "react-icons/fa";
import { sendNotification } from "../services/adminService";

const THEME = "#E8621A";
const THEME_LIGHT = "#fff4ee";
const THEME_DARK = "#c9541a";

export default function Notifications() {
  const { token } = useAuth();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      toast.error("Title and body are required!");
      return;
    }

    setLoading(true);
    try {
      const data = await sendNotification(token, { title, body });

      if (data.success) {
        toast.success(`Notification sent! Success: ${data.successCount}, Failed: ${data.failureCount}`);
        setTitle("");
        setBody("");
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

  return (
    <div className="min-h-screen p-3 pt-8 sm:p-4 sm:pt-4">
      {/* Page Header */}
      <div className="flex flex-col gap-2 mb-5">
        <div className="pl-1">
          <div className="flex items-center gap-2">
            <FaBell className="text-xl" style={{ color: THEME }} />
            <h2 className="text-lg sm:text-2xl font-bold text-gray-800">Send App Notification</h2>
          </div>
          <p className="text-xs text-gray-400 mt-1">Send a push notification to all app users immediately.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden max-w-2xl">
        <div className="px-6 py-4" style={{ background: `linear-gradient(135deg, ${THEME}, ${THEME_DARK})` }}>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FaPaperPlane /> Compose Notification
          </h3>
        </div>
        
        <form onSubmit={handleSendNotification} className="p-6">
          <div className="space-y-5">
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
