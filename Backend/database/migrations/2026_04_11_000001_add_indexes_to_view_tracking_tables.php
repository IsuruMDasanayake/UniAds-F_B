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
        // 1. Post Views Table
        Schema::table('post_views', function (Blueprint $table) {
            $table->index('viewed_at');
            $table->index(['post_id', 'viewed_at']);
        });

        // 2. Event Views Table
        Schema::table('event_views', function (Blueprint $table) {
            $table->index('viewed_at');
            $table->index(['event_id', 'viewed_at']);
        });

        // 3. Institute Profile Views Table
        Schema::table('institute_profile_views', function (Blueprint $table) {
            $table->index('viewed_at');
            $table->index(['institute_id', 'viewed_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('post_views', function (Blueprint $table) {
            $table->dropIndex(['viewed_at']);
            $table->dropIndex(['post_id', 'viewed_at']);
        });

        Schema::table('event_views', function (Blueprint $table) {
            $table->dropIndex(['viewed_at']);
            $table->dropIndex(['event_id', 'viewed_at']);
        });

        Schema::table('institute_profile_views', function (Blueprint $table) {
            $table->dropIndex(['viewed_at']);
            $table->dropIndex(['institute_id', 'viewed_at']);
        });
    }
};
