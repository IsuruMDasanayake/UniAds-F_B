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
        Schema::table('career_guidance', function (Blueprint $table) {
            // Adding indexes to improve LIKE and exact match query performance
            $table->index('career_field');
            $table->index('career_category');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('career_guidance', function (Blueprint $table) {
            $table->dropIndex(['career_field']);
            $table->dropIndex(['career_category']);
        });
    }
};
