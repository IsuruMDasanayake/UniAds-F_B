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
        Schema::create('career_guidances', function (Blueprint $table) {
            $table->id();
            $table->string('education_level')->nullable();
            $table->string('stream_or_subject_interest')->nullable();
            $table->string('recommended_degree_or_course')->nullable();
            $table->string('career_field')->nullable();
            $table->string('entry_level_job')->nullable();
            $table->string('mid_level_job')->nullable();
            $table->string('senior_level_job')->nullable();
            $table->text('key_skills_required')->nullable();
            $table->text('recommended_soft_skills')->nullable();
            $table->text('typical_university_subjects')->nullable();
            $table->text('certifications_or_extra_training')->nullable();
            $table->string('industry_growth_in_sri_lanka')->nullable();
            $table->string('global_demand_level')->nullable();
            $table->string('average_starting_salary_lkr')->nullable();
            $table->string('future_salary_range_lkr')->nullable();
            $table->string('remote_work_possibility')->nullable();
            $table->string('freelance_opportunity')->nullable();
            $table->string('automation_risk')->nullable();
            $table->text('job_description')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('career_guidances');
    }
};
