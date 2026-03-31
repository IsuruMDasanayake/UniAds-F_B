<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CareerGuidance extends Model
{
    protected $fillable = [
        'education_level',
        'stream_or_subject_interest',
        'recommended_degree_or_course',
        'career_field',
        'entry_level_job',
        'mid_level_job',
        'senior_level_job',
        'key_skills_required',
        'recommended_soft_skills',
        'typical_university_subjects',
        'certifications_or_extra_training',
        'industry_growth_in_sri_lanka',
        'global_demand_level',
        'average_starting_salary_lkr',
        'future_salary_range_lkr',
        'remote_work_possibility',
        'freelance_opportunity',
        'automation_risk',
        'job_description',
        'category',
        'alternative_path',
        'recommended_first_step',
        'top_university_specialization',
        'professional_body_in_sri_lanka',
        'common_interview_questions',
        'tags',
        'postgrad_path'
    ];
}
