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
     * Append custom attributes to model's array form.
     *
     * @var array<int, string>
     */
    protected $appends = ['logo_url', 'favicon_url'];
}
