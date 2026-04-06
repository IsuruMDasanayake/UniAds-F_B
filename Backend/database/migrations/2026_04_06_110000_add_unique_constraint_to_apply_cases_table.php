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
        Schema::table('apply_cases', function (Blueprint $table) {
            // Add a unique index on user_id and post_id to prevent duplicates
            $table->unique(['user_id', 'post_id'], 'apply_cases_user_post_unique');
        });
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
