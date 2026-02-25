import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Pages
import Home from './pages/public/Home';
import About from './pages/public/About';
import Ministries from './pages/public/Ministries';
import MinistryDetail from './pages/public/MinistryDetail';
import Events from './pages/public/Events';
import EventDetail from './pages/public/EventDetail';
import Donate from './pages/public/Donate';
import PayPalSuccess from './pages/public/PayPalSuccess';
import Contact from './pages/public/Contact';

// Admin Pages
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminHeroImages from './pages/admin/HeroImages';
import AdminSectionHeroImages from './pages/admin/SectionHeroImages';
import AdminEvents from './pages/admin/Events';
import AdminMinistries from './pages/admin/Ministries';
import AdminDonations from './pages/admin/Donations';
import AdminMessages from './pages/admin/Messages';
import AdminNewsletter from './pages/admin/Newsletter';
import AdminGallery from './pages/admin/Gallery';
import AdminUsers from './pages/admin/Users';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';

// Styles
import './styles/variables.css';
import './styles/animations.css';
import './styles/components.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            {/* Public Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/ministries" element={<Ministries />} />
              <Route path="/ministries/:id" element={<MinistryDetail />} />
              <Route path="/events" element={<Events />} />
              <Route path="/events/:id" element={<EventDetail />} />
              <Route path="/donate" element={<Donate />} />
              <Route path="/paypal-success" element={<PayPalSuccess />} />
              <Route path="/contact" element={<Contact />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/hero-images" element={<AdminHeroImages />} />
              <Route path="/admin/section-heroes" element={<AdminSectionHeroImages />} />
              <Route path="/admin/events" element={<AdminEvents />} />
              <Route path="/admin/ministries" element={<AdminMinistries />} />
              <Route path="/admin/donations" element={<AdminDonations />} />
              <Route path="/admin/messages" element={<AdminMessages />} />
              <Route path="/admin/newsletter" element={<AdminNewsletter />} />
              <Route path="/admin/gallery" element={<AdminGallery />} />
              <Route path="/admin/users" element={<AdminUsers />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
