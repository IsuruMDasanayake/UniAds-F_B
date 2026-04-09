<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Stores pending guest registration payloads (institute registration)
 * until the OTP email is verified.
 *
 * Replaces the brittle PHP-session approach:
 *  - Safe across multiple browser tabs (last storeInstitute() wins per email)
 *  - Not lost if the session driver flushes
 *  - Has an explicit, enforced TTL (expires_at)
 */
class PendingRegistration extends Model
{
    protected $fillable = [
        'email',
        'type',
        'data',
        'expires_at',
    ];

    protected $casts = [
        'data'       => 'array',
        'expires_at' => 'datetime',
    ];

    /**
     * Find a non-expired pending registration by email.
     */
    public static function findValidByEmail(string $email): ?static
    {
        return static::where('email', $email)
            ->where('expires_at', '>', now())
            ->first();
    }

    /**
     * Upsert a pending registration record for the given email.
     * Using updateOrCreate ensures a second tab or resend OTP does not
     * create a duplicate — it simply refreshes the TTL and data.
     */
    public static function upsertForEmail(string $email, string $type, array $data): static
    {
        return static::updateOrCreate(
            ['email' => $email],
            [
                'type'       => $type,
                'data'       => $data,
                'expires_at' => now()->addMinutes(15),
            ]
        );
    }

    /**
     * Delete any pending registration for the given email (after completion
     * or explicit cancellation).
     */
    public static function clearForEmail(string $email): void
    {
        static::where('email', $email)->delete();
    }
}
