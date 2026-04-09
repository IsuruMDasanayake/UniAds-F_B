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
     * Adds a composite unique index on apply_cases(user_id, post_id).
     *
     * WHY: Without this constraint a single user can submit unlimited applications
     * to the same course — either through UI double-submit, network retry, or by
     * clearing browser state between requests. The throttle middleware (3/min per IP)
     * only limits the rate; it does not prevent duplicates from distributed IPs.
     *
     * The unique index provides a database-level guarantee that each (user, post)
     * pair has at most one application, which is the correct business rule.
     *
     * BEFORE adding the index, we delete any existing duplicates, keeping the
     * earliest application per (user_id, post_id) pair. This ensures the migration
     * is safe to run on a database that already has data.
     */
    public function up(): void
    {
        // Remove any existing duplicates first (keep the oldest record for each user/post pair)
        DB::statement("
            DELETE FROM apply_cases 
            WHERE id NOT IN (
                SELECT min_id FROM (
                    SELECT MIN(id) as min_id 
                    FROM apply_cases 
                    GROUP BY user_id, post_id
                ) as temp
            )
        ");

        $indexExists = collect(DB::select("SHOW INDEX FROM apply_cases"))->contains('Key_name', 'apply_cases_user_post_unique');

        if (!$indexExists) {
            Schema::table('apply_cases', function (Blueprint $table) {
                $table->unique(['user_id', 'post_id'], 'apply_cases_user_post_unique');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('apply_cases', function (Blueprint $table) {
            $table->dropUnique('apply_cases_user_post_unique');
        });
    }
};
