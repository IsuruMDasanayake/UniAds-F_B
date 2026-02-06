<?php

use App\Models\PlatformSetting;
use Illuminate\Support\Facades\Cache;

if (!function_exists('setting')) {
    /**
     * Get a platform setting value by key.
     *
     * @param string $key
     * @param mixed $default
     * @return mixed
     */
    function setting(string $key, $default = null)
    {
        $settings = Cache::remember('platform_settings', 3600, function () {
            return PlatformSetting::getInstance();
        });

        return $settings->{$key} ?? $default;
    }
}
