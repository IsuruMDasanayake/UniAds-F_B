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
use App\Http\Controllers\PolicyController;
use App\Http\Controllers\PlatformSettingsController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\GalleryController;
use App\Http\Controllers\ExportController;
use App\Http\Controllers\BroadcastMailController;

// Authentication routes with rate limiting (5 attempts per minute per IP)
Route::middleware('throttle:auth')->group(function () {
    Route::post('/register', [RegisteredUserController::class, 'store']);
    Route::post('/register-institute', [RegisteredUserController::class, 'storeInstitute']);
    Route::post('/login', [AuthenticatedSessionController::class, 'store']);
});

// Password Reset API routes (no auth required)
Route::post('/password/forgot', [ForgotPasswordController::class, 'apiSendResetCode']);
Route::post('/password/reset', [ForgotPasswordController::class, 'apiResetPassword']);

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    $user = $request->user();

    // Load institute relationship for Institute users
    if ($user->role === 'Institute') {
        $user->load('institute');
    }

    // Load savedPosts for regular Users
    if ($user->role === 'User') {
        $user->load('savedPosts');
    }

    return $user;
});

// API Logout route
Route::middleware('auth:sanctum')->post('/logout', function (Request $request) {
    Auth::guard('web')->logout();
    $request->session()->invalidate();
    $request->session()->regenerateToken();
    return response()->json(['message' => 'Logged out successfully']);
});

// Feed API endpoints
Route::middleware('auth:sanctum')->group(function () {
    // Feed data (posts, events, categories)
    Route::get('/feed', [FrontendController::class, 'feedApi']);

    // Posts
    Route::get('/posts', [PostController::class, 'apiIndex']);
    Route::post('/posts/{postId}/toggle-like', [PostController::class, 'toggleLike']);
    Route::get('/posts/saved', [PostController::class, 'getSavedPosts']);
    Route::post('/posts/{postId}/save', [PostController::class, 'apiToggleSave']);
    Route::post('/posts/{id}/track-view', [PostController::class, 'trackView']);
    Route::post('/institutes/{id}/posts', [PostController::class, 'apiStore']);
    Route::post('/posts/{id}/update', [PostController::class, 'apiUpdate']);
    Route::delete('/posts/{id}', [PostController::class, 'apiDestroy']);
    Route::get('/posts/filter/{filterType}/{filterValue}', [PostController::class, 'apiFilter']);

    // Events
    Route::get('/events', [EventController::class, 'apiIndex']);
    Route::post('/events/{id}/track-view', [EventController::class, 'trackView']);
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
    Route::post('/course/apply/{institute}', [PostController::class, 'apiApply']);

    // Existing route for storing institute if any...

    // Institute About Section Routes
    Route::post('/institute/{id}/about', [InstituteController::class, 'apiStoreAbout']);
    Route::post('/institute/{id}/update-about', [InstituteController::class, 'apiUpdateAbout']); // Using POST for file uploads with method spoofing if needed, or just POST.
    Route::delete('/institute/{id}/about', [InstituteController::class, 'apiDestroyAbout']);
    Route::get('/pricing', [SubscriptionController::class, 'apiShowPricing']);
    Route::post('/payment/initiate', [SubscriptionController::class, 'apiInitiatePayment']);
    Route::post('/payment/verify', [SubscriptionController::class, 'apiVerifyPayment']);     // For frontend callback
    Route::post('/payment/notify', [SubscriptionController::class, 'apiPaymentNotify']);
    Route::post('/pricing/cancel', [SubscriptionController::class, 'apiCancelSubscription']); // Restore cancel
    Route::post('/trial/start', [SubscriptionController::class, 'apiStartTrial']);
    Route::post('/trial/cancel', [SubscriptionController::class, 'apiCancelTrial']);

    // Profile API
    Route::get('/profile/me', [ProfileController::class, 'apiEdit']);
    Route::post('/profile/update', [ProfileController::class, 'apiUpdate']);
    Route::post('/profile/password', [ProfileController::class, 'apiUpdatePassword']);
    Route::post('/profile/picture', [ProfileController::class, 'apiUpdatePicture']);
    Route::get('/institutions/{id}/profile', [InstituteController::class, 'apiShowProfile']);
    Route::post('/institutions/{id}/update', [InstituteController::class, 'apiUpdateProfile']);
    Route::post('/institutions/{id}/follow', [InstituteController::class, 'toggleFollow']);

    // Institute Contact
    Route::post('/institutions/{id}/contact', [ContactController::class, 'apiSendContactMessage']);

    // Gallery API
    Route::get('/institutions/{id}/gallery', [GalleryController::class, 'index']);
    Route::post('/institute/gallery/store/{id}', [GalleryController::class, 'store']);
    Route::delete('/institute/gallery/{id}', [GalleryController::class, 'destroy']);

    // Ratings & Reviews
    Route::get('/institutes/{id}/ratings', [RatingsController::class, 'apiIndex']);
    Route::post('/institutes/{id}/rate', [RatingsController::class, 'apiRate']);
    Route::delete('/reviews/{id}', [RatingsController::class, 'apiDelete']);
});

// Public Policy Routes
Route::get('/policies/{type}', [PolicyController::class, 'apiIndex']);

// Platform Settings (Public)
Route::get('/settings/public', [PlatformSettingsController::class, 'publicIndex']);

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
});
