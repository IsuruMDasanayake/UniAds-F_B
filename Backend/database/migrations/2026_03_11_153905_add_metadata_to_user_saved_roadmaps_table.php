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
        Schema::table('user_saved_roadmaps', function (Blueprint $table) {
            $table->string('interest')->nullable()->after('career_goal');
            $table->string('education_level')->nullable()->after('interest');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_saved_roadmaps', function (Blueprint $table) {
            $table->dropColumn(['interest', 'education_level']);
        });
    }
};
