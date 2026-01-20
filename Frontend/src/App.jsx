import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import { LoginPage, RegisterPage, ForgotPasswordPage, ResetPasswordPage, InstituteRegisterPage } from './pages/Auth';
import AdminDashboard from './pages/AdminDashboard';
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
import './App.css';

function App() {
  return (
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
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
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

          <Route path="/institutions/:id/profile" element={<MainProfilePage />} />
          <Route path="/institutions/:id/about" element={<MainProfilePage />} />
          <Route path="/institutions/:id/courses" element={<MainProfilePage />} />
          <Route path="/institutions/:id/contact" element={<MainProfilePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
