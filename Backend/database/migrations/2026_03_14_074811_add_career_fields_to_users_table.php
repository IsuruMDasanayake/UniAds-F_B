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
        Schema::table('users', function (Blueprint $table) {
            $table->string('path_preference')->nullable()->after('education_level');
            $table->string('al_stream')->nullable()->after('path_preference');
            $table->string('main_field')->nullable()->after('al_stream');
            $table->string('interest')->nullable()->after('main_field');
            $table->string('study_preference')->nullable()->after('interest');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['path_preference', 'al_stream', 'main_field', 'interest', 'study_preference']);
        });
    }
};
