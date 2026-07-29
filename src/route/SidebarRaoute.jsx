import { lazy } from "react";
import { FaTachometerAlt, FaUserTie, FaUserCircle, FaEnvelope, FaPrayingHands, FaUsers, FaCalendarAlt, FaRegClipboard, FaTag, FaStar, FaPhoneAlt, FaBell } from "react-icons/fa";

const Dashboard = lazy(() => import("../pages/Dashboard"));
const Pandit = lazy(() => import("../pages/Pandit"));
const Profile = lazy(() => import("../pages/Profile"));
const Contact = lazy(() => import("../pages/Contact"));
const Puja = lazy(() => import("../pages/Puja"));
const Users = lazy(() => import("../pages/Users"));
const Bookings = lazy(() => import("../pages/Bookings"));
const Interests = lazy(() => import("../pages/Interests"));
const Offers = lazy(() => import("../pages/Offers"));
const Astrologers = lazy(() => import("../pages/Astrologers"));
const Consultations = lazy(() => import("../pages/Consultations"));
const ViewAstrologer = lazy(() => import("../pages/ViewAstrologer"));
const Notifications = lazy(() => import("../pages/Notifications"));

const routes = [
  { path: "/dashboard", component: Dashboard, name: "Dashboard", icon: FaTachometerAlt },
  { path: "/bookings", component: Bookings, name: "Bookings", icon: FaCalendarAlt },
  { path: "/interests", component: Interests, name: "Leads", icon: FaRegClipboard },
  { path: "/users", component: Users, name: "Users", icon: FaUsers },
  { path: "/pandits", component: Pandit, name: "Pandits", icon: FaUserTie },
  { path: "/pujas", component: Puja, name: "Pujas", icon: FaPrayingHands },
  { path: "/astrologers", component: Astrologers, name: "Astrologers", icon: FaStar },
  { path: "/consultations", component: Consultations, name: "Consultations", icon: FaPhoneAlt },
  { path: "/offers", component: Offers, name: "Offers", icon: FaTag },
  { path: "/contacts", component: Contact, name: "Contacts", icon: FaEnvelope },
  { path: "/notifications", component: Notifications, name: "Notifications", icon: FaBell },
  { path: "/profile", component: Profile, name: "Profile", icon: FaUserCircle },
  { path: "/astrologers/view/:id", component: ViewAstrologer, name: "View Astrologer", hide: true },
];

export default routes;
