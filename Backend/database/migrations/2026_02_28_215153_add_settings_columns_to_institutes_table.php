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
        Schema::table('institutes', function (Blueprint $table) {
            $table->decimal('latitude', 10, 8)->nullable()->after('location');
            $table->decimal('longitude', 11, 8)->nullable()->after('latitude');
            $table->boolean('chat_enabled')->default(true)->after('reviews_enabled');
            $table->boolean('inquiries_enabled')->default(true)->after('chat_enabled');
            $table->boolean('applications_enabled')->default(true)->after('inquiries_enabled');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('institutes', function (Blueprint $table) {
            $table->dropColumn([
                'latitude',
                'longitude',
                'chat_enabled',
                'inquiries_enabled',
                'applications_enabled'
            ]);
        });
    }
};
