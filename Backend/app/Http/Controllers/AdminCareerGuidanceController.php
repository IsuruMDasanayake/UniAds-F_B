<?php

namespace App\Http\Controllers;

use App\Models\CareerGuidance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Exception;
use App\Traits\ApiResponse;

class AdminCareerGuidanceController extends Controller
{
    use ApiResponse;
    public function index(Request $request)
    {
        $query = CareerGuidance::query();

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where('career_field', 'LIKE', "%{$search}%")
                  ->orWhere('category', 'LIKE', "%{$search}%")
                  ->orWhere('education_level', 'LIKE', "%{$search}%");
        }

        $guidances = $query->orderBy('id', 'desc')->get();
        return $this->successResponse($guidances);
    }

    public function store(Request $request)
    {
        return DB::transaction(function () use ($request) {
            $data = $request->only([
                'education_level', 'stream_or_subject_interest', 'recommended_degree_or_course', 
                'career_field', 'entry_level_job', 'mid_level_job', 'senior_level_job', 
                'key_skills_required', 'recommended_soft_skills', 'typical_university_subjects', 
                'certifications_or_extra_training', 'industry_growth_in_sri_lanka', 
                'global_demand_level', 'average_starting_salary_lkr', 'future_salary_range_lkr', 
                'remote_work_possibility', 'freelance_opportunity', 'automation_risk', 
                'job_description', 'category', 'alternative_path', 'recommended_first_step', 
                'top_university_specialization', 'professional_body_in_sri_lanka', 
                'common_interview_questions', 'tags', 'postgrad_path'
            ]);
            $guidance = CareerGuidance::create($data);
            return $this->success($guidance, 'Career guidance created successfully', 201);
        });
    }


    public function show($id)
    {
        $guidance = CareerGuidance::findOrFail($id);
        return $this->success($guidance);
    }


    public function update(Request $request, $id)
    {
        return DB::transaction(function () use ($request, $id) {
            $guidance = CareerGuidance::findOrFail($id);
            $data = $request->only([
                'education_level', 'stream_or_subject_interest', 'recommended_degree_or_course', 
                'career_field', 'entry_level_job', 'mid_level_job', 'senior_level_job', 
                'key_skills_required', 'recommended_soft_skills', 'typical_university_subjects', 
                'certifications_or_extra_training', 'industry_growth_in_sri_lanka', 
                'global_demand_level', 'average_starting_salary_lkr', 'future_salary_range_lkr', 
                'remote_work_possibility', 'freelance_opportunity', 'automation_risk', 
                'job_description', 'category', 'alternative_path', 'recommended_first_step', 
                'top_university_specialization', 'professional_body_in_sri_lanka', 
                'common_interview_questions', 'tags', 'postgrad_path'
            ]);
            $guidance->update($data);
            return $this->success($guidance);
        });
    }


    public function destroy($id)
    {
        return DB::transaction(function () use ($id) {
            $guidance = CareerGuidance::findOrFail($id);
            $guidance->delete();
            return $this->success(null, 'Deleted successfully');
        });
    }



}
