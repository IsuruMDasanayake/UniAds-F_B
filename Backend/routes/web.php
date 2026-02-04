<?php

use App\Models\Institute;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\BackendController;
use App\Http\Controllers\InstituteController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\GalleryController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\AboutSectionController;
use App\Http\Controllers\CourseApplicationController;
use App\Http\Controllers\Auth\ForgotPasswordController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\ApplyCaseController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\StripeWebhookController;
use App\Http\Controllers\PostBoostController;
use App\Http\Controllers\FrontendController;
use App\Http\Controllers\PolicyController;
use App\Http\Controllers\RatingsController;
use App\Http\Controllers\SavedPostController;


/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

require __DIR__ . '/auth.php';

Route::post('/upload-test', function (\Illuminate\Http\Request $request) {
    dd(ini_get('upload_max_filesize'), ini_get('post_max_size'));
});

Route::get('/', function () {
    return view('welcome');
});

Route::get('/feed', [FrontendController::class, 'feed'])->name('frontend.feed.feed');

Route::get('/home', function () {
    return view('frontend.home');
})->middleware(['auth', 'verified'])->name('home');

//Admin dashboard
Route::get('/admin/admindash', [BackendController::class, 'admindash'])->name('admin.dashboard');

Route::get('/institutions', [InstituteController::class, 'showInstitutions'])->name('institutions.index');

Route::get('/courses', function () {
    return view('frontend.courses.courses');
});

Route::get('/courselist', function () {
    return view('frontend.courses.courselist');
});


Route::get('/api/check-gov-register-number', function (Request $request) {
    $exists = Institute::where('gov_register_number', $request->number)->exists();
    return response()->json(['exists' => $exists]);
});


//users show in backend
Route::get('/admin/users', [BackendController::class, 'index'])->name('admin.users');


// Define the route for updating a user's details
Route::post('/admin/users', [BackendController::class, 'update'])->name('admin.users');
Route::delete('/users/{id}', [BackendController::class, 'destroy'])->name('users.destroy');
Route::post('/users', [BackendController::class, 'store'])->name('users.store');

//Institutes in backend
Route::get('/admin/institutesmanage', [InstituteController::class, 'institutesmanage'])->name('admin.institutesmanage');
Route::patch('/admin/institutesmanage/{id}/approve', [InstituteController::class, 'approve'])->name('institute.approve');
Route::delete('/admin/institutesmanage/{id}', [InstituteController::class, 'destroy'])->name('institutes.destroy');
Route::patch('/admin/institutesmanage/{id}', [InstituteController::class, 'update'])->name('institute.update');
Route::delete('/admin/institutes/{id}', [InstituteController::class, 'destroy'])->name('institutes.destroy');

//Route::post('/admin/institutes/add', [InstituteController::class, 'addinstitute'])->name('institute.addinstitute');



//Institutes in frontend
Route::get('/institutionprofileadd', [InstituteController::class, 'instituteadd'])->name('frontend.institutions.institutionprofileadd');
Route::post('/store', [InstituteController::class, 'store'])->name('institute.store');



// Profile management for both users and institutes
Route::middleware(['auth'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile/update', [ProfileController::class, 'update'])->name('profile.update');
    Route::patch('/profile/password', [ProfileController::class, 'updatePassword'])->name('password.update');
    Route::delete('/profile/delete', [ProfileController::class, 'destroy'])->name('profile.destroy');
});



//Institution profile shows to normal user
Route::get('/institutions/{id}/profile', [InstituteController::class, 'showProfile'])->name('frontend.profile.institute-edit');


Route::put('/institutions/{id}', [InstituteController::class, 'instituteupdate'])->name('updateInstitute');


//Categories in admin panel
Route::get('/admin/categories', [CategoryController::class, 'categories'])->name('admin.categories');
Route::post('/admin/categories', [CategoryController::class, 'store'])->name('categories.store');
Route::delete('/admin/categories/{id}', [CategoryController::class, 'destroy'])->name('categories.destroy');
Route::get('/admin/categories/{id}/edit', [CategoryController::class, 'edit'])->name('categories.edit');
Route::patch('/admin/categories/{id}', [CategoryController::class, 'update'])->name('categories.update');

//shoe categories in frontend
Route::get('/courses', [CategoryController::class, 'showCategories'])->name('frontend.courses.courses');
//Add post form showing



// Routes for posts
Route::get('/posts/filter/{filterType}/{filterValue}', [PostController::class, 'filter'])->name('posts.filter');

// Post CRUD
Route::post('/profile/{id}', [PostController::class, 'store'])->name('posts.store');
Route::delete('/posts/{id}', [PostController::class, 'destroy'])->name('posts.destroy');
Route::get('/posts/{id}/edit', [PostController::class, 'edit'])->name('posts.edit');
Route::put('/posts/{id}', [PostController::class, 'update'])->name('posts.update');

// Post Like Toggle
Route::post('/posts/{postId}/toggle-like', [PostController::class, 'toggleLike'])->name('posts.toggleLike');

// Fetch Posts for Filtering
Route::get('/posts/feedfilter/{filterType}', [PostController::class, 'feedfilter'])->name('posts.feedfilter');


// Routes for events
Route::post('/profile/{id}/add-event', [EventController::class, 'store'])->name('events.store');
Route::get('/events/{id}/edit', [EventController::class, 'edit'])->name('events.edit');
Route::put('/events/{id}', [EventController::class, 'update'])->name('events.update');
Route::delete('/events/{id}', [EventController::class, 'destroy'])->name('events.destroy');


// Route::get('/feed', [PostController::class, 'showFeed'])->name('frontend.feed.feed');
// Route::get('/feed', [EventController::class, 'showEvent'])->name('feed');
// Route::get('/feed', [CategoryController::class, 'showPrograms'])->name('frontend.feed.programs');
Route::get('/posts/load-more', [PostController::class, 'loadMore'])->name('posts.loadMore');


// Show the event interest functionality
Route::post('/events/{event}/interest', [EventController::class, 'markInterested']);
Route::post('/events/{event}/decline', [EventController::class, 'markDecline']);



//routes for admindashpost
Route::get('/admin/posts', [PostController::class, 'adminPost'])->name('admin.posts');
//routes for admindashevents
Route::get('/admin/event', [EventController::class, 'adminEvents'])->name('admin.events');


//routes for admindashsubscriptions
Route::get('/admin/subscriptions', [SubscriptionController::class, 'adminSubscriptions'])->name('admin.subscriptions');
Route::patch('/admin/subscriptions/{id}/toggle-status', [SubscriptionController::class, 'toggleStatus'])
    ->name('subscriptions.toggleStatus');



//Institute Gallery
Route::post('/institute/gallery/store/{id}', [GalleryController::class, 'store'])->name('gallery.store');
Route::delete('/institute/gallery/{id}', [GalleryController::class, 'destroy'])->name('gallery.destroy');

//notification

// Fetch notifications for the logged-in user
// Route::get('/notifications', [NotificationController::class, 'getNotifications'])->middleware('auth');

// Mark notifications as seen
// Route::post('/notifications/seen', [NotificationController::class, 'markAsSeen'])->middleware('auth');


//Chats

Route::get('/get-messages/{chatId}', [ChatController::class, 'getMessages']);
Route::post('/send-message', [ChatController::class, 'sendMessage'])->name('sendMessage');





//Contact
Route::get('/institute/{id}/contact', [ContactController::class, 'showContactPage'])->name('institute.contact');
Route::post('/institute/{id}/contact', [ContactController::class, 'sendContactMessage'])->name('institute.contact.send');
Route::post('/contact-submit', [ContactController::class, 'submitContactForm'])->name('contact.submit');


//About
Route::get('/institute/{id}/about', [AboutSectionController::class, 'showAboutPage'])->name('institute.about');
Route::post('/institute/{id}/about', [AboutSectionController::class, 'store'])->name('about.submit');
Route::put('/institute/{id}/update', [AboutSectionController::class, 'update'])->name('institute.update');
Route::delete('/institute/{id}/about', [AboutSectionController::class, 'destroy'])->name('institute.destroy');

//courses 
//routes for courses view in institute profile
Route::get('/institute/{id}/courses', [InstituteController::class, 'showCourses'])->name('frontend.profile.profile-courses');


Route::post('forgot-password', [ForgotPasswordController::class, 'sendResetCode'])->name('password.sendResetCode');
Route::get('reset-password', [ForgotPasswordController::class, 'showResetForm'])->name('password.resetForm');
Route::post('reset-password', [ForgotPasswordController::class, 'resetPassword'])->name('password.reset');
Route::get('confirm-password', [ForgotPasswordController::class, 'showConfirmForm'])->name('confirm.passwordForm');


//Apply for course
Route::post('/course/apply/{institute_id}', [CourseApplicationController::class, 'apply'])->name('course.apply');

//Events
Route::get('/events', [EventController::class, 'index']);


//Search function
Route::get('/search', [SearchController::class, 'search'])->name('search.results');


//Analytics dashboard
Route::middleware(['auth', 'premium'])->group(function () {
    Route::get('/institute/{id}/analytics', [AnalyticsController::class, 'index'])->name('analytics.dashboard');
    Route::get('/section/{type}', [AnalyticsController::class, 'section']);
});



//Follow
Route::post('/institutes/{id}/follow', [InstituteController::class, 'toggleFollow'])->name('institute.toggleFollow');

//Ratings
Route::post('/institute/{id}/rate', [RatingsController::class, 'storeRating'])->name('institute.rate');
Route::delete('/institute/review/{id}', [RatingsController::class, 'deleteReview'])->name('institute.review.delete');
Route::post('/ratings/{id}/report', [RatingsController::class, 'report'])->name('ratings.report');



//Stripe
Route::middleware(['auth'])->group(function () {
    Route::get('/pricing', [SubscriptionController::class, 'showPricing'])->name('pricing');
    Route::post('/create-checkout-session', [SubscriptionController::class, 'createCheckoutSession'])->name('stripe.checkout');
    Route::get('/stripe/success', [SubscriptionController::class, 'success'])->name('stripe.success');
    Route::post('/cancel-subscription', [SubscriptionController::class, 'cancelSubscription'])->name('subscription.cancel');
    Route::post('/trial/cancel', [SubscriptionController::class, 'cancelTrial'])->name('trial.cancel');
});
Route::post('/stripe/webhook', [StripeWebhookController::class, 'handleWebhook']);



//Analytics Dashboard
// Track Post and Events Views
Route::post('/posts/{id}/track-view', [PostController::class, 'trackView'])->name('posts.trackView');
Route::post('/events/{id}/track-view', [EventController::class, 'trackView'])->name('events.trackView');

// Apply for course
Route::post('/course/apply/{institute}', [ApplyCaseController::class, 'store'])->name('course.apply');

// Analytics trends
Route::get('/analytics/post-views-trends', [AnalyticsController::class, 'getPostViewsTrends']);
Route::get('/analytics/event-views-trends', [AnalyticsController::class, 'eventViewTrend']);
Route::get('/analytics/profile-views-trends', [AnalyticsController::class, 'profileViewsTrends']);
Route::get('/analytics/course-applications-trends', [AnalyticsController::class, 'courseApplicationsTrends']);
Route::get('/analytics/followers-trends', [AnalyticsController::class, 'followersTrends']);


Route::patch('/posts/{id}/toggle-status', [AnalyticsController::class, 'toggleStatus'])->name('posts.toggle-status');
Route::patch('/events/{event}/toggle-status', function (App\Models\Event $event) {
    $event->is_active = !$event->is_active;
    $event->save();

    return response()->json([
        'success' => true,
        'new_status' => $event->is_active ? 'active' : 'inactive'
    ]);
});



// Post Boosting Routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/posts/{post}/boost', [PostBoostController::class, 'showBoostOptions'])->name('posts.boost.options');
    Route::post('/posts/{post}/boost/initiate', [PostBoostController::class, 'initiateBoostPayment'])->name('posts.boost.initiate');
    Route::post('/posts/boost/webhook', [PostBoostController::class, 'handleStripeWebhook'])->name('posts.boost.webhook'); // Stripe webhook
});



// Route::get('/posts/{post}/boost/success', function (Post $post) {
//     $institute = $post->institute;
//     return view('frontend.analytics.boost-success', compact('post', 'institute'));
// })->name('boost.success');

// Event Interest and Decline
Route::post('/events/{event}/interest', [EventController::class, 'markInterest'])->name('events.interest');
Route::post('/events/{event}/decline', [EventController::class, 'markDecline'])->name('events.decline');

// Delete single image (chancellor / vice-chancellor)
Route::post('/institute/delete-single-image', [AboutSectionController::class, 'deleteSingleImage'])->name('institute.deleteSingleImage');

// Delete multiple images (academic, programs, life, etc.)
Route::post('/institute/delete-multi-image', [AboutSectionController::class, 'deleteMultiImage'])->name('institute.deleteMultiImage');



// Privacy Policy Routes
// Route::get('/admin/privacy-policy', [PolicyController::class, 'adminIndex'])->defaults('type', 'privacy')->name('admin.privacy_policy');
// Route::post('/admin/privacy-policy', [PolicyController::class, 'store'])->name('privacy_policy.store');
// Route::put('/admin/privacy-policy/{id}', [PolicyController::class, 'update'])->name('privacy_policy.update');
// Route::delete('/admin/privacy-policy/{id}', [PolicyController::class, 'destroy'])->name('privacy_policy.destroy');
// Frontend privacy policy page
Route::get('/privacy-policy', [PolicyController::class, 'showPrivacy'])->name('privacy.policy');

// Terms and Conditions Routes
// Route::get('/admin/terms', [PolicyController::class, 'adminIndex'])->defaults('type', 'terms')->name('admin.terms');
// Route::post('/admin/terms', [PolicyController::class, 'store'])->name('terms.store');
// Route::put('/admin/terms/{id}', [PolicyController::class, 'update'])->name('terms.update');
// Route::delete('/admin/terms/{id}', [PolicyController::class, 'destroy'])->name('terms.destroy');
// Frontend
Route::get('/terms-conditions', [PolicyController::class, 'showTerms'])->name('terms.show');

// Refund Policy Routes
// Route::get('/admin/refund-policy', [PolicyController::class, 'adminIndex'])->defaults('type', 'refund')->name('admin.refund_policy');
// Route::post('/admin/refund-policy', [PolicyController::class, 'store'])->name('refund_policy.store');
// Route::put('/admin/refund-policy/{id}', [PolicyController::class, 'update'])->name('refund_policy.update');
// Route::delete('/admin/refund-policy/{id}', [PolicyController::class, 'destroy'])->name('refund_policy.destroy');
// Frontend refund policy page
Route::get('/refund-policy', [PolicyController::class, 'showRefund'])->name('refund.policy');


// Ratings in Admin
Route::get('/admin/ratings', [RatingsController::class, 'index'])->name('admin.ratings');
Route::delete('/admin/review/{id}', [RatingsController::class, 'adminDelete'])->name('admin.delete.review');


// Saved Posts Routes
Route::middleware(['auth'])->group(function () {
    Route::post('/posts/{postId}/save', [SavedPostController::class, 'toggleSave'])->name('posts.save');
    Route::get('/saved-posts', [SavedPostController::class, 'viewSaved'])->name('saved.posts');
});
