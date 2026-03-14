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
        Schema::table('career_guidances', function (Blueprint $table) {
            $table->string('career_category')->nullable()->after('id');
            $table->string('al_stream_required')->nullable()->after('career_field');
            $table->string('alternative_path')->nullable()->after('recommended_degree_or_course');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('career_guidances', function (Blueprint $table) {
            $table->dropColumn(['career_category', 'al_stream_required', 'alternative_path']);
        });
    }
};
