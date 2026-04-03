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
        $validated = $request->validate([
            'education_level' => 'required|string',
            'stream_or_subject_interest' => 'nullable|string',
            'recommended_degree_or_course' => 'nullable|string',
            'career_field' => 'required|string',
            'entry_level_job' => 'nullable|string',
            'mid_level_job' => 'nullable|string',
            'senior_level_job' => 'nullable|string',
            'key_skills_required' => 'nullable|string',
            'recommended_soft_skills' => 'nullable|string',
            'typical_university_subjects' => 'nullable|string',
            'certifications_or_extra_training' => 'nullable|string',
            'industry_growth_in_sri_lanka' => 'nullable|string',
            'global_demand_level' => 'nullable|string',
            'average_starting_salary_lkr' => 'nullable|string',
            'future_salary_range_lkr' => 'nullable|string',
            'remote_work_possibility' => 'nullable|string',
            'freelance_opportunity' => 'nullable|string',
            'automation_risk' => 'nullable|string',
            'job_description' => 'required|string',
            'category' => 'nullable|string',
            'alternative_path' => 'nullable|string',
            'recommended_first_step' => 'nullable|string',
            'top_university_specialization' => 'nullable|string',
            'professional_body_in_sri_lanka' => 'nullable|string',
            'common_interview_questions' => 'nullable|string',
            'tags' => 'nullable|string',
            'postgrad_path' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated) {
            $guidance = CareerGuidance::create($validated);
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
        $validated = $request->validate([
            'education_level' => 'sometimes|required|string',
            'stream_or_subject_interest' => 'nullable|string',
            'recommended_degree_or_course' => 'nullable|string',
            'career_field' => 'sometimes|required|string',
            'entry_level_job' => 'nullable|string',
            'mid_level_job' => 'nullable|string',
            'senior_level_job' => 'nullable|string',
            'key_skills_required' => 'nullable|string',
            'recommended_soft_skills' => 'nullable|string',
            'typical_university_subjects' => 'nullable|string',
            'certifications_or_extra_training' => 'nullable|string',
            'industry_growth_in_sri_lanka' => 'nullable|string',
            'global_demand_level' => 'nullable|string',
            'average_starting_salary_lkr' => 'nullable|string',
            'future_salary_range_lkr' => 'nullable|string',
            'remote_work_possibility' => 'nullable|string',
            'freelance_opportunity' => 'nullable|string',
            'automation_risk' => 'nullable|string',
            'job_description' => 'sometimes|required|string',
            'category' => 'nullable|string',
            'alternative_path' => 'nullable|string',
            'recommended_first_step' => 'nullable|string',
            'top_university_specialization' => 'nullable|string',
            'professional_body_in_sri_lanka' => 'nullable|string',
            'common_interview_questions' => 'nullable|string',
            'tags' => 'nullable|string',
            'postgrad_path' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated, $id) {
            $guidance = CareerGuidance::findOrFail($id);
            $guidance->update($validated);
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
