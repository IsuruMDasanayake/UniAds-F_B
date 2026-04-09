<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Stores pending institute (and future guest) registration payloads
     * in the database instead of the PHP session.
     *
     * Why: PHP session data can be lost when:
     *  - The user has multiple tabs open (second tab overwrites first)
     *  - The session driver flushes early under memory pressure
     *  - The user waits longer than the session lifetime before verifying
     *
     * The record is keyed by email so it is looked up the same way the
     * OTP cache key is keyed ("otp_verification:{email}").
     * expires_at is set to 15 minutes — well above the 2-minute OTP TTL,
     * but short enough that stale records don't accumulate.
     */
    public function up(): void
    {
        Schema::create('pending_registrations', function (Blueprint $table) {
            $table->id();
            $table->string('email')->unique(); // one pending record per email
            $table->string('type')->default('Institute'); // 'Institute' | 'User'
            $table->json('data'); // full sanitized request payload
            $table->timestamp('expires_at'); // 15-minute TTL
            $table->timestamps();

            $table->index('expires_at'); // for scheduled cleanup
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pending_registrations');
    }
};
