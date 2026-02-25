<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\MinistryController;
use App\Http\Controllers\Api\DonationController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\WebhookController;
use App\Http\Controllers\Api\HeroImageController;
use App\Http\Controllers\Api\GalleryController;
use App\Http\Controllers\Api\SectionHeroImageController;
use App\Http\Controllers\Api\AnnouncementController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // Public Routes
    Route::post('/auth/login', [AuthController::class, 'login']);

    // Events - Public
    Route::get('/events', [EventController::class, 'index']);
    Route::get('/events/{id}', [EventController::class, 'show']);
    Route::post('/events/{id}/rsvp', [EventController::class, 'rsvp']);

    // Ministries - Public
    Route::get('/ministries', [MinistryController::class, 'index']);
    Route::get('/ministries/categories', [MinistryController::class, 'categories']);
    Route::get('/ministries/{id}', [MinistryController::class, 'show']);
    Route::get('/ministries/search', [MinistryController::class, 'search']);

    // Donations - Public (payment-intent must come before generic /donations)
    Route::post('/donations/payment-intent', [DonationController::class, 'paymentIntent']);
    Route::post('/donations/paypal-checkout', [DonationController::class, 'paypalCheckout']);
    Route::get('/donations/paypal-approve', [DonationController::class, 'paypalApprove'])->name('donations.paypal-approve');
    Route::get('/donations/paypal-return', [DonationController::class, 'paypalReturn'])->name('donations.paypal-return');
    Route::get('/donations/paypal-cancel', [DonationController::class, 'paypalCancel'])->name('donations.paypal-cancel');
    Route::post('/donations', [DonationController::class, 'store']);
    Route::get('/donations/stats', [DonationController::class, 'publicStats']);

    // Contact - Public
    Route::post('/contact', [ContactController::class, 'store']);
    Route::post('/contact/subscribe', [ContactController::class, 'subscribe']);
    Route::get('/newsletter/unsubscribe', [ContactController::class, 'unsubscribe']);

    // Announcements - Public
    Route::get('/announcements', [AnnouncementController::class, 'index']);
    Route::get('/announcements/{id}', [AnnouncementController::class, 'show']);

    // Hero Images - Public
    Route::get('/hero-images', [HeroImageController::class, 'index']);

    // Gallery - Public
    Route::get('/gallery/{section}', [GalleryController::class, 'getBySection']);

    // Section Hero Images - Public
    Route::get('/section-heroes/{section}', [SectionHeroImageController::class, 'getBySection']);

    // Webhooks - External payment providers (no auth required)
    Route::post('/webhooks/stripe', [WebhookController::class, 'handleStripe']);
    Route::post('/webhooks/paypal', [WebhookController::class, 'handlePayPal']);
    Route::get('/webhooks/test', [WebhookController::class, 'testWebhook']);

    // Protected Routes
    Route::middleware('auth:sanctum')->group(function () {
        // Auth
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::put('/auth/profile', [AuthController::class, 'updateProfile']);

        // Admin Routes
        Route::middleware('role:admin')->prefix('admin')->group(function () {
            // Events Management
            Route::post('/events', [EventController::class, 'store']);
            Route::put('/events/{id}', [EventController::class, 'update']);
            Route::delete('/events/{id}', [EventController::class, 'destroy']);

            // Ministries Management
            Route::post('/ministries', [MinistryController::class, 'store']);
            Route::put('/ministries/{id}', [MinistryController::class, 'update']);
            Route::delete('/ministries/{id}', [MinistryController::class, 'destroy']);

            // Donations Management
            Route::get('/donations', [DonationController::class, 'index']);
            Route::get('/donations/export', [DonationController::class, 'export']);
            Route::get('/donations/{id}', [DonationController::class, 'show']);
            Route::put('/donations/{id}', [DonationController::class, 'update']);

            // Contact Messages
            Route::get('/contact-messages', [ContactController::class, 'index']);
            Route::put('/contact-messages/{id}/read', [ContactController::class, 'markAsRead']);
            Route::post('/contact-messages/{id}/reply', [ContactController::class, 'reply']);
            Route::delete('/contact-messages/{id}', [ContactController::class, 'destroy']);

            // Newsletter Management
            Route::get('/newsletter/subscribers', [ContactController::class, 'getSubscribers']);
            Route::post('/newsletter/send', [ContactController::class, 'sendNewsletter']);

            // Dashboard
            Route::get('/dashboard/analytics', [DashboardController::class, 'analytics']);
            Route::get('/dashboard/donations', [DashboardController::class, 'donations']);
            Route::get('/dashboard/events', [DashboardController::class, 'events']);
            Route::get('/dashboard/ministries', [DashboardController::class, 'ministries']);

            // Hero Images Management
            Route::get('/hero-images', [HeroImageController::class, 'index']);
            Route::post('/hero-images', [HeroImageController::class, 'store']);
            Route::put('/hero-images/{id}', [HeroImageController::class, 'update']);
            Route::delete('/hero-images/{id}', [HeroImageController::class, 'destroy']);

            // Gallery Management
            Route::get('/gallery', [GalleryController::class, 'index']);
            Route::post('/gallery', [GalleryController::class, 'store']);
            Route::put('/gallery/{id}', [GalleryController::class, 'update']);
            Route::delete('/gallery/{id}', [GalleryController::class, 'destroy']);

            // Section Hero Images Management
            Route::get('/section-heroes', [SectionHeroImageController::class, 'index']);
            Route::post('/section-heroes', [SectionHeroImageController::class, 'store']);
            Route::put('/section-heroes/{id}', [SectionHeroImageController::class, 'update']);
            Route::delete('/section-heroes/{id}', [SectionHeroImageController::class, 'destroy']);

            // Announcements Management
            Route::get('/announcements', [AnnouncementController::class, 'index']);
            Route::post('/announcements', [AnnouncementController::class, 'store']);
            Route::put('/announcements/{id}', [AnnouncementController::class, 'update']);
            Route::delete('/announcements/{id}', [AnnouncementController::class, 'destroy']);
        });
    });
});

// Health check
Route::get('/health', function () {
    return response()->json(['status' => 'ok']);
});
