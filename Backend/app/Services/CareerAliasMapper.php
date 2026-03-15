<?php

namespace App\Services;

use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class CareerAliasMapper
{
    /**
     * Map of common misspellings, short forms, and aliases to standard dataset titles.
     */
    protected array $aliasMap = [
        // ---------- Technology & IT ----------
        'software engineer'   => 'Software Engineer',
        'se'                  => 'Software Engineer',
        'asoftware engineer'  => 'Software Engineer', // common typo
        'software architect'  => 'Software Architect',
        'qa'                  => 'Software QA Engineer',
        'quality assurance'   => 'Software QA Engineer',
        'qa engineer'         => 'Software QA Engineer',
        'tester'              => 'Software QA Engineer',
        'frontend'            => 'Frontend Developer',
        'front end'           => 'Frontend Developer',
        'frontend developer'  => 'Frontend Developer',
        'backend'             => 'Backend Developer',
        'back end'            => 'Backend Developer',
        'backend developer'   => 'Backend Developer',
        'fullstack'           => 'Full Stack Developer',
        'full stack'          => 'Full Stack Developer',
        'full stack engineer' => 'Full Stack Developer',
        'tech lead'           => 'Software Architect',
        'data scientist'      => 'Data Scientist',
        'data analyst'        => 'Data Analyst',
        'ml engineer'         => 'Machine Learning Engineer',
        'machine learning engineer' => 'Machine Learning Engineer',
        'mlops engineer'      => 'MLOps Engineer',
        'ai engineer'         => 'AI Engineer',
        'data engineer'       => 'Data Engineer',
        'cybersecurity engineer' => 'Cybersecurity Engineer',
        'software qa engineer' => 'Software QA Engineer',
        'robotics engineer'   => 'Robotics Software Engineer',
        'ai researcher'       => 'AI Engineer',
        'etl engineer'        => 'Data Engineer',
        'cyber security'      => 'Cybersecurity Analyst',
        'security analyst'    => 'Cybersecurity Analyst',
        'pentester'           => 'Information Security Officer',
        'devops'              => 'DevOps Engineer',
        'sre'                 => 'Site Reliability Engineer',
        'cloud engineer'      => 'Cloud Architect',
        'ui designer'         => 'UI Designer',
        'ux designer'         => 'UX Designer',
        'ui ux'               => 'UI/UX Engineer',
        'business analyst'    => 'Business Analyst',
        'ba'                  => 'Business Analyst',
        'system admin'        => 'IT Systems Administrator',
        'sys admin'           => 'IT Systems Administrator',
        'network engineer'    => 'Network Engineer',
        'database admin'      => 'Database Administrator',
        'dba'                 => 'Database Administrator',
        'scrum master'        => 'Project Manager',
        'product manager'     => 'Product Manager',
        'game developer'      => 'Game Developer',
        'mobile developer'    => 'Mobile App Developer',
        'android developer'   => 'Mobile App Developer',
        'ios developer'       => 'Mobile App Developer',

        // ---------- Engineering ----------
        'civil engineer'      => 'Civil Engineer',
        'structural engineer' => 'Structural Engineer',
        'mechanical engineer' => 'Mechanical Engineer',
        'electrical engineer' => 'Electrical Engineer',
        'electronic engineer' => 'Electronic Engineer',
        'chemical engineer'   => 'Chemical Engineer',
        'mechatronics'        => 'Mechatronics Engineer',
        'mechatronics engineer' => 'Mechatronics Engineer',
        'industrial engineer' => 'Industrial Engineer',
        'marine engineer'     => 'Marine Engineer',
        'petroleum engineer'  => 'Petroleum Engineer',
        'geotechnical engineer' => 'Geotechnical Engineer',
        'renewable energy engineer' => 'Renewable Energy Engineer',
        'automotive engineer' => 'Automotive Engineer',
        'manufacturing engineer' => 'Manufacturing Engineer',
        'environmental engineer' => 'Environmental Engineer',
        'quality engineer'    => 'Quality Engineer',
        'biomedical engineer' => 'Electronic Engineer',
        'aerospace engineer'  => 'Aerospace Engineer',

        // ---------- Healthcare & Medical ----------
        'doctor'              => 'Doctor / Physician',
        'mbbs'                => 'Doctor / Physician',
        'nurse'               => 'Nurse',
        'nursing'             => 'Nurse',
        'pharmacist'          => 'Pharmacist',
        'pharmacy'            => 'Pharmacist',
        'dentist'             => 'Dentist',
        'dental'              => 'Dentist',
        'physiotherapist'     => 'Physiotherapist',
        'physiotherapy'       => 'Physiotherapist',
        'radiographer'        => 'Radiologist',
        'mlt'                 => 'Medical Laboratory Scientist',
        'lab tech'            => 'Medical Laboratory Scientist',
        'paramedic'           => 'Paramedic',
        'caregiver'           => 'Nurse',
        'midwife'             => 'Nurse',

        // ---------- Business & Management ----------
        'hr'                  => 'Human Resource Manager',
        'human resources'     => 'Human Resource Manager',
        'hr manager'          => 'Human Resource Manager',
        'marketing'           => 'Marketing Manager',
        'marketing manager'   => 'Marketing Manager',
        'digital marketing'   => 'Marketing Manager',
        'seo'                 => 'Marketing Manager',
        'sales manager'       => 'Sales Manager',
        'business dev'        => 'Business Development Manager',
        'bde'                 => 'Business Development Manager',
        'entrepreneur'        => 'Entrepreneur / Startup Founder',

        // ---------- Finance & Accounting ----------
        'accountant'          => 'Chartered Accountant',
        'chartered accountant'=> 'Chartered Accountant',
        'auditor'             => 'Auditor',
        'financial analyst'   => 'Financial Analyst',
        'investment banker'   => 'Investment Analyst',
        'banker'              => 'Bank Manager', // fallback
        'tax consultant'      => 'Tax Consultant',
        'actuary'             => 'Risk Analyst',
        
        // ---------- Law & Legal ----------
        'lawyer'              => 'Attorney-at-Law',
        'attorney'            => 'Attorney-at-Law',
        'legal officer'       => 'Legal Compliance Officer',
        'notary'              => 'Notary Public',

        // ---------- Education & Teaching ----------
        'teacher'             => 'School Teacher',
        'school teacher'      => 'School Teacher',
        'lecturer'            => 'University Lecturer',
        'professor'           => 'University Lecturer',
        'principal'           => 'School Teacher',
        'tutor'               => 'School Teacher',

        // ---------- Creative Arts & Design ----------
        'graphic designer'    => 'Graphic Designer',
        'animator'            => 'Animator',
        'video editor'        => 'Video Producer',
        'photographer'        => 'Digital Artist',
        'interior designer'   => 'Interior Designer',
        'fashion designer'    => 'Fashion Designer',
        'architect'           => 'Architect',

        // ---------- Hospitality & Tourism ----------
        'chef'                => 'Chef',
        'hotel manager'       => 'Hotel Manager',
        'tour guide'          => 'Tour Guide',
        'travel agent'        => 'Travel Agent',
        'flight attendant'    => 'Flight Attendant',
        'air hostess'         => 'Flight Attendant',
        'cabin crew'          => 'Flight Attendant',

        // ---------- Media & Communication ----------
        'journalist'          => 'Journalist',
        'news anchor'         => 'News Presenter',
        'pr'                  => 'PR Specialist',
        'public relations'    => 'PR Specialist',
        'content creator'     => 'Content Writer',
        'youtuber'            => 'Content Writer',
        'copywriter'          => 'Copywriter',

        // ---------- Agri-Tech & Sustainability ----------
        'agriculture'         => 'Agricultural Scientist',
        'agri scientist'      => 'Agricultural Scientist',
        'farmer'              => 'Agribusiness Manager',
        'environmental'       => 'Environmental Scientist',

        // ---------- Logistics & Supply Chain ----------
        'logistics'           => 'Logistics Manager',
        'supply chain'        => 'Supply Chain Analyst',
        'customs'             => 'Logistics Coordinator',
        
        // ---------- Skilled Trades & Vocational ----------
        'electrician'         => 'Electrician',
        'mechanic'            => 'Automobile Mechanic',
        'auto mechanic'       => 'Automobile Mechanic',
        'plumber'             => 'Plumber',
        'carpenter'           => 'Carpenter',
        'welder'              => 'Welder',
        'mason'               => 'Mason',
        'tailor'              => 'Tailor',
        'beautician'          => 'Beautician',
        'hairdresser'         => 'Beautician',
    ];

    /**
     * Tries to find the best matching standard career title for the user input.
     * Uses direct alias matching first, then falls back to fuzzy matching (levenshtein).
     *
     * @param string $input
     * @return string|null The standardized title, or null if no good match.
     */
    public function getStandardTitle(string $input): ?string
    {
        $cleanInput = strtolower(trim(preg_replace('/[^a-z0-9\s]/i', '', $input)));
        
        if (empty($cleanInput)) {
            return null;
        }

        // 1. Direct Alias Match
        if (isset($this->aliasMap[$cleanInput])) {
            return $this->aliasMap[$cleanInput];
        }

        // 2. Contains Match (e.g. "I want to be a software engineer")
        foreach ($this->aliasMap as $alias => $standardTitle) {
            if (preg_match("/\b" . preg_quote($alias, '/') . "\b/i", $cleanInput)) {
                return $standardTitle;
            }
        }

        // 3. Fuzzy Matching (Levenshtein Typo Tolerance)
        $bestMatch = null;
        $shortestDistance = 100;
        
        foreach ($this->aliasMap as $alias => $standardTitle) {
            $dist = levenshtein($cleanInput, $alias);
            if ($dist < $shortestDistance) {
                $shortestDistance = $dist;
                $bestMatch = $standardTitle;
            }
        }

        // Only accept if distance is very small (e.g. 1-2 characters for common typos)
        // Or if the similarity is very high.
        // For a string "marine engineer" (15), "ai engineer" (11) has distance 4.
        // For "mechanical engineer" (19), "chemical engineer" (17) has distance 3.
        
        $similarity = 0;
        if ($bestMatch) {
            $maxLen = max(strlen($cleanInput), strlen($bestMatch));
            if ($maxLen > 0) {
                $similarity = (1 - $shortestDistance / $maxLen) * 100;
            }
        }

        // Require 85% similarity for short strings, 90% for long ones
        $threshold = (strlen($cleanInput) > 10) ? 90 : 85;

        if ($similarity >= $threshold) {
            Log::info("Fuzzy matched '{$cleanInput}' to '{$bestMatch}' with {$similarity}% similarity (Dist: {$shortestDistance}).");
            return $bestMatch;
        }

        Log::warning("CareerAliasMapper could not find a match for input: '{$input}'");
        return null; // No confident match found
    }

    /**
     * Determines the broad Main Field (Category) for a given specific Standard Title.
     *
     * @param string $standardTitle
     * @param array $fieldDictionary The dictionary from AiAdvisorController
     * @return string|null The Main Field (e.g., "Technology & IT"), or null if not found.
     */
    public function getMainFieldForTitle(string $standardTitle, array $fieldDictionary): ?string
    {
        foreach ($fieldDictionary as $mainField => $subFields) {
            if (in_array($standardTitle, $subFields)) {
                return $mainField;
            }
        }
        return null;
    }
}
