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
        Schema::table('posts', function (Blueprint $table) {
            $table->index('created_at');
            $table->index('institute_id');
            $table->index('course_type');
            $table->index('status');
        });

        Schema::table('institutes', function (Blueprint $table) {
            $table->index('followers_count');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            $table->dropIndex(['created_at']);
            $table->dropIndex(['institute_id']);
            $table->dropIndex(['course_type']);
            $table->dropIndex(['status']);
        });

        Schema::table('institutes', function (Blueprint $table) {
            $table->dropIndex(['followers_count']);
        });
    }
};
