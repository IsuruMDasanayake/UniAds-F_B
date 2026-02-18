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
        $settings = Cache::remember('platform_settings', 3600, function () {
            return PlatformSetting::getInstance();
        });

        // Add additional logic here if you need to filter sensitive data in the future
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
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:4096', // 4MB
            'favicon' => 'nullable|file|mimes:jpeg,png,jpg,gif,svg,ico|max:1024', // 1MB
            'allow_institute_registration' => 'sometimes',
            'allow_user_registration' => 'sometimes',
            'allow_login' => 'sometimes',
            'subscription_price' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
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
