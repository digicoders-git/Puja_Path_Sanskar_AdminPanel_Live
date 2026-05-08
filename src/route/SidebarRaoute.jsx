import { lazy } from "react";
import { FaTachometerAlt, FaUserTie, FaUserCircle, FaEnvelope, FaPrayingHands, FaUsers, FaCalendarAlt, FaRegClipboard, FaTag } from "react-icons/fa";

const Dashboard = lazy(() => import("../pages/Dashboard"));
const Pandit = lazy(() => import("../pages/Pandit"));
const Profile = lazy(() => import("../pages/Profile"));
const Contact = lazy(() => import("../pages/Contact"));
const Puja = lazy(() => import("../pages/Puja"));
const Users = lazy(() => import("../pages/Users"));
const Bookings = lazy(() => import("../pages/Bookings"));
const Interests = lazy(() => import("../pages/Interests"));
const Offers = lazy(() => import("../pages/Offers"));

const routes = [
  { path: "/dashboard", component: Dashboard, name: "Dashboard", icon: FaTachometerAlt },
  { path: "/bookings", component: Bookings, name: "Bookings", icon: FaCalendarAlt },
  { path: "/interests", component: Interests, name: "Leads", icon: FaRegClipboard },
  { path: "/users", component: Users, name: "Users", icon: FaUsers },
  { path: "/pandits", component: Pandit, name: "Pandits", icon: FaUserTie },
  { path: "/pujas", component: Puja, name: "Pujas", icon: FaPrayingHands },
  { path: "/offers", component: Offers, name: "Offers", icon: FaTag },
  { path: "/contacts", component: Contact, name: "Contacts", icon: FaEnvelope },
  { path: "/profile", component: Profile, name: "Profile", icon: FaUserCircle },
];

export default routes;
