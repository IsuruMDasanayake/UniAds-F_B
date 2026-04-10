<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Adds a UNIQUE index on subscriptions.gateway_subscription_id.
     * This enforces PayHere webhook idempotency at the database level —
     * even if the application-level check is bypassed, a duplicate IPN
     * cannot insert a second Subscription row for the same payment_id.
     *
     * MySQL treats NULL as distinct from NULL, so trial records (which have
     * no gateway ID) and manual records with NULL are unaffected.
     */
    public function up(): void
    {
        // Deduplicate any existing rows with the same gateway_subscription_id
        // before adding the unique constraint (keeps the most recent record).
        DB::statement("
            DELETE s1 FROM subscriptions s1
            INNER JOIN subscriptions s2
            WHERE s1.id < s2.id
              AND s1.gateway_subscription_id = s2.gateway_subscription_id
              AND s1.gateway_subscription_id IS NOT NULL
        ");

        Schema::table('subscriptions', function (Blueprint $table) {
            $table->unique('gateway_subscription_id', 'subscriptions_gateway_subscription_id_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->dropUnique('subscriptions_gateway_subscription_id_unique');
        });
    }
};
