<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('platform_settings', function (Blueprint $table) {
            $table->text('about_text')->nullable()->after('subscription_price');
            $table->text('vision_text')->nullable()->after('about_text');
            $table->text('mission_text')->nullable()->after('vision_text');
            $table->string('address_text')->nullable()->after('mission_text');
            $table->json('social_links')->nullable()->after('address_text');
            $table->json('home_slides_paths')->nullable()->after('social_links');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('platform_settings', function (Blueprint $table) {
            $table->dropColumn([
                'about_text',
                'vision_text',
                'mission_text',
                'address_text',
                'social_links',
                'home_slides_paths'
            ]);
        });
    }
};
