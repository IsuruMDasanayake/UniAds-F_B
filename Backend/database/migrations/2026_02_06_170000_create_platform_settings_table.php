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
        Schema::create('platform_settings', function (Blueprint $table) {
            $table->id();

            // General Settings
            $table->string('site_name');
            $table->string('tagline')->nullable();
            $table->string('timezone')->default('Asia/Colombo');
            $table->string('contact_email');
            $table->string('support_phone');

            // Branding Assets
            $table->string('logo_path')->nullable();
            $table->string('favicon_path')->nullable();

            // Behavior Settings
            $table->boolean('allow_institute_registration')->default(true);
            $table->boolean('enable_reviews')->default(true);
            $table->boolean('enable_followers')->default(true);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('platform_settings');
    }
};
