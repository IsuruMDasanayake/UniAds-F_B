<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('institutes', function (Blueprint $table) {
            $table->boolean('is_premium')->default(false)->after('user_id');
            $table->date('premium_expires_at')->nullable()->after('is_premium');
            $table->boolean('is_trial_used')->default(false)->after('premium_expires_at');
        });
    }

    public function down(): void
    {
        Schema::table('institutes', function (Blueprint $table) {
            $table->dropColumn(['is_premium', 'premium_expires_at', 'is_trial_used']);
        });
    }
};

