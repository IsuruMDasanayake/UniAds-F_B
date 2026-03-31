import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import { LoginPage, RegisterPage, ForgotPasswordPage, ResetPasswordPage, InstituteRegisterPage, EmailVerification } from './pages/Auth';
import InstituteDashboard from './pages/InstituteDashboard';
import InstitutionsPage from './pages/InstitutionsPage';
import CoursesPage from './pages/CoursesPage';
import EventsPage from './pages/EventsPage';
import FeedPage from './pages/FeedPage';
import HomePage from './pages/HomePage';
import PricingPage from './pages/PricingPage';
import SearchResultsPage from './pages/SearchResultsPage';
import ProfileWrapper from './components/ProfileWrapper';
import MainProfilePage from './pages/InstituteProfile/MainProfilePage';
import SitePrivacy from './pages/SitePrivacy';
import TermsConditions from './pages/TermsConditions';
import SiteRefund from './pages/SiteRefund';

// Admin Components
import AdminLayout from './components/Admin/AdminLayout';
import AdminRoute from './components/Admin/AdminRoute';
import AdminDashboard from './pages/Admin/AdminDashboard';
import UserManagement from './pages/Admin/UserManagement';
import InstituteManagement from './pages/Admin/InstituteManagement';
import CategoryManagement from './pages/Admin/CategoryManagement';
import CareerGuidanceManagement from './pages/Admin/CareerGuidanceManagement';
import PostManagement from './pages/Admin/PostManagement';
import EventManagement from './pages/Admin/EventManagement';
import SubscriptionManagement from './pages/Admin/SubscriptionManagement';
import PolicyManagement from './pages/Admin/PolicyManagement';
import RatingManagement from './pages/Admin/RatingManagement';
import AdminSettings from './pages/Admin/AdminSettings';
import ReportsPage from './pages/Admin/ReportsPage';
import BroadcastMailPage from './pages/Admin/BroadcastMailPage';
import ApplicationsPage from './pages/Admin/ApplicationsPage';
import AdminInboxPage from './pages/Admin/AdminInboxPage';
import ActivityLogPage from './pages/Admin/ActivityLogPage';
import AdminFeedback from './pages/Admin/AdminFeedback';

import { SettingsProvider } from './context/SettingsContext';
import { ChatProvider } from './context/ChatContext';
import { useState, useEffect } from 'react';
import axiosClient from './lib/axios';

// Analytics Module
import InstituteRoute from './components/InstituteRoute';
import AnalyticsLayout from './components/Analytics/AnalyticsLayout';
import OverviewPage from './pages/Analytics/OverviewPage';
import TrendsPage from './pages/Analytics/TrendsPage';
import PostsAnalyticsPage from './pages/Analytics/PostsAnalyticsPage';
import EventsAnalyticsPage from './pages/Analytics/EventsAnalyticsPage';
import RatingsPage from './pages/Analytics/RatingsPage';
import SubscriptionPage from './pages/Analytics/SubscriptionPage';
import SettingsPage from './pages/Analytics/SettingsPage';
import ApplicationsPageInstitute from './pages/Analytics/ApplicationsPage';
import GeneralInquiriesPage from './pages/Analytics/GeneralInquiriesPage';
import ChatPage from './pages/Analytics/ChatPage';
import AdsPlaceholderPage from './pages/Analytics/AdsPlaceholderPage';

import FloatingAiAdvisor from './components/FloatingAiAdvisor';
import GlobalFeedbackModal from './components/Modals/GlobalFeedbackModal';

import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

import './App.css';

function App() {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('APP_USER');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = response.data.data;
        setUser(userData);
        localStorage.setItem('APP_USER', JSON.stringify(userData));
      } catch (error) {
        if (error.response?.status === 401) {
          setUser(null);
          localStorage.removeItem('APP_USER');
          localStorage.removeItem('ACCESS_TOKEN');
        }
      }
    };
    if (localStorage.getItem('ACCESS_TOKEN')) {
      fetchUser();
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <ChatProvider user={user}>
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
                <Route path="/email-verification" element={<EmailVerification />} />
                <Route path="/institute/dashboard" element={<InstituteDashboard />} />
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

                <Route path="/privacy-policy" element={<SitePrivacy />} />
                <Route path="/terms-conditions" element={<TermsConditions />} />
                <Route path="/refund-policy" element={<SiteRefund />} />

                <Route path="/institutions/:id/profile" element={<MainProfilePage />} />
                <Route path="/institutions/:id/about" element={<MainProfilePage />} />
                <Route path="/institutions/:id/courses" element={<MainProfilePage />} />
                <Route path="/institutions/:id/contact" element={<MainProfilePage />} />
                <Route path="/institutions/:id/events" element={<MainProfilePage />} />

                {/* Institute Analytics - Wrapped in InstituteRoute */}
                <Route path="/analytics/:slug/*" element={
                  <InstituteRoute>
                    <div className="analytics-module">
                      <AnalyticsLayout />
                    </div>
                  </InstituteRoute>
                }>
                  <Route path="overview" element={<OverviewPage />} />
                  <Route path="trends" element={<TrendsPage />} />
                  <Route path="posts" element={<PostsAnalyticsPage />} />
                  <Route path="events" element={<EventsAnalyticsPage />} />
                  <Route path="ratings" element={<RatingsPage />} />
                  <Route path="subscription" element={<SubscriptionPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="applications" element={<ApplicationsPageInstitute />} />
                  <Route path="inquiries" element={<GeneralInquiriesPage />} />
                  <Route path="chat" element={<ChatPage />} />
                  <Route path="ads" element={<AdsPlaceholderPage />} />
                  <Route path="*" element={<Navigate to="overview" replace />} />
                </Route>

                {/* Fallback for old /analytics/* paths - AnalyticsLayout will handle redirection to :slug */}
                <Route path="/analytics/*" element={
                  <InstituteRoute>
                    <div className="analytics-module">
                      <AnalyticsLayout />
                    </div>
                  </InstituteRoute>
                } />

                {/* Admin Routes - Wrapped in Layout and Protected */}
                <Route path="/admin/*" element={
                  <AdminRoute>
                    <AdminLayout>
                      <Routes>
                        <Route path="dashboard" element={<AdminDashboard />} />
                        <Route path="users" element={<UserManagement />} />
                        <Route path="institutes" element={<InstituteManagement />} />
                        <Route path="categories" element={<CategoryManagement />} />
                        <Route path="career-guidance" element={<CareerGuidanceManagement />} />
                        <Route path="posts" element={<PostManagement />} />
                        <Route path="events" element={<EventManagement />} />
                        <Route path="subscriptions" element={<SubscriptionManagement />} />
                        <Route path="ratings" element={<RatingManagement />} />
                        <Route path="policies" element={<PolicyManagement />} />
                        <Route path="settings" element={<AdminSettings />} />
                        <Route path="reports" element={<ReportsPage />} />
                        <Route path="broadcast-mail" element={<BroadcastMailPage />} />
                        <Route path="applications" element={<ApplicationsPage />} />
                        <Route path="inbox" element={<AdminInboxPage />} />
                        <Route path="activity-logs" element={<ActivityLogPage />} />
                        <Route path="feedbacks" element={<AdminFeedback />} />
                        <Route path="*" element={<Navigate to="dashboard" replace />} />
                      </Routes>
                    </AdminLayout>
                  </AdminRoute>
                } />
              </Routes>
              <FloatingAiAdvisor user={user} />
              <GlobalFeedbackModal />
              <Toaster position="top-right" richColors closeButton />
            </div>
          </Router>
        </ChatProvider>
      </SettingsProvider>
    </QueryClientProvider>
  );
}

export default App;
