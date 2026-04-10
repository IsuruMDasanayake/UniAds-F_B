<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Update existing 'unapproved' records to 'pending'
        // We do this before changing the enum to ensure data integrity if the new enum doesn't include the old value
        DB::table('institutes')->where('status', 'unapproved')->update(['status' => 'pending']);

        // 2. Change the enum column
        // Note: For MySQL, we use a raw statement to change the enum.
        Schema::table('institutes', function (Blueprint $table) {
            DB::statement("ALTER TABLE institutes MODIFY COLUMN status ENUM('pending', 'approved') NOT NULL DEFAULT 'pending'");
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // 1. Convert back to 'unapproved'
        DB::table('institutes')->where('status', 'pending')->update(['status' => 'unapproved']);

        // 2. Change the enum back
        Schema::table('institutes', function (Blueprint $table) {
            DB::statement("ALTER TABLE institutes MODIFY COLUMN status ENUM('unapproved', 'approved') NOT NULL DEFAULT 'unapproved'");
        });
    }
};
