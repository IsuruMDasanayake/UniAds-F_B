<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CareerGuidanceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $csvFile = database_path('data/career_guidance_dataset.csv');
        if (!file_exists($csvFile)) {
            $this->command->error("Data file not found at {$csvFile}");
            return;
        }

        $fileHandle = fopen($csvFile, 'r');
        $header = fgetcsv($fileHandle); // skip header
        
        $chunk = [];
        $chunkSize = 500;
        
        \App\Models\CareerGuidance::truncate();

        while (($row = fgetcsv($fileHandle)) !== false) {
            $chunk[] = [
                'education_level' => $row[1] ?? '',
                'stream_or_subject_interest' => $row[2] ?? '',
                'recommended_degree_or_course' => $row[3] ?? '',
                'career_field' => $row[4] ?? '',
                'entry_level_job' => $row[5] ?? '',
                'mid_level_job' => $row[6] ?? '',
                'senior_level_job' => $row[7] ?? '',
                'key_skills_required' => $row[8] ?? '',
                'recommended_soft_skills' => $row[9] ?? '',
                'typical_university_subjects' => $row[10] ?? '',
                'certifications_or_extra_training' => $row[11] ?? '',
                'industry_growth_in_sri_lanka' => $row[12] ?? '',
                'global_demand_level' => $row[13] ?? '',
                'average_starting_salary_lkr' => $row[14] ?? '',
                'future_salary_range_lkr' => $row[15] ?? '',
                'remote_work_possibility' => $row[16] ?? '',
                'freelance_opportunity' => $row[17] ?? '',
                'automation_risk' => $row[18] ?? '',
                'job_description' => $row[19] ?? '',
                'created_at' => now(),
                'updated_at' => now(),
            ];

            if (count($chunk) >= $chunkSize) {
                \App\Models\CareerGuidance::insert($chunk);
                $chunk = [];
            }
        }
        
        if (count($chunk) > 0) {
            \App\Models\CareerGuidance::insert($chunk);
        }

        fclose($fileHandle);
        $this->command->info("Successfully seeded career_guidance_dataset.csv");
    }
}
