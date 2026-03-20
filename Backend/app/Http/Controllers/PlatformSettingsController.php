<?php

namespace App\Http\Controllers;

use App\Models\PlatformSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use App\Services\AdminActivityLogger;

class PlatformSettingsController extends Controller
{
    /**
     * Get platform settings (cached).
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $settings = Cache::remember('platform_settings', 3600, function () {
            return PlatformSetting::getInstance();
        });

        return response()->json($settings);
    }

    /**
     * Get platform settings for public use.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function publicIndex()
    {
        $settings = PlatformSetting::getInstance();
        return response()->json($settings);
    }

    /**
     * Update platform settings.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request)
    {
        // Debug logging
        \Illuminate\Support\Facades\Log::info('PlatformSettings Update Request Data:', $request->all());

        // Validate input
        $validator = Validator::make($request->all(), [
            'site_name' => 'required|string|max:255',
            'tagline' => 'nullable|string|max:255',
            'timezone' => 'required|string|max:100',
            'contact_email' => 'required|email|max:255',
            'support_phone' => 'required|string|max:50',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:10240', // 10MB
            'favicon' => 'nullable|file|mimes:jpeg,png,jpg,gif,svg,ico|max:2048', // 2MB
            'allow_institute_registration' => 'sometimes',
            'allow_user_registration' => 'sometimes',
            'allow_login' => 'sometimes',
            'subscription_price' => 'required|numeric|min:0',
            'about_text' => 'nullable|string',
            'vision_text' => 'nullable|string',
            'mission_text' => 'nullable|string',
            'address_text' => 'nullable|string',
            'social_links' => 'nullable|string', // Expecting JSON string from frontend
            'home_slides.*' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:10240', // 10MB each
            'removed_slides' => 'nullable|string', // JSON array of slide paths to remove
            'show_testimonials' => 'sometimes',
            'show_partners' => 'sometimes',
        ]);

        if ($validator->fails()) {
            \Illuminate\Support\Facades\Log::warning('PlatformSettings Validation Failed:', $validator->errors()->toArray());
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Get or create settings instance
        $settings = PlatformSetting::getInstance();

        // Handle logo upload
        if ($request->hasFile('logo')) {
            // Delete old logo if exists
            if ($settings->logo_path && Storage::disk('public')->exists($settings->logo_path)) {
                Storage::disk('public')->delete($settings->logo_path);
            }

            // Store new logo
            $logoPath = $request->file('logo')->store('settings', 'public');
            $settings->logo_path = $logoPath;
        }

        // Handle favicon upload
        if ($request->hasFile('favicon')) {
            // Delete old favicon if exists
            if ($settings->favicon_path && Storage::disk('public')->exists($settings->favicon_path)) {
                Storage::disk('public')->delete($settings->favicon_path);
            }

            // Store new favicon
            $faviconPath = $request->file('favicon')->store('settings', 'public');
            $settings->favicon_path = $faviconPath;
        }

        // Handle Home Slides uploads
        $slides = $settings->home_slides_paths ?? [];

        // Remove slides if requested
        if ($request->has('removed_slides')) {
            $removedSlides = json_decode($request->input('removed_slides'), true);
            if (is_array($removedSlides)) {
                foreach ($removedSlides as $path) {
                    if (Storage::disk('public')->exists($path)) {
                        Storage::disk('public')->delete($path);
                    }
                    $slides = array_filter($slides, fn($s) => $s !== $path);
                }
            }
        }

        // Debug log for files
        if ($request->hasFile('home_slides')) {
            $uploadedFiles = $request->file('home_slides');
            \Illuminate\Support\Facades\Log::info('Home Slides uploaded:', ['count' => count($uploadedFiles)]);
            foreach ($uploadedFiles as $index => $slideFile) {
                if (!$slideFile->isValid()) {
                    \Illuminate\Support\Facades\Log::error("Slide {$index} is not valid. Error: " . $slideFile->getErrorMessage());
                } else {
                    $path = $slideFile->store('settings/slides', 'public');
                    $slides[] = $path;
                }
            }
        }
        $settings->home_slides_paths = array_values($slides);

        // Update other fields
        $settings->site_name = $request->input('site_name');
        $settings->tagline = $request->input('tagline');
        $settings->timezone = $request->input('timezone');
        $settings->contact_email = $request->input('contact_email');
        $settings->support_phone = $request->input('support_phone');
        $settings->allow_institute_registration = $request->boolean('allow_institute_registration');
        $settings->allow_user_registration = $request->boolean('allow_user_registration');
        $settings->allow_login = $request->boolean('allow_login');
        $settings->subscription_price = $request->input('subscription_price');
        $settings->about_text = $request->input('about_text');
        $settings->vision_text = $request->input('vision_text');
        $settings->mission_text = $request->input('mission_text');
        $settings->address_text = $request->input('address_text');
        $settings->show_testimonials = $request->boolean('show_testimonials');
        $settings->show_partners = $request->boolean('show_partners');

        // Handle Social Links
        if ($request->has('social_links')) {
            $socialLinks = json_decode($request->input('social_links'), true);
            $settings->social_links = is_array($socialLinks) ? $socialLinks : [];
        }

        // Save settings
        $saved = $settings->save();
        \Illuminate\Support\Facades\Log::info('PlatformSettings Save Result: ' . ($saved ? 'Success' : 'Failed'));

        // Clear cache
        Cache::forget('platform_settings');

        AdminActivityLogger::log(
            'Updated Settings',
            'PlatformSetting',
            $settings->id,
            auth()->user()->name . " updated platform settings (site name, registration rules, etc.)"
        );

        return response()->json([
            'message' => 'Settings updated successfully',
            'settings' => $settings->fresh()
        ]);
    }
}
