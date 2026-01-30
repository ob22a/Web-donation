import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import Home from "./pages/Home";
import AllDonations from "./pages/AllDonations";
import CampaignDetail from "./pages/CampaignDetail";
import Login from "./pages/Login";
import NGODashboard from "./pages/NGODashboard"; // Profile fill page
import NDashboard from "./pages/NDashboard"; // Actual Stats Dashboard
import NGORegister from "./pages/NGORegister";
import About from "./pages/About";
import NGOs from "./pages/NGOs";
import Register from "./pages/Register"; // Donor Register
import Contact from "./pages/Contact";
import Profile from "./pages/Profile";
import MyCampaigns from "./pages/MyCampaigns";
import DonorDashboard from "./pages/DonorDashboard";
import Notifications from "./pages/Notifications";
import Help from "./pages/Help";
import { AuthProvider } from "./context/AuthContext";

/**
 * Main App component - root of the React application.
 *
 * Architecture:
 * - AuthProvider wraps entire app to provide auth context to all components
 * - BrowserRouter enables client-side routing
 * - Layout component provides consistent structure (Header, Sidebar)
 * - Nested Routes render page components within Layout
 *
 * Route structure:
 * - All routes are nested under "/" with Layout as parent
 * - Index route ("/") renders Home component
 * - Dynamic routes use params (e.g., "/campaign/:id")
 * - Separate routes for donor and NGO dashboards
 */
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Layout wraps all routes, providing Header and Sidebar */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="donations" element={<AllDonations />} />
            <Route path="campaign/:id" element={<CampaignDetail />} />
            <Route path="dashboard" element={<NDashboard />} />
            <Route path="ngo-profile-setup" element={<NGODashboard />} />
            <Route path="ngo-register" element={<NGORegister />} />
            <Route path="about" element={<About />} />
            <Route path="ngos" element={<NGOs />} />
            <Route path="register" element={<Register />} />
            <Route path="contact" element={<Contact />} />
            <Route path="profile" element={<Profile />} />
            <Route path="my-campaigns" element={<MyCampaigns />} />
            <Route path="donor-dashboard" element={<DonorDashboard />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="help" element={<Help />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
