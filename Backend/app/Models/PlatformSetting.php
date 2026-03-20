<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class PlatformSetting extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'site_name',
        'tagline',
        'timezone',
        'contact_email',
        'support_phone',
        'logo_path',
        'favicon_path',
        'allow_institute_registration',
        'allow_user_registration',
        'allow_login',
        'subscription_price',
        'about_text',
        'vision_text',
        'mission_text',
        'address_text',
        'social_links',
        'home_slides_paths',
        'show_testimonials',
        'show_partners',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'allow_institute_registration' => 'boolean',
        'allow_user_registration' => 'boolean',
        'allow_login' => 'boolean',
        'subscription_price' => 'float',
        'social_links' => 'array',
        'home_slides_paths' => 'array',
        'show_testimonials' => 'boolean',
        'show_partners' => 'boolean',
    ];

    /**
     * Get the singleton instance of platform settings.
     * Creates default settings if none exist.
     *
     * @return PlatformSetting
     */
    public static function getInstance(): PlatformSetting
    {
        $settings = self::first();

        if (!$settings) {
            $settings = self::create([
                'site_name' => 'UniAds',
                'tagline' => 'Discover. Decide. Succeed.',
                'timezone' => 'Asia/Colombo',
                'contact_email' => 'contact@uniads.com',
                'support_phone' => '+94 11 234 5678',
                'allow_institute_registration' => true,
                'allow_user_registration' => true,
                'allow_login' => true,
                'subscription_price' => 4990.00,
                'about_text' => 'UniAds is a comprehensive digital platform designed to simplify and modernize how higher education opportunities are discovered and promoted in Sri Lanka.',
                'vision_text' => 'To become Sri Lanka’s most trusted and innovative digital platform for discovering, comparing, and connecting with higher education opportunities.',
                'mission_text' => 'To provide a centralized, transparent, and user-friendly platform that empowers students to make informed educational decisions.',
                'address_text' => 'Kandy, Sri Lanka',
                'social_links' => [
                    ['platform' => 'whatsapp', 'url' => 'https://wa.me/94772300279'],
                    ['platform' => 'facebook', 'url' => 'https://web.facebook.com/profile.php?id=61579680668904'],
                ],
                'home_slides_paths' => [],
                'show_testimonials' => true,
                'show_partners' => true,
            ]);
        }

        return $settings;
    }

    /**
     * Get the full public URL for the logo.
     *
     * @return string|null
     */
    public function getLogoUrlAttribute(): ?string
    {
        if ($this->logo_path) {
            return url('storage/' . $this->logo_path);
        }
        return null;
    }

    /**
     * Get the full public URL for the favicon.
     *
     * @return string|null
     */
    public function getFaviconUrlAttribute(): ?string
    {
        if ($this->favicon_path) {
            return url('storage/' . $this->favicon_path);
        }
        return null;
    }

    /**
     * Get the full public URLs for the home slides.
     *
     * @return array
     */
    public function getHomeSlidesUrlsAttribute(): array
    {
        $paths = $this->getAttribute('home_slides_paths');

        // Ensure we're working with an array (handle legacy data or string casts)
        if (is_string($paths)) {
            $paths = json_decode($paths, true);
        }

        if (!is_array($paths)) {
            return [];
        }

        return array_map(function ($path) {
            // Ensure path is cleaned if it already contains 'storage/'
            $cleanPath = str_replace('storage/', '', $path);
            return Storage::disk('public')->url($cleanPath);
        }, $paths);
    }

    /**
     * Append custom attributes to model's array form.
     *
     * @var array<int, string>
     */
    protected $appends = ['logo_url', 'favicon_url', 'home_slides_urls'];
}
