import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import { LoginPage, RegisterPage, ForgotPasswordPage, ResetPasswordPage, InstituteRegisterPage } from './pages/Auth';
import InstituteDashboard from './pages/InstituteDashboard';
import SavedPostsPage from './pages/SavedPostsPage';
import InstitutionsPage from './pages/InstitutionsPage';
import CoursesPage from './pages/CoursesPage';
import EventsPage from './pages/EventsPage';
import FeedPage from './pages/FeedPage';
import HomePage from './pages/HomePage';
import PricingPage from './pages/PricingPage';
import SearchResultsPage from './pages/SearchResultsPage';
import ProfileWrapper from './components/ProfileWrapper';
import MainProfilePage from './pages/InstituteProfile/MainProfilePage';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsConditions from './pages/TermsConditions';
import RefundPolicy from './pages/RefundPolicy';

// Admin Components
import AdminLayout from './components/Admin/AdminLayout';
import AdminRoute from './components/Admin/AdminRoute';
import AdminDashboard from './pages/Admin/AdminDashboard';
import UserManagement from './pages/Admin/UserManagement';
import InstituteManagement from './pages/Admin/InstituteManagement';
import CategoryManagement from './pages/Admin/CategoryManagement';
import PostManagement from './pages/Admin/PostManagement';
import EventManagement from './pages/Admin/EventManagement';
import SubscriptionManagement from './pages/Admin/SubscriptionManagement';
import PolicyManagement from './pages/Admin/PolicyManagement';
import RatingManagement from './pages/Admin/RatingManagement';
import AdminSettings from './pages/Admin/AdminSettings';
import ReportsPage from './pages/Admin/ReportsPage';
import BroadcastMailPage from './pages/Admin/BroadcastMailPage';
import ApplicationsPage from './pages/Admin/ApplicationsPage';

import { SettingsProvider } from './context/SettingsContext';

import './App.css';

function App() {
  return (
    <SettingsProvider>
      <Router>
        <ScrollToTop />
        <div className="App">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/institutionprofileadd" element={<InstituteRegisterPage />} />
            <Route path="/institute/dashboard" element={<InstituteDashboard />} />
            <Route path="/saved-posts" element={<SavedPostsPage />} />
            <Route path="/institutions" element={<InstitutionsPage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/courses/:filterType/:filterValue" element={<CoursesPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/search" element={<SearchResultsPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/profile" element={<ProfileWrapper />} />
            <Route path="/profile/feed" element={<ProfileWrapper />} />
            <Route path="/profile/about" element={<ProfileWrapper />} />
            <Route path="/profile/courses" element={<ProfileWrapper />} />
            <Route path="/profile/contact" element={<ProfileWrapper />} />
            <Route path="/profile/events" element={<ProfileWrapper />} />

            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-conditions" element={<TermsConditions />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />

            <Route path="/institutions/:id/profile" element={<MainProfilePage />} />
            <Route path="/institutions/:id/about" element={<MainProfilePage />} />
            <Route path="/institutions/:id/courses" element={<MainProfilePage />} />
            <Route path="/institutions/:id/contact" element={<MainProfilePage />} />
            <Route path="/institutions/:id/events" element={<MainProfilePage />} />

            {/* Admin Routes - Wrapped in Layout and Protected */}
            <Route path="/admin/*" element={
              <AdminRoute>
                <AdminLayout>
                  <Routes>
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="users" element={<UserManagement />} />
                    <Route path="institutes" element={<InstituteManagement />} />
                    <Route path="categories" element={<CategoryManagement />} />
                    <Route path="posts" element={<PostManagement />} />
                    <Route path="events" element={<EventManagement />} />
                    <Route path="subscriptions" element={<SubscriptionManagement />} />
                    <Route path="ratings" element={<RatingManagement />} />
                    <Route path="policies" element={<PolicyManagement />} />
                    <Route path="settings" element={<AdminSettings />} />
                    <Route path="reports" element={<ReportsPage />} />
                    <Route path="broadcast-mail" element={<BroadcastMailPage />} />
                    <Route path="applications" element={<ApplicationsPage />} />
                    <Route path="*" element={<Navigate to="dashboard" replace />} />
                  </Routes>
                </AdminLayout>
              </AdminRoute>
            } />
          </Routes>
        </div>
      </Router>
    </SettingsProvider>
  );
}

export default App;
