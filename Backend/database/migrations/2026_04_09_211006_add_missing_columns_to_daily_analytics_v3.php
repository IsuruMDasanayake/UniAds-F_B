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
        Schema::table('daily_analytics', function (Blueprint $table) {
            if (!Schema::hasColumn('daily_analytics', 'event_views')) {
                $table->integer('event_views')->default(0)->after('post_views');
            }
            if (!Schema::hasColumn('daily_analytics', 'post_likes')) {
                $table->integer('post_likes')->default(0)->after('event_views');
            }
            if (!Schema::hasColumn('daily_analytics', 'event_interests')) {
                $table->integer('event_interests')->default(0)->after('post_likes');
            }
            if (!Schema::hasColumn('daily_analytics', 'applications')) {
                $table->integer('applications')->default(0)->after('event_interests');
            }
            if (!Schema::hasColumn('daily_analytics', 'new_ratings')) {
                $table->integer('new_ratings')->default(0)->after('applications');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('daily_analytics', function (Blueprint $table) {
            $table->dropColumn([
                'event_views',
                'post_likes',
                'event_interests',
                'applications',
                'new_ratings'
            ]);
        });
    }
};
