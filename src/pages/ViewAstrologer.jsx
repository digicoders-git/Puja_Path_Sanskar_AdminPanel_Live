import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaStar, FaArrowLeft, FaUserTie, FaSun } from 'react-icons/fa';
import { toast } from 'sonner';

const BASE = import.meta.env.VITE_API_BASE_URL;
const THEME = "#E8621A";
const THEME_LIGHT = "#fff4ee";
const THEME_DARK = "#c9541a";

export default function ViewAstrologer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [astrologer, setAstrologer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAstrologer = async () => {
      try {
        const token = localStorage.getItem("admin-token");
        const h = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch(`${BASE}/api/astrologers/admin/all`, { headers: h });
        const data = await res.json();
        const found = (data.astrologers || []).find(a => a._id === id);
        if (found) setAstrologer(found);
        else toast.error("Astrologer not found");
      } catch (err) {
        toast.error("Failed to load astrologer details");
      } finally {
        setLoading(false);
      }
    };
    fetchAstrologer();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2" style={{ borderColor: THEME }}></div>
      </div>
    );
  }

  if (!astrologer) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold text-gray-700">Astrologer not found</h2>
        <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 text-white rounded-lg transition-all hover:opacity-90" style={{ backgroundColor: THEME }}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-800 mb-6 transition-all">
        <FaArrowLeft /> Back to Astrologers
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-orange-100 flex items-center justify-center text-5xl text-orange-600 shadow-sm border border-orange-200 overflow-hidden shrink-0">
            {astrologer.image ? (
              <img
                src={astrologer.image}
                alt="pic"
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement.innerHTML = '<span class="text-orange-600 font-bold"><svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 448 512" height="56" width="56" xmlns="http://www.w3.org/2000/svg"><path d="M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-41.6c0-74.2-60.2-134.4-134.4-134.4z"></path></svg></span>'; }}
              />
            ) : (
              <FaUserTie className="text-orange-600" />
            )}
          </div>
          
          <div className="flex-1 space-y-4 w-full">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {astrologer.name} 
                {astrologer.isVerified && <FaCheckCircle className="inline text-green-500 text-2xl ml-2" />}
              </h1>
              <p className="text-lg text-gray-500 font-medium mt-1">{astrologer.specialty}</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <span className={`px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 ${astrologer.status === 'online' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                {astrologer.status === 'online' ? <FaCheckCircle /> : <FaTimesCircle />}
                {astrologer.status === 'online' ? 'Online' : 'Offline'}
              </span>
              <span className="text-sm font-bold text-yellow-600 flex items-center gap-1 bg-yellow-50 px-3 py-1.5 rounded-full border border-yellow-100">
                <FaStar /> {astrologer.rating} ({astrologer.reviews} reviews)
              </span>
              {astrologer.badge && (
                <span className="text-sm font-bold px-3 py-1.5 rounded-full text-white" style={{ backgroundColor: astrologer.badgeColor || THEME }}>
                  {astrologer.badge}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-gray-50 p-5 rounded-xl border border-gray-100 mt-6 w-full">
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Experience</p>
                <p className="font-semibold text-gray-800">{astrologer.experience}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Languages</p>
                <p className="font-semibold text-gray-800">{astrologer.languages}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Location</p>
                <p className="font-semibold text-gray-800">{astrologer.location || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Base Fees</p>
                <p className="font-semibold text-gray-800">₹{astrologer.fees}/min</p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 w-full">
              <h3 className="text-lg font-bold text-gray-800 mb-2">About Astrologer</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{astrologer.bio || 'No bio available.'}</p>
            </div>

            <div className="pt-4 border-t border-gray-100 w-full">
              <h3 className="text-lg font-bold text-gray-800 mb-3">Consultation Modes</h3>
              <div className="flex flex-wrap gap-2">
                {astrologer.consultationModes?.map((mode, i) => (
                  <span key={i} className="px-4 py-2 bg-white border border-gray-200 shadow-sm rounded-xl text-sm font-semibold text-gray-700">{mode}</span>
                ))}
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-100 w-full">
              <h3 className="text-lg font-bold text-gray-800 mb-3">Services</h3>
              <div className="flex flex-wrap gap-3">
                {astrologer.services?.map((srv, i) => (
                  <div key={i} className="flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-100 rounded-xl text-sm font-semibold text-gray-800">
                    <span className="text-orange-500 text-sm"><FaSun /></span>
                    {srv.name || srv}
                  </div>
                ))}
              </div>
            </div>

            {astrologer.plans && astrologer.plans.length > 0 && (
              <div className="pt-4 border-t border-gray-100 w-full">
                <h3 className="text-lg font-bold text-gray-800 mb-3">Consultation Plans</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {astrologer.plans.map((plan, i) => (
                    <div key={i} className={`p-4 rounded-xl border ${plan.popular ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-white'} relative`}>
                      {plan.popular && (
                        <span className="absolute top-0 right-0 transform translate-x-2 -translate-y-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                          Popular
                        </span>
                      )}
                      <h4 className="font-bold text-gray-800 text-base">{plan.name}</h4>
                      <div className="flex items-end gap-2 mt-1 mb-3">
                        <span className="text-2xl font-bold" style={{ color: THEME }}>₹{plan.price}</span>
                        <span className="text-sm font-semibold text-gray-500 mb-1">/ {plan.duration} mins</span>
                      </div>
                      <ul className="space-y-2">
                        {plan.features?.map((f, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-gray-600 font-medium">
                            <FaCheckCircle className="text-green-500 shrink-0 mt-0.5" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {astrologer.availability && astrologer.availability.length > 0 && (
              <div className="pt-4 border-t border-gray-100 w-full">
                <h3 className="text-lg font-bold text-gray-800 mb-3">Availability</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {astrologer.availability.map((avail, i) => (
                    <div key={i} className="flex flex-col bg-gray-50 border border-gray-100 rounded-xl p-3">
                      <span className="text-sm font-bold text-gray-700 uppercase">{avail.day}</span>
                      <span className="text-sm text-gray-600 font-semibold mt-1">
                        {avail.startTime} - {avail.endTime}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
