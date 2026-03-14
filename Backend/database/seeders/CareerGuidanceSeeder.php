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
        $csvFile = database_path('data/careers_master_dataset.csv');
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
                'career_category' => $row[1] ?? '',
                'career_field' => $row[2] ?? '',
                'al_stream_required' => $row[3] ?? '',
                'education_level' => $row[4] ?? '',
                'recommended_degree_or_course' => $row[5] ?? '',
                'alternative_path' => $row[6] ?? '',
                'entry_level_job' => $row[7] ?? '',
                'mid_level_job' => $row[8] ?? '',
                'senior_level_job' => $row[9] ?? '',
                'key_skills_required' => $row[10] ?? '',
                'recommended_soft_skills' => $row[11] ?? '',
                'typical_university_subjects' => $row[12] ?? '',
                'certifications_or_extra_training' => $row[13] ?? '',
                'industry_growth_in_sri_lanka' => $row[14] ?? '',
                'global_demand_level' => $row[15] ?? '',
                'average_starting_salary_lkr' => $row[16] ?? '',
                'future_salary_range_lkr' => $row[17] ?? '',
                'remote_work_possibility' => $row[18] ?? '',
                'freelance_opportunity' => $row[19] ?? '',
                'automation_risk' => $row[20] ?? '',
                'job_description' => $row[21] ?? '',
                'career_difficulty' => $row[22] ?? '',
                'study_duration_years' => $row[23] ?? null,
                'local_job_availability' => $row[24] ?? '',
                'international_opportunity' => $row[25] ?? '',
                'recommended_first_step' => $row[26] ?? '',
                'career_tags' => $row[27] ?? '',
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
        $this->command->info("Successfully seeded careers_master_dataset.csv");
    }
}
