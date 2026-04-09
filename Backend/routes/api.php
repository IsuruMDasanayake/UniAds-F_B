<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\ForgotPasswordController;
use App\Http\Controllers\Auth\EmailVerificationController;
use App\Http\Controllers\FrontendController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\InstituteController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\BackendController;
use App\Http\Controllers\RatingsController;
use App\Http\Controllers\InboxController;
use App\Http\Controllers\PolicyController;
use App\Http\Controllers\PlatformSettingsController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\GalleryController;
use App\Http\Controllers\ExportController;
use App\Http\Controllers\BroadcastMailController;
use App\Http\Controllers\ApplicationController;
use App\Http\Controllers\MailTemplateController;
use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\InquiryController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\Api\ChatConversationController;
use App\Http\Controllers\Api\ChatMessageController;
use App\Http\Controllers\Api\AiAdvisorController;
use App\Http\Controllers\AdminCareerGuidanceController;
use App\Http\Controllers\FeedbackController;

// Authentication routes with rate limiting (5 attempts per minute per IP)
Route::middleware('throttle:auth')->group(function () {
    Route::post('/register', [RegisteredUserController::class, 'store']);
    Route::post('/register-institute', [RegisteredUserController::class, 'storeInstitute']);
    Route::post('/login', [AuthenticatedSessionController::class, 'store']);
});

// Password Reset API routes (no auth required)
Route::post('/password/forgot', [ForgotPasswordController::class, 'apiSendResetCode'])->middleware('throttle:5,1');
Route::post('/password/reset', [ForgotPasswordController::class, 'apiResetPassword'])->middleware('throttle:5,1');

// Email Verification routes (Public access for new registrations)
Route::post('/email/verify-otp', [EmailVerificationController::class, 'verifyOTP'])->middleware('throttle:3,5');
Route::post('/email/resend-otp', [EmailVerificationController::class, 'resendOTP'])->middleware('throttle:3,5');

// Public Contact Form
Route::post('/contact', [ContactController::class, 'apiSubmitContactForm'])->middleware('throttle:3,1');

// PayHere IPN Webhook (MUST be public — PayHere's server sends no Sanctum session cookie)
// Security is provided by the md5 hash verification inside apiPaymentNotify().
Route::post('/payment/notify', [SubscriptionController::class, 'apiPaymentNotify']);

Route::get('/user', function (Request $request) {
    if (Auth::guard('sanctum')->check()) {
        $user = Auth::guard('sanctum')->user();
        if ($user->role === 'Institute') {
            $user->load('institute');
        }
        if ($user->role === 'User') {
            $user->load('savedPosts');
        }
        return response()->json([
            'success' => true,
            'message' => 'User fetched',
            'data'    => $user,
        ]);
    }

    return response()->json([
        'success' => true,
        'message' => 'No active session',
        'data'    => null,
    ]);
});

// API Logout route
Route::middleware('auth:sanctum')->post('/logout', [AuthenticatedSessionController::class, 'apiLogout']);
Route::middleware('auth:sanctum')->post('/logout-all', [AuthenticatedSessionController::class, 'apiLogoutAllDevices']);

// Feed API endpoints
Route::middleware('auth:sanctum')->group(function () {
    // Feed data (posts, events, categories)
    Route::get('/feed', [FrontendController::class, 'feedApi']);

    // Posts
    Route::get('/posts', [PostController::class, 'apiIndex']);
    Route::get('/posts/share/{share_link}', [PostController::class, 'showByShareLink']);
    Route::post('/posts/{postId}/toggle-like', [PostController::class, 'toggleLike']);
    Route::get('/posts/saved', [PostController::class, 'getSavedPosts']);

    // View Tracking (Throttled 5/min)
    Route::middleware('throttle:views')->group(function () {
        Route::post('/posts/{id}/track-view', [PostController::class, 'trackView']);
        Route::post('/events/{id}/track-view', [EventController::class, 'trackView']);
        Route::post('/institutions/{id}/track-view', [InstituteController::class, 'trackView']);
    });
    Route::post('/posts/{postId}/save', [PostController::class, 'apiToggleSave']);
    Route::post('/institutes/{id}/posts', [PostController::class, 'apiStore']);
    Route::post('/posts/{id}/update', [PostController::class, 'apiUpdate']);
    Route::delete('/posts/{id}', [PostController::class, 'apiDestroy']);
    Route::get('/posts/filter/{filterType}/{filterValue}', [PostController::class, 'apiFilter']);

    // Events
    Route::get('/events', [EventController::class, 'apiIndex']);
    Route::post('/events/{event}/interest', [EventController::class, 'markInterest']);
    Route::post('/events/{event}/decline', [EventController::class, 'markDecline']);
    Route::post('/institutes/{id}/events', [EventController::class, 'apiStore']);
    Route::post('/events/{id}/update', [EventController::class, 'apiUpdate']);
    Route::delete('/events/{id}', [EventController::class, 'destroy']);

    // Categories
    Route::get('/categories', [CategoryController::class, 'apiIndex']);

    // Institutions
    Route::get('/institutions', [InstituteController::class, 'apiIndex']);

    // Search
    Route::get('/search', [SearchController::class, 'apiSearch']);

    // Course Applications
    Route::post('/course/apply/{institute}', [\App\Http\Controllers\CourseApplicationController::class, 'apply'])->middleware('throttle:3,1');

    // Existing route for storing institute if any...

    // Institute About Section Routes
    Route::post('/institute/{id}/about', [InstituteController::class, 'apiStoreAbout']);
    Route::post('/institute/{id}/update-about', [InstituteController::class, 'apiUpdateAbout']); // Using POST for file uploads with method spoofing if needed, or just POST.
    Route::delete('/institute/{id}/about', [InstituteController::class, 'apiDestroyAbout']);
    Route::get('/pricing', [SubscriptionController::class, 'apiShowPricing']);
    Route::post('/payment/initiate', [SubscriptionController::class, 'apiInitiatePayment']);
    Route::post('/payment/verify', [SubscriptionController::class, 'apiVerifyPayment']);     // For frontend callback
    // NOTE: /payment/notify is intentionally PUBLIC (above) — PayHere IPN has no auth cookie
    Route::post('/pricing/cancel', [SubscriptionController::class, 'apiCancelSubscription']); // Restore cancel
    Route::post('/trial/start', [SubscriptionController::class, 'apiStartTrial']);
    Route::post('/trial/cancel', [SubscriptionController::class, 'apiCancelTrial']);

    // Profile API
    Route::get('/profile/me', [ProfileController::class, 'apiEdit']);
    Route::post('/profile/update', [ProfileController::class, 'apiUpdate']);
    Route::post('/profile/password/otp', [ProfileController::class, 'apiSendOtpForPasswordChange']);
    Route::post('/profile/password', [ProfileController::class, 'apiUpdatePassword']);
    Route::post('/profile/picture', [ProfileController::class, 'apiUpdatePicture']);
    Route::get('/institutions/{id}/profile', [InstituteController::class, 'apiShowProfile']);
    Route::post('/institutions/{id}/update', [InstituteController::class, 'apiUpdateProfile']);
    Route::post('/institutions/{id}/follow', [InstituteController::class, 'toggleFollow']);

    // Institute Contact
    Route::post('/institutions/{id}/contact', [ContactController::class, 'apiSendContactMessage'])->middleware('throttle:3,1');

    // Gallery API
    Route::get('/institutions/{id}/gallery', [GalleryController::class, 'index']);
    Route::post('/institute/gallery/store/{id}', [GalleryController::class, 'store']);
    Route::delete('/institute/gallery/{id}', [GalleryController::class, 'destroy']);

    // Chat API
    Route::prefix('chat')->group(function () {
        Route::get('/conversations', [ChatConversationController::class, 'index']);
        Route::post('/start', [ChatConversationController::class, 'store']);

        Route::get('/{conversation}/messages', [ChatMessageController::class, 'index']);
        Route::post('/{conversation}/send', [ChatMessageController::class, 'store']);
        Route::post('/{conversation}/mark-read', [ChatMessageController::class, 'markRead']);
        Route::delete('/{conversation}', [ChatConversationController::class, 'destroy']);
    });

    // Ratings & Reviews
    Route::get('/institutes/{id}/ratings', [RatingsController::class, 'apiIndex']);
    Route::post('/institutes/{id}/rate', [RatingsController::class, 'apiRate']);
    Route::delete('/reviews/{id}', [RatingsController::class, 'apiDelete']);

    // Analytics Module Routes (New React Dashboard)
    Route::prefix('institute')->group(function () {
        Route::get('/analytics/overview', [AnalyticsController::class, 'apiOverview']);
        Route::get('/analytics/trends', [AnalyticsController::class, 'apiTrends']);
        Route::get('/analytics/demographics', [AnalyticsController::class, 'apiDemographics']);
        Route::get('/analytics/posts', [AnalyticsController::class, 'apiPosts']);
        Route::delete('/analytics/posts/{id}', [AnalyticsController::class, 'deletePost']);
        Route::patch('/posts/{id}/status', [AnalyticsController::class, 'toggleStatus']);
        Route::patch('/events/{id}/status', [AnalyticsController::class, 'toggleEventStatus']);
        Route::delete('/analytics/events/{id}', [AnalyticsController::class, 'deleteEvent']);
        Route::get('/analytics/events', [AnalyticsController::class, 'apiEvents']);
        Route::get('/analytics/ratings', [AnalyticsController::class, 'apiRatings']);
        Route::post('/ratings/{id}/report', [AnalyticsController::class, 'apiReportRating']);
        Route::get('/analytics/subscription', [AnalyticsController::class, 'apiSubscription']);
        Route::get('/analytics/subscriptions', [AnalyticsController::class, 'apiSubscriptions']);
        Route::post('/subscription/cancel', [SubscriptionController::class, 'apiCancelUnified']);

        // Notification Routes
        Route::get('/notifications', [NotificationController::class, 'index']);
        Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
        Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);

        // Application Management
        Route::get('/applications', [ApplicationController::class, 'index']);
        Route::get('/applications/{id}', [ApplicationController::class, 'show']);
        Route::put('/applications/{id}/view', [ApplicationController::class, 'markAsViewed']);
        Route::post('/applications/{id}/reply', [ApplicationController::class, 'sendReply']);
        Route::get('/communications/history', [ApplicationController::class, 'communicationsHistory']);

        // Inquiry Management (General Contact)
        Route::get('/inquiries', [InquiryController::class, 'index']);
        Route::put('/inquiries/{id}/view', [InquiryController::class, 'markAsViewed']);
        Route::post('/inquiries/{id}/reply', [InquiryController::class, 'sendReply']);

        // Activity Logs
        Route::get('/activity-logs', [\App\Http\Controllers\InstituteActivityLogController::class, 'index']);
        Route::get('/activity-logs/export', [\App\Http\Controllers\InstituteActivityLogController::class, 'exportCsv']);
        Route::delete('/activity-logs/clear', [\App\Http\Controllers\InstituteActivityLogController::class, 'clearLogs']);

        // Reports
        Route::get('/reports/download', [\App\Http\Controllers\InstituteReportController::class, 'download']);
    });

    // AI Advisor
    Route::post('/ai-advisor/recommend', [AiAdvisorController::class, 'recommend']);
    Route::get('/ai-advisor/saved-roadmaps', [AiAdvisorController::class, 'getSavedRoadmaps']);
    Route::post('/ai-advisor/save-roadmap', [AiAdvisorController::class, 'saveRoadmap']);
    Route::delete('/ai-advisor/roadmap/{id}', [AiAdvisorController::class, 'deleteRoadmap']);

    // User Applications
    Route::get('/applications/me', [\App\Http\Controllers\CourseApplicationController::class, 'userApplications']);

    // Feedback
    Route::post('/feedback', [FeedbackController::class, 'store']);
    Route::get('/feedback/check-eligibility', [FeedbackController::class, 'checkEligibility']);
});

// Public Feedbacks
Route::get('/feedbacks/public', [FeedbackController::class, 'getPublicFeedbacks']);

// Public Policy Routes
Route::get('/policies/{type}', [PolicyController::class, 'apiIndex']);

// Platform Settings (Public)
Route::get('/settings/public', [PlatformSettingsController::class, 'publicIndex']);
Route::get('/institutes/partners', [InstituteController::class, 'getPartners']);

// Admin Dashboard Routes

Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    // Dashboard Stats
    Route::get('/dashboard', [BackendController::class, 'apiDashboard']);

    // User Management
    Route::get('/users', [BackendController::class, 'apiIndex']);
    Route::post('/users', [BackendController::class, 'apiStore']);
    Route::put('/users/{id}', [BackendController::class, 'apiUpdate']);
    Route::delete('/users/{id}', [BackendController::class, 'apiDestroy']);

    // Institute Management
    Route::get('/institutes', [InstituteController::class, 'apiAdminIndex']);
    Route::post('/institutes/{id}/approve', [InstituteController::class, 'apiApprove']);
    Route::post('/institutes/{id}/unapprove', [InstituteController::class, 'apiUnapprove']);
    Route::post('/institutes/{id}/toggle-premium', [InstituteController::class, 'apiTogglePremium']);
    Route::put('/institutes/{id}', [InstituteController::class, 'apiAdminUpdate']);
    Route::delete('/institutes/{id}', [InstituteController::class, 'destroy']);

    // Category Management
    Route::get('/categories', [CategoryController::class, 'apiAdminIndex']);
    Route::post('/categories', [CategoryController::class, 'apiStore']);
    Route::put('/categories/{id}', [CategoryController::class, 'apiUpdate']);
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);

    // Post Management
    Route::get('/posts', [PostController::class, 'apiAdminIndex']);
    Route::post('/posts/{id}/toggle-status', [PostController::class, 'apiToggleStatus']);
    Route::delete('/posts/{id}', [PostController::class, 'apiDestroy']);

    // Event Management
    Route::get('/events', [EventController::class, 'apiAdminIndex']);
    Route::post('/events/{id}/toggle-status', [EventController::class, 'apiToggleStatus']);
    Route::delete('/events/{id}', [EventController::class, 'destroy']);

    // Subscriptions
    Route::get('/subscriptions', [SubscriptionController::class, 'apiAdminIndex']);
    Route::patch('/subscriptions/{id}/status', [SubscriptionController::class, 'apiToggleStatus']);

    // Ratings
    Route::get('/ratings', [RatingsController::class, 'apiAdminIndex']);
    Route::delete('/ratings/{id}', [RatingsController::class, 'apiDelete']);

    // Policies
    // Unified Policy Management Routes
    Route::get('/policies/{type}', [PolicyController::class, 'apiIndex']);
    Route::post('/policies/{type}', [PolicyController::class, 'apiStore']);
    Route::put('/policies/{type}/{id}', [PolicyController::class, 'apiUpdate']);
    Route::delete('/policies/{type}/{id}', [PolicyController::class, 'apiDestroy']);

    // Platform Settings
    Route::get('/settings', [PlatformSettingsController::class, 'index']);
    Route::post('/settings', [PlatformSettingsController::class, 'update']);

    // Export Reports
    Route::get('/export/users', [ExportController::class, 'exportUsers']);
    Route::get('/export/institutes', [ExportController::class, 'exportInstitutes']);
    Route::get('/export/applications', [ExportController::class, 'exportApplications']);

    // Broadcast Mail
    Route::get('/broadcast-mail/filter-options', [BroadcastMailController::class, 'getFilterOptions']);
    Route::get('/broadcast-mail/institutes/list', [BroadcastMailController::class, 'getInstituteList']);
    Route::post('/broadcast-mail/count', [BroadcastMailController::class, 'getRecipientCount']);
    Route::post('/broadcast-mail/preview', [BroadcastMailController::class, 'previewRecipients']);
    Route::post('/broadcast-mail/send', [BroadcastMailController::class, 'sendMail']);
    Route::get('/broadcast-mail/history', [BroadcastMailController::class, 'getHistory']);
    Route::get('/mail-templates', [MailTemplateController::class, 'index']);

    // Application Management
    Route::get('/applications', [ApplicationController::class, 'apiIndex']);

    // Inbox
    Route::get('/inbox', [InboxController::class, 'index']);
    Route::post('/inbox/sync', [InboxController::class, 'sync']);
    Route::get('/inbox/unread-count', [InboxController::class, 'unreadCount']);
    Route::get('/inbox/{id}', [InboxController::class, 'show']);
    Route::patch('/inbox/{id}/read', [InboxController::class, 'markAsRead']);
    Route::delete('/inbox/{id}', [InboxController::class, 'destroy']);

    // Activity Logs
    Route::get('/activity-logs', [ActivityLogController::class, 'index']);
    Route::get('/activity-logs/filters', [ActivityLogController::class, 'getFilters']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'adminIndex']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'adminMarkAsRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'adminMarkAllAsRead']);
    Route::delete('/notifications/{id}', [NotificationController::class, 'adminDestroy']);

    // Admin Career Guidance
    Route::prefix('career-guidance')->group(function () {
        Route::get('/', [AdminCareerGuidanceController::class, 'index']);
        Route::post('/', [AdminCareerGuidanceController::class, 'store']);
        Route::get('/{id}', [AdminCareerGuidanceController::class, 'show']);
        Route::put('/{id}', [AdminCareerGuidanceController::class, 'update']);
        Route::delete('/{id}', [AdminCareerGuidanceController::class, 'destroy']);
    });

    // Admin Feedbacks
    Route::get('/feedbacks', [FeedbackController::class, 'adminIndex']);
    Route::delete('/feedbacks/{id}', [FeedbackController::class, 'destroy']);
});
