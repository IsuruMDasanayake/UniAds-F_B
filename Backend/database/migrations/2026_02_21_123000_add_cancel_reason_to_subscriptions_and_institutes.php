<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->text('cancel_reason')->nullable()->after('cancelled_at');
        });

        Schema::table('institutes', function (Blueprint $table) {
            $table->text('trial_cancel_reason')->nullable()->after('trial_cancelled_at');
        });
    }

    public function down(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->dropColumn('cancel_reason');
        });

        Schema::table('institutes', function (Blueprint $table) {
            $table->dropColumn('trial_cancel_reason');
        });
    }
};
