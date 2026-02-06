<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\PlatformSetting;

class PlatformSettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create default platform settings (singleton)
        PlatformSetting::firstOrCreate(
            ['id' => 1], // Ensure only one row exists
            [
                'site_name' => 'UniAds',
                'tagline' => 'Discover. Decide. Succeed.',
                'timezone' => 'Asia/Colombo',
                'contact_email' => 'contact@uniads.com',
                'support_phone' => '+94 11 234 5678',
                'allow_institute_registration' => true,
                'enable_reviews' => true,
                'enable_followers' => true,
            ]
        );
    }
}
