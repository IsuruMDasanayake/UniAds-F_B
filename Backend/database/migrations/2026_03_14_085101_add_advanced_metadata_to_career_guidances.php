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
            $table->string('career_difficulty')->nullable()->after('automation_risk');
            $table->integer('study_duration_years')->nullable()->after('career_difficulty');
            $table->string('local_job_availability')->nullable()->after('study_duration_years');
            $table->string('international_opportunity')->nullable()->after('local_job_availability');
            $table->string('recommended_first_step')->nullable()->after('international_opportunity');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('career_guidances', function (Blueprint $table) {
            $table->dropColumn([
                'career_difficulty',
                'study_duration_years',
                'local_job_availability',
                'international_opportunity',
                'recommended_first_step'
            ]);
        });
    }
};
