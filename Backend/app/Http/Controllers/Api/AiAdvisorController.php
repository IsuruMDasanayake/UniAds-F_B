<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\CareerGuidance;
use App\Models\Post;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use App\Models\UserSavedRoadmap;

class AiAdvisorController extends Controller
{
    public function recommend(Request $request)
    {
        Log::info("AI recommend called", ['payload' => $request->all()]);
        try {
            $validated = $request->validate([
                'messages' => 'required|array',
                'profile'  => 'nullable|array',
            ]);

            $messages        = $validated['messages'];
            $lastUserMessage = end($messages)['content'];

            $defaults = [
                'education_level'  => null,
                'path_preference'  => null,
                'al_stream'        => null,
                'main_field'       => null,
                'interest'         => null,
                'career_goal'      => null,
                'study_preference' => null,
                'personality_quiz' => false,
                'extra_instruction'=> null,
                'language'         => 'English',
            ];

            $user = $request->user();
            $currentProfile = array_merge($defaults, $validated['profile'] ?? []);

            // ─────────────────────────────────────────────
            // 0. Global Command Reset (Another Field / Start Over)
            // ─────────────────────────────────────────────
            $lowerInput = strtolower($lastUserMessage);
            if (preg_match('/\b(another field|change field|different field|new field|explore another field)\b/i', $lowerInput)) {
                $currentProfile['main_field'] = null;
                $currentProfile['interest']   = null;
                $currentProfile['personality_quiz'] = false;
                
                // Clear state in DB if logged in
                if ($user) {
                    $user->update([
                        'main_field' => null,
                        'interest'   => null,
                        'career_goal'=> null,
                        'personality_quiz' => false
                    ]);
                }
                Log::info("Resetting field interest due to 'Another Field' command.");
            } elseif (preg_match('/\b(start over|restart|reset)\b/i', $lowerInput)) {
                $currentProfile = $defaults;
                // Full clear in DB
                if ($user) {
                    $user->update([
                        'education_level' => null,
                        'path_preference' => null,
                        'al_stream'       => null,
                        'main_field'      => null,
                        'interest'        => null,
                        'study_preference'=> null,
                        'career_goal'     => null,
                        'personality_quiz' => false
                    ]);
                }
                Log::info("Full profile reset due to 'Start Over' command.");
            }

            // FEATURE: Fresh Path Detection
            // If the user selects an education level directly (Stage 1), 
            // wipe old career data for a fresh search as per requirements.
            $eduLevels = ['O/L Completed', 'O/L Failed', 'A/L Completed', 'Diploma Holder', 'Undergraduate', 'Graduate'];
            $freshStart = in_array($lastUserMessage, $eduLevels);

            if ($freshStart) {
                Log::info("User selected education level '{$lastUserMessage}'. Wiping old career interest for fresh start.");
                $currentProfile['main_field']       = null;
                $currentProfile['interest']         = null;
                $currentProfile['path_preference']  = null;
                $currentProfile['al_stream']        = null;
                $currentProfile['career_goal']      = null;
                $currentProfile['personality_quiz'] = false;

                // Wipe in DB immediately so the reload below won't bring them back
                if ($user) {
                    $user->update([
                        'main_field'       => null,
                        'interest'         => null,
                        'path_preference'  => null,
                        'al_stream'        => null,
                        'career_goal'      => null,
                        'personality_quiz' => false
                    ]);
                    $user->refresh(); // Ensure in-memory model reflects the DB wipe
                }
            }

            // If user is logged in, load missing fields from their actual profile.
            // On a freshStart, skip career-specific fields (interest/main_field) to avoid
            // re-loading stale data that was just wiped above.
            if ($user) {
                $reloadFields = $freshStart
                    ? ['education_level', 'study_preference']
                    : ['education_level', 'path_preference', 'al_stream', 'main_field', 'interest', 'study_preference'];

                foreach ($reloadFields as $field) {
                    if (empty($currentProfile[$field]) && !empty($user->$field)) {
                        $currentProfile[$field] = $user->$field;
                    }
                }
            }

            Log::info("Current profile state (after DB merge)", ['profile' => $currentProfile]);

            // ─────────────────────────────────────────────
            // 1. Language Detection
            // ─────────────────────────────────────────────
            $targetLang = $currentProfile['language'] ?? 'English';
            if (preg_match('/[අ-ෆ]/u', $lastUserMessage)) $targetLang = 'Sinhala';
            elseif (preg_match('/[அ-ஹ]/u', $lastUserMessage))  $targetLang = 'Tamil';
            $currentProfile['language'] = $targetLang;

            // ─────────────────────────────────────────────
            // 1.5. Persist State to User DB (Save Progress)
            // ─────────────────────────────────────────────
            if ($user && !empty($lastUserMessage) && !preg_match('/\b(start over|reset|another field)\b/i', $lastUserMessage)) {
                // FEATURE: Auto-infer path_preference based on education level
                if (empty($currentProfile['path_preference']) && !empty($currentProfile['education_level'])) {
                    if (in_array($currentProfile['education_level'], ['A/L Completed', 'Undergraduate', 'Graduate', 'Diploma Holder'])) {
                        $currentProfile['path_preference'] = 'A/L';
                    }
                }

                $updateData = [
                    'education_level' => $currentProfile['education_level'],
                    'path_preference' => $currentProfile['path_preference'] ?? null,
                    'al_stream'       => $currentProfile['al_stream'],
                    'main_field'      => $currentProfile['main_field'],
                    'interest'        => $currentProfile['interest'],
                    'study_preference'=> $currentProfile['study_preference'],
                ];

                // FEATURE: If education level was JUST selected in this request, 
                // and it's a fresh start (not recall), wipe career-specific fields.
                if (!empty($currentProfile['education_level']) && 
                    empty($currentProfile['main_field']) && 
                    !preg_match('/\b(check last search)\b/i', $lowerInput)) {
                    $updateData['main_field'] = null;
                    $updateData['interest']   = null;
                    Log::info("Wiping old career data for fresh education path.");
                }

                $user->update($updateData);
            }

            // ─────────────────────────────────────────────
            // 2. Field Dictionary
            //    Sub-field values MUST exactly match the
            //    career_field column in the DB.
            // ─────────────────────────────────────────────
            $fieldDictionary = [
                'Technology & IT' => [
                    'Software Architect', 'Full Stack Developer', 'Frontend Developer', 'Backend Developer',
                    'Mobile App Developer', 'Machine Learning Engineer', 'Data Analyst', 'Data Engineer',
                    'Cybersecurity Analyst', 'Cybersecurity Engineer', 'Cloud Architect', 'DevOps Engineer',
                    'Site Reliability Engineer', 'Game Developer', 'Blockchain Developer', 'Network Engineer',
                    'Database Administrator', 'IT Systems Administrator', 'AI Engineer', 'MLOps Engineer',
                    'Robotics Software Engineer', 'AR Developer', 'VR Developer',
                ],
                'Engineering' => [
                    'Civil Engineer', 'Structural Engineer', 'Mechanical Engineer', 'Electrical Engineer',
                    'Electronic Engineer', 'Mechatronics Engineer', 'Automobile Engineer', 'Industrial Engineer',
                    'Chemical Engineer', 'Aerospace Engineer', 'Petroleum Engineer', 'Geotechnical Engineer',
                    'Marine Engineer', 'Renewable Energy Engineer', 'Automotive Engineer', 'Manufacturing Engineer',
                ],
                'Healthcare & Medical' => [
                    'Doctor / Physician', 'Dentist', 'Pharmacist', 'Nurse', 'Medical Laboratory Scientist',
                    'Radiologist', 'Physiotherapist', 'Psychologist', 'Clinical Psychologist',
                    'Nutritionist', 'Dietitian', 'Public Health Officer', 'Veterinarian', 'Speech Therapist',
                    'Optometrist',
                ],
                'Business & Management' => [
                    'Business Analyst', 'Marketing Manager', 'Human Resource Manager',
                    'Business Development Manager', 'Project Manager', 'Product Manager', 'Operations Manager',
                    'Sales Manager', 'Management Consultant', 'Entrepreneur / Startup Founder',
                ],
                'Finance & Accounting' => [
                    'Chartered Accountant', 'Financial Analyst', 'Investment Analyst',
                    'Bank Manager', 'Auditor', 'Tax Consultant', 'Risk Analyst', 'Credit Analyst', 'Financial Advisor',
                ],
                'Law & Legal Studies' => [
                    'Attorney-at-Law', 'Corporate Lawyer', 'Legal Consultant', 'Legal Researcher',
                    'Legal Compliance Officer', 'Judge', 'Notary Public',
                ],
                'Creative Arts & Design' => [
                    'Graphic Designer', 'UI Designer', 'UX Designer', 'Product Designer', 'Animator',
                    'Video Game Artist', 'Fashion Designer', 'Interior Designer', 'Illustrator',
                ],
                'Media & Communication' => [
                    'Journalist', 'Content Writer', 'Content Creator', 'Content Strategist', 'Social Media Manager',
                    'Public Relations Officer', 'News Presenter', 'Podcast Producer', 'Video Producer',
                ],
                'Hospitality & Tourism' => [
                    'Hotel Manager', 'Restaurant Manager', 'Chef', 'Tour Guide', 'Travel Consultant',
                    'Event Planner', 'Flight Attendant', 'Hotel Receptionist',
                ],
                'Education & Teaching' => [
                    'School Teacher', 'Primary School Teacher', 'Secondary School Teacher',
                    'Special Education Teacher', 'University Lecturer',
                    'Curriculum Developer', 'Academic Counselor',
                ],
                'Logistics & Supply Chain' => [
                    'Supply Chain Manager', 'Supply Chain Analyst', 'Procurement Manager',
                    'Warehouse Manager', 'Logistics Coordinator', 'Inventory Manager',
                ],
                'Construction & Architecture' => [
                    'Architect', 'Urban Planner', 'Quantity Surveyor', 'Construction Project Manager',
                    'Landscape Architect',
                ],
                'Agri-Tech & Sustainability' => [
                    'Agricultural Scientist', 'Agricultural Engineer', 'Hydroponics Specialist',
                    'Environmental Scientist', 'Sustainability Consultant', 'Agribusiness Manager',
                ],
                'Modern Finance' => [
                    'Fintech Analyst', 'Cryptocurrency Analyst', 'Blockchain Finance Specialist',
                    'Digital Payments Specialist',
                ],
                'Skilled Trades & Vocational' => [
                    'Electrician', 'Automobile Mechanic', 'Welder', 'Plumber', 'Carpenter', 'AC Technician',
                    'Beautician', 'Electronics Repair Technician', 'Mason', 'Painter', 'Tiler', 'Barber', 'Tailor',
                ],
            ];

            // ─────────────────────────────────────────────
            // NEW: Vocational & NVQ Specialized Map
            // ─────────────────────────────────────────────
            $vocationalFields = [
                'IT & Computer Trades'    => 'Technology & IT',
                'Electrician & Electrical' => 'Skilled Trades & Vocational',
                'Auto & Mechanical Trades' => 'Skilled Trades & Vocational',
                'Welding & Fabrication'    => 'Skilled Trades & Vocational',
                'Plumbing & Sanitary'      => 'Skilled Trades & Vocational',
                'Carpentry & Woodwork'     => 'Skilled Trades & Vocational',
                'AC & Refrigeration'       => 'Skilled Trades & Vocational',
                'Hair & Beauty Culture'    => 'Skilled Trades & Vocational',
                'Hospitality & Cookery'    => 'Hospitality & Tourism',
            ];


            // ─────────────────────────────────────────────
            // 3. Alias Map — common user phrasings → exact DB values
            //    Keys must be lowercase (matched against strtolower input)
            // ─────────────────────────────────────────────
            $aliasMap = [
                // 1. Technology & IT
                'software architect'         => 'Software Architect',
                'software engineer'          => 'Software Architect',
                'software engineering'       => 'Software Architect',
                'developer'                  => 'Full Stack Developer',
                'full stack'                 => 'Full Stack Developer',
                'web developer'              => 'Full Stack Developer',
                'mobile developer'           => 'Mobile App Developer',
                'app developer'              => 'Mobile App Developer',
                'ai engineer'                => 'AI Engineer',
                'machine learning'           => 'Machine Learning Engineer',
                'ml engineer'                => 'Machine Learning Engineer',
                'data scientist'             => 'Data Analyst',
                'data analyst'               => 'Data Analyst',
                'cybersecurity'              => 'Cybersecurity Analyst',
                'cybersecurity analyst'      => 'Cybersecurity Analyst',
                'cybersecurity engineer'     => 'Cybersecurity Engineer',
                'security specialist'        => 'Cybersecurity Analyst',
                'cloud architect'            => 'Cloud Architect',
                'cloud engineer'             => 'Cloud Architect',
                'devops'                     => 'DevOps Engineer',
                'game developer'             => 'Game Developer',
                'network engineer'           => 'Network Engineer',
                'database administrator'     => 'Database Administrator',
                'dba'                        => 'Database Administrator',
                'it support'                 => 'IT Systems Administrator',
                'sysadmin'                   => 'IT Systems Administrator',
                'qa'                         => 'Software Architect',
                'tester'                     => 'Software Architect',
                'blockchain'                 => 'Blockchain Developer',
                'ar developer'               => 'AR Developer',
                'vr developer'               => 'VR Developer',
                'ar'                         => 'AR Developer',
                'vr'                         => 'VR Developer',
                'metaverse'                  => 'AR Developer',
                'data engineer'              => 'Data Engineer',
                'mlops'                      => 'MLOps Engineer',
                'sre'                        => 'Site Reliability Engineer',
                'site reliability'           => 'Site Reliability Engineer',
                'crypto'                     => 'Cryptocurrency Analyst',
                'cryptocurrency'             => 'Cryptocurrency Analyst',
                'robotics software'          => 'Robotics Software Engineer',

                // 2. Engineering
                'civil engineer'             => 'Civil Engineer',
                'structural engineer'        => 'Structural Engineer',
                'mechanical engineer'        => 'Mechanical Engineer',
                'electrical engineer'        => 'Electrical Engineer',
                'electronics engineer'       => 'Electronic Engineer',
                'mechatronics'               => 'Mechatronics Engineer',
                'automobile engineer'        => 'Automotive Engineer',
                'automotive'                 => 'Automotive Engineer',
                'chemical engineer'          => 'Chemical Engineer',
                'industrial engineer'        => 'Industrial Engineer',
                'aerospace'                  => 'Aerospace Engineer',
                'petroleum'                  => 'Petroleum Engineer',
                'geotechnical'               => 'Geotechnical Engineer',
                'renewable energy'           => 'Renewable Energy Engineer',
                'solar engineer'             => 'Renewable Energy Engineer',
                'marine engineer'            => 'Marine Engineer',
                'manufacturing engineer'     => 'Manufacturing Engineer',

                // 3. Healthcare
                'doctor'                     => 'Doctor / Physician',
                'physician'                  => 'Doctor / Physician',
                'dentist'                    => 'Dentist',
                'pharmacist'                 => 'Pharmacist',
                'nurse'                      => 'Nurse',
                'mlt'                        => 'Medical Laboratory Scientist',
                'radiographer'               => 'Radiologist',
                'radiologist'                => 'Radiologist',
                'physiotherapist'            => 'Physiotherapist',
                'psychologist'               => 'Psychologist',
                'clinical psychologist'      => 'Clinical Psychologist',
                'nutritionist'               => 'Nutritionist',
                'dietitian'                  => 'Dietitian',
                'public health'              => 'Public Health Officer',
                'lab scientist'              => 'Medical Laboratory Scientist',
                'mls'                        => 'Medical Laboratory Scientist',
                'physio'                     => 'Physiotherapist',
                'speech therapist'           => 'Speech Therapist',
                'optometrist'                => 'Optometrist',
                'vet'                        => 'Veterinarian',
                'veterinarian'               => 'Veterinarian',

                // 4. Business
                'marketing'                  => 'Marketing Manager',
                'hr'                         => 'Human Resource Manager',
                'business analyst'           => 'Business Analyst',
                'entrepreneur'               => 'Entrepreneur / Startup Founder',
                'startup'                    => 'Entrepreneur / Startup Founder',
                'project manager'            => 'Project Manager',
                'product manager'            => 'Product Manager',
                'operations manager'         => 'Operations Manager',
                'sales manager'              => 'Sales Manager',
                'management consultant'      => 'Management Consultant',

                // 5. Finance
                'accountant'                 => 'Chartered Accountant',
                'chartered accountant'       => 'Chartered Accountant',
                'financial analyst'          => 'Financial Analyst',
                'investment analyst'         => 'Investment Analyst',
                'bank manager'               => 'Bank Manager',
                'auditor'                    => 'Auditor',
                'tax consultant'             => 'Tax Consultant',
                'fintech'                    => 'Fintech Analyst',
                'fintech analyst'            => 'Fintech Analyst',
                'risk analyst'               => 'Risk Analyst',
                'credit analyst'             => 'Credit Analyst',
                'financial advisor'          => 'Financial Advisor',

                // 6. Law
                'lawyer'                     => 'Attorney-at-Law',
                'attorney'                   => 'Attorney-at-Law',
                'corporate lawyer'           => 'Corporate Lawyer',
                'legal consultant'           => 'Legal Consultant',
                'legal advisor'              => 'Legal Consultant',
                'judge'                      => 'Judge',
                'notary'                     => 'Notary Public',
                'legal compliance'           => 'Legal Compliance Officer',

                // 7. Creative
                'graphic designer'           => 'Graphic Designer',
                'ui designer'                => 'UI Designer',
                'ux designer'                => 'UX Designer',
                'product designer'           => 'Product Designer',
                'animator'                   => 'Animator',
                'illustrator'                => 'Illustrator',
                'video game artist'          => 'Video Game Artist',
                'fashion designer'           => 'Fashion Designer',
                'interior designer'          => 'Interior Designer',

                // 8. Media
                'journalist'                 => 'Journalist',
                'content writer'             => 'Content Writer',
                'podcast'                    => 'Podcast Producer',
                'presenter'                  => 'News Presenter',
                'content creator'            => 'Content Creator',
                'social media'               => 'Social Media Manager',
                'public relations'           => 'Public Relations Officer',
                'video producer'             => 'Video Producer',

                // 9. Hospitality
                'hotel manager'              => 'Hotel Manager',
                'restaurant manager'         => 'Restaurant Manager',
                'chef'                       => 'Chef',
                'tour guide'                 => 'Tour Guide',
                'travel consultant'          => 'Travel Consultant',
                'event planner'              => 'Event Planner',
                'flight attendant'           => 'Flight Attendant',
                'hotel receptionist'         => 'Hotel Receptionist',

                // 10. Education
                'teacher'                    => 'School Teacher',
                'lecturer'                   => 'University Lecturer',
                'academic counselor'         => 'Academic Counselor',
                'curriculum developer'       => 'Curriculum Developer',

                // 11. Logistics
                'supply chain'               => 'Supply Chain Manager',
                'logistics'                  => 'Logistics Coordinator',
                'procurement'                => 'Procurement Manager',
                'warehouse'                  => 'Warehouse Manager',
                'inventory'                  => 'Inventory Manager',

                // 12. Construction
                'architect'                  => 'Architect',
                'qs'                         => 'Quantity Surveyor',
                'quantity surveyor'          => 'Quantity Surveyor',
                'urban planner'              => 'Urban Planner',
                'landscape architect'        => 'Landscape Architect',
                'construction manager'       => 'Construction Project Manager',

                // 13. Agri-Tech
                'agricultural scientist'     => 'Agricultural Scientist',
                'agricultural engineer'      => 'Agricultural Engineer',
                'hydroponics'                => 'Hydroponics Specialist',
                'environmental scientist'    => 'Environmental Scientist',
                'sustainability'             => 'Sustainability Consultant',
                'agribusiness'               => 'Agribusiness Manager',

                // 14. Skilled Trades
                'electrician'                => 'Electrician',
                'mechanic'                   => 'Automobile Mechanic',
                'welder'                     => 'Welder',
                'plumber'                    => 'Plumber',
                'carpenter'                  => 'Carpenter',
                'ac technician'              => 'AC Technician',
                'beautician'                 => 'Beautician',
                'hairdresser'                => 'Beautician',
                'hair & beauty'              => 'Beautician',
                'electronics repair'         => 'Electronics Repair Technician',
                'mason'                      => 'Mason',
                'painter'                    => 'Painter',
                'tiler'                      => 'Tiler',
                'barber'                     => 'Barber',
                'tailor'                     => 'Tailor',
            ];

            // ─────────────────────────────────────────────
            // 4. Extract Education Level (Robust Keyword Matching)
            // ─────────────────────────────────────────────
            
            $quickReplyEduLevels = ['O/L Completed', 'O/L Failed', 'A/L Completed', 'Diploma Holder', 'Undergraduate', 'Graduate'];
            if (in_array(trim($lastUserMessage), $quickReplyEduLevels)) {
                $currentProfile['education_level'] = trim($lastUserMessage);
            } else {
                $eduKeywords = [
                    'O/L Failed'     => ['failed o/l', 'fail o/l', 'failed ol', 'fail ol', 'failed ordinary level', 'fail'],
                    'O/L Completed'  => ['o/l', 'o/ls', 'ol', 'ols', 'ordinary level', 'grade 11', 'o levels', 'o/l completed', 'o/l student', 'o/l pending', 'O/L Pending', 'O/L', 'O/L Student','OL'],
                    'A/L Completed'  => ['a/l', 'a/ls', 'al', 'als', 'advanced level', 'grade 13', 'a level', 'a levels', 'a/l completed', 'a/l student', 'a/l pending', 'A/L Pending', 'A/L', 'A/L Student','AL'],
                    'Diploma Holder' => ['diploma', 'hnd', 'higher national diploma', 'hnc', 'diploma holder', 'diploma student', 'diploma pending', 'Diploma Pending', 'Diploma Holder', 'Diploma Student','Diploma'],
                    'Undergraduate'  => ['undergraduate', 'undergrad', 'bachelor', 'degree student', 'uni student', 'university student', 'undergraduate', 'undergraduate student', 'undergraduate pending', 'Undergraduate Pending'],
                    'Graduate'       => ['graduate', 'graduated', 'degree holder', 'bsc', 'ba', 'bba', 'masters', 'phd', 'graduate', 'graduate student', 'graduate pending', 'Graduate Pending'],
                ];
                
                foreach ($eduKeywords as $level => $keywords) {
                    foreach ($keywords as $kw) {
                        if (in_array($kw, ['ol', 'al', 'ols', 'als', 'ba'])) {
                            if (preg_match("/\b" . preg_quote($kw, '/') . "\b/i", $lowerInput)) {
                                $currentProfile['education_level'] = $level;
                                break 2;
                            }
                        } else {
                            if (str_contains($lowerInput, $kw)) {
                                $currentProfile['education_level'] = $level;
                                break 2;
                            }
                        }
                    }
                }
            }

            // ─────────────────────────────────────────────
            // 4.5. Extract Path Preference, A/L Stream & Personality Quiz
            // ─────────────────────────────────────────────
            // Path Preference
            if (!$currentProfile['path_preference']) {
                if (preg_match('/\b(a\/l stream|do a\/ls|al stream|a\/ls|al)\b/i', $lowerInput)) {
                    $currentProfile['path_preference'] = 'A/L';
                } elseif (preg_match('/\b(alternative path|diploma|vocational course|nvq|alternative)\b/i', $lowerInput)) {
                    $currentProfile['path_preference'] = 'Alternative';
                }
            }

            // A/L Stream
            if (!$currentProfile['al_stream']) {
                if (preg_match('/\b(math|maths|physical science)\b/i', $lowerInput)) $currentProfile['al_stream'] = 'Physical Science';
                elseif (preg_match('/\b(bio|biological science|biology)\b/i', $lowerInput)) $currentProfile['al_stream'] = 'Biological Science';
                elseif (preg_match('/\b(art|arts)\b/i', $lowerInput)) $currentProfile['al_stream'] = 'Arts';
                elseif (preg_match('/\b(commerce|business)\b/i', $lowerInput)) $currentProfile['al_stream'] = 'Commerce';
                elseif (preg_match('/\b(tech|technology|ict|sft)\b/i', $lowerInput)) $currentProfile['al_stream'] = 'Technology';
            }

            // Personality Quiz Trigger
            if (preg_match('/\b(help me decide|i don\'t know|not sure|help)\b/i', $lowerInput) && !$currentProfile['al_stream']) {
                $currentProfile['personality_quiz'] = true;
            }

            // Parse Personality Quiz Responses
            if ($currentProfile['personality_quiz'] && !$currentProfile['al_stream']) {
                if (preg_match('/\b(computers|coding)\b/i', $lowerInput)) {
                    $currentProfile['al_stream'] = 'Technology';
                    $currentProfile['main_field'] = 'Technology & IT';
                    $currentProfile['personality_quiz'] = false;
                } elseif (preg_match('/\b(helping|medical|sick|people)\b/i', $lowerInput)) {
                    $currentProfile['al_stream'] = 'Biological Science';
                    $currentProfile['main_field'] = 'Healthcare & Medical';
                    $currentProfile['personality_quiz'] = false;
                } elseif (preg_match('/\b(building|hands|structures)\b/i', $lowerInput)) {
                    $currentProfile['al_stream'] = 'Physical Science';
                    $currentProfile['main_field'] = 'Engineering';
                    $currentProfile['personality_quiz'] = false;
                } elseif (preg_match('/\b(business|managing|money)\b/i', $lowerInput)) {
                    $currentProfile['al_stream'] = 'Commerce';
                    $currentProfile['main_field'] = 'Business & Management';
                    $currentProfile['personality_quiz'] = false;
                }
            }

            // ─────────────────────────────────────────────
            // 5. Extract Interest and Main Field (Robust Matching)
            // ─────────────────────────────────────────────
            // Priority 0: Exact Main Field match (Quick Reply)
            $exactMainMatch = false;
            foreach ($fieldDictionary as $main => $subs) {
                if (strtolower($main) === $lowerInput) {
                    $currentProfile['main_field'] = $main;
                    $currentProfile['interest']   = null; // Reset interest to force Sub-field question
                    $exactMainMatch = true;
                    Log::info("Exact Main Field match detected: $main. Resetting interest.");
                    break;
                }
            }

            // Priority 1: Main Field Keyword match (Free text typing)
            if (!$exactMainMatch) {
                $mainFieldKeywords = [
                    'Technology & IT'             => ['technology', 'tech', 'it', 'information technology', 'computing', 'computer'],
                    'Engineering'                 => ['engineering', 'engineer'],
                    'Business & Management'       => ['business', 'management', 'commerce'],
                    'Healthcare & Medical'        => ['medicine', 'medical', 'health', 'healthcare'],
                    'Finance & Accounting'        => ['finance', 'accounting', 'auditing'],
                    'Law & Legal Studies'         => ['law', 'legal'],
                    'Education & Teaching'        => ['education', 'teaching', 'teacher', 'teach'],
                    'Creative Arts & Design'      => ['creative arts', 'arts', 'art', 'creative', 'design'],
                    'Hospitality & Tourism'       => ['hospitality', 'tourism', 'travel'],
                    'Media & Communication'       => ['media', 'communication', 'journalism'],
                    'Agri-Tech & Sustainability'  => ['agriculture', 'agri', 'farming', 'hydroponics', 'sustainability', 'environment'],
                    'Modern Finance'              => ['fintech', 'actuary', 'digital banking'],
                    'Logistics & Supply Chain'    => ['logistics', 'supply chain', 'warehousing', 'fleet'],
                    'Construction & Architecture' => ['construction', 'architecture', 'qs', 'building', 'bim'],
                    'Skilled Trades & Vocational' => ['vocational', 'trades', 'technical', 'nvq', 'mechanic', 'electrician'],
                ];
                
                foreach ($mainFieldKeywords as $main => $keywords) {
                    foreach ($keywords as $kw) {
                        if (in_array($kw, ['it', 'art', 'law'])) {
                            if (preg_match("/\b" . preg_quote($kw, '/') . "\b/i", $lowerInput)) {
                                $currentProfile['main_field'] = $main;
                                break 2;
                            }
                        } else {
                            if (str_contains($lowerInput, $kw)) {
                                $currentProfile['main_field'] = $main;
                                break 2;
                            }
                        }
                    }
                }
            }

            // Priority 2: Extract Sub-field Interest via Alias Map (highest priority for specificity)
            if (!$exactMainMatch) {
                foreach ($aliasMap as $alias => $realField) {
                    if (preg_match("/\b" . preg_quote($alias, '/') . "\b/i", $lowerInput)) {
                        $currentProfile['interest'] = $realField;
                        // Resolve correct main_field from dictionary
                        foreach ($fieldDictionary as $main => $subs) {
                            if (in_array($realField, $subs)) {
                                $currentProfile['main_field'] = $main;
                                break 2;
                            }
                        }
                        break;
                    }
                }
            }

            // Priority 3: Extract Sub-field via Tag Match (Database-backed fallback)
            if (!$exactMainMatch && !$currentProfile['interest']) {
                if (strlen($lowerInput) > 3) {
                    $tagMatch = \App\Models\CareerGuidance::where('career_tags', 'LIKE', "%{$lowerInput}%")
                        ->orWhere('career_field', 'LIKE', "%{$lowerInput}%")
                        ->first();
                        
                    if ($tagMatch) {
                        $currentProfile['interest']   = $tagMatch->career_field;
                        $currentProfile['main_field'] = $tagMatch->career_category;
                        Log::info("Tag/LIKE match found for interest: {$tagMatch->career_field}");
                    }
                }
            }

            // ─────────────────────────────────────────────
            // 6. Fallback: Word-by-word Sub-field Extraction
            // ─────────────────────────────────────────────
            if (!$exactMainMatch && !$currentProfile['interest']) {
                foreach ($fieldDictionary as $main => $subs) {
                    foreach ($subs as $sub) {
                        if (preg_match("/\b" . preg_quote($sub, '/') . "\b/i", $lowerInput)) {
                            $currentProfile['interest']   = $sub;
                            $currentProfile['main_field'] = $main;
                            break 2;
                        }
                    }
                }
            }

            // ─────────────────────────────────────────────
            // 7. Extract Study Preference
            // ─────────────────────────────────────────────
            if (preg_match('/\b(diploma|certificate|short course|vocational|training)\b/i', $lastUserMessage)) {
                $currentProfile['study_preference'] = 'Diploma';
            } elseif (preg_match('/\b(degree|university|bachelor|undergrad)\b/i', $lastUserMessage)) {
                $currentProfile['study_preference'] = 'Degree';
            }

            // ─────────────────────────────────────────────
            // 8. Advanced Hierarchical Flow State Machine
            // ─────────────────────────────────────────────
            $edu       = $currentProfile['education_level'] ?? null;
            $mainField = $currentProfile['main_field']      ?? null;
            $subField  = $currentProfile['interest']        ?? null;
            $pathPref  = $currentProfile['path_preference'] ?? null;
            $stream    = $currentProfile['al_stream']       ?? null;
            $quiz      = $currentProfile['personality_quiz']?? false;

            Log::info("Flow Stage check", ['edu' => $edu, 'main' => $mainField, 'sub' => $subField]);

            // ─────────────────────────────────────────────
            // Feature: On-Demand Career Recall (Button Clicked)
            // ─────────────────────────────────────────────
            if ($user && preg_match('/\b(check last search|last search|මගේ කල්පිතය)\b/i', $lowerInput)) {
                Log::info("On-Demand Recall triggered for user {$user->id}");
                
                if (empty($subField)) {
                    return response()->json([
                        'status'            => 'success',
                        'recommendation'    => $targetLang === 'Sinhala' ? "ඔබට කිසිදු පෙර සෙවීමක් හමු නොවීය. 🔍" : "You have no previous career searches found. 🔍",
                        'profile'           => $currentProfile,
                        'suggested_replies' => ['Start New Search'],
                    ]);
                }

                $recallHeader = $targetLang === 'Sinhala' ? "### ඔබේ අවසන් සෙවීම. 🔍\n\n" : "### Your last search. 🔍\n\n";

                $savedRoadmap = UserSavedRoadmap::where('user_id', $user->id)
                    ->where('interest', $subField)
                    ->latest()
                    ->first();

                if ($savedRoadmap) {
                    return response()->json([
                        'status'            => 'success',
                        'recommendation'    => $recallHeader . $savedRoadmap->recommendation_text,
                        'profile'           => $currentProfile,
                        'real_posts'        => $savedRoadmap->real_posts_json ?? [],
                        'suggested_replies' => ['Another Field', 'Tell me more'],
                    ]);
                }
                
                // Fallback to fresh generation for that interest
                $currentProfile['extra_instruction'] = "USER RECALL: Showing their last searched career. START with: " . trim($recallHeader);
                $questionToAsk = null; 
            } else {
                // ─────────────────────────────────────────────
                // 8. Advanced Hierarchical Flow State Machine
                // ─────────────────────────────────────────────
                $suggestedReplies = [];
                $questionToAsk    = "";

                // Auto-detect O/L Failed route
                if ($edu === 'O/L Failed') {
                    $currentProfile['path_preference'] = 'Alternative';
                    $pathPref = 'Alternative';
                }

                // Stage 1: Education Level
                if (!$edu) {
                    $questionToAsk    = "Hello! 👋 I'm EMY, your UniAds Career Advisor. To give you the best guidance, what is your current education level?";
                    $suggestedReplies = ['O/L Completed', 'O/L Failed', 'A/L Completed', 'Diploma Holder', 'Undergraduate', 'Graduate'];
                    
                    // Add "Check Last Search" button for logged in users
                    if ($user) {
                        $suggestedReplies[] = 'Check Last Search';
                    }
                }
                // Stage 2: Path Preference
                elseif ($edu === 'O/L Completed' && !$pathPref) {
                    $questionToAsk    = "Since you have completed your O/Ls, would you like to continue with A/Ls or explore an Alternative Path (like a Diploma or Vocational NVQ course)?";
                    $suggestedReplies = ['A/L Stream', 'Alternative Path'];
                }
                // Stage 3a: A/L Stream (for O/L students planning A/Ls — future tense)
                elseif ($pathPref === 'A/L' && $edu === 'O/L Completed' && !$stream && !$quiz) {
                    $questionToAsk    = "Which A/L stream are you planning to study?";
                    $suggestedReplies = ['Biological Science', 'Physical Science', 'Commerce', 'Arts', 'Technology', 'Help me decide'];
                }
                // Stage 3b-i: A/L Stream (for A/L Completed students — past tense)
                elseif ($edu === 'A/L Completed' && !$stream && !$quiz) {
                    $questionToAsk    = "Which A/L stream did you complete?";
                    $suggestedReplies = ['Biological Science', 'Physical Science', 'Commerce', 'Arts', 'Technology'];
                }
                // Stage 3b: Quiz Active
                elseif ($quiz) {
                    $questionToAsk    = "Let's find out! What sounds more like you? Do you prefer working with computers, helping people, building things, or managing a business?";
                    $suggestedReplies = ['Working with computers', 'Helping people', 'Building things', 'Managing a business'];
                }
                // Stage 4: Main Field
                elseif (!$mainField) {
                    if ($pathPref === 'Alternative') {
                        $questionToAsk = "Vocational paths (NVQ) are excellent for gaining practical skills! Sri Lanka has great institutes like **NAITA, VTA, CGTTI (German Tech), and SLITHM**. Which technical field interests you the most?";
                        $suggestedReplies = array_keys($vocationalFields);
                    } else {
                        $questionToAsk = "Great! Which broad field interests you the most?";
                        $suggestedReplies = array_keys($fieldDictionary);
                    }
                }
                // Stage 5: Sub-field
                elseif (!$subField) {
                    $availableSubs = $fieldDictionary[$mainField] ?? [];
                    $questionToAsk    = "Excellent choice! Which specific area of {$mainField} would you like to explore?";
                    $suggestedReplies = array_merge($availableSubs, ['Explore Another Field']);
                }
            }

            if ($questionToAsk) {
                Log::info("Returning guiding question directly (no AI call needed): $questionToAsk");

                return response()->json([
                    'status'            => 'success',
                    'recommendation'    => $questionToAsk,
                    'profile'           => $currentProfile,
                    'real_posts'        => [],
                    'suggested_replies' => $suggestedReplies,
                ]);
            }

            // ─────────────────────────────────────────────
            // 9. Dynamic AI Prompt Context Injection
            // ─────────────────────────────────────────────
            $extraInstruction = "";

            if ($pathPref === 'Alternative' || $edu === 'O/L Failed') {
                $extraInstruction .= "IMPORTANT RULE: The student chose or needs an Alternative Pathway (e.g., they failed O/L or bypassed A/Ls). DO NOT recommend A/L streams or Direct University Degrees. STRICTLY recommend starting with an NVQ Level 3 or 4 Certificate or a vocational Diploma in {$subField} (e.g., at VTA, CGTTI, or NAITA). ";
            } elseif ($edu === 'O/L Completed') {
                if ($pathPref === 'A/L' && $stream) {
                    $extraInstruction .= "IMPORTANT RULE: The student is an O/L graduate planning to pursue the {$stream} stream for A/Ls. Keep the roadmap focused on successfully completing {$stream} and how it explicitly leads to a career in {$subField}. ";
                }
                
                $requiresAL = in_array($mainField, ['Engineering', 'Construction & Architecture', 'Healthcare & Medical', 'Law & Legal Studies']);
                if ($requiresAL && $pathPref !== 'Alternative') {
                    $extraInstruction .= "Also explicitly mention that {$mainField} typically requires excellent A/L results, but mention foundation programs as a backup plan. ";
                }
            } elseif ($edu === 'A/L Completed' && $stream) {
                $extraInstruction .= "IMPORTANT RULE: The student has completed the {$stream} stream. ";
                
                // Cross-stream detection
                $needsMathScience = in_array($mainField, ['Engineering', 'Construction & Architecture', 'Healthcare & Medical', 'Technology & IT']);
                $isArtCommerce = in_array($stream, ['Arts', 'Commerce']);
                
                if ($needsMathScience && $isArtCommerce) {
                    $extraInstruction .= "CRITICAL RULE: The student has an Arts/Commerce background but wants to pursue a STEM-heavy field ({$subField}). STRICTLY instruct them to start with a foundational bridging program or professional diploma before attempting a full degree. Acknowledge this cross-stream jump encouragingly. ";
                }
            }

            // ─────────────────────────────────────────────
            // 8.5 Tell me more logic (Enriched Insight)
            // ─────────────────────────────────────────────
            if (preg_match('/\b(tell me more|more details|explain further)\b/i', $lastUserMessage)) {
                $extraInstruction .= "THE USER REQUESTED MORE DETAILS. Please skip the basic introduction and provide significantly more IN-DEPTH details. Focus on: 1. Specific top-tier Sri Lankan universities or private institutes for this field. 2. Specific career growth salaries (Junior/Senior at top Colombo firms). 3. Professional bodies (e.g., SLMC, IESL, ICASL) they should join. 4. Overseas migration tips for this specific role. ";
                Log::info("Detected 'Tell me more' command, injecting enriched instructions.");
            }

            $currentProfile['extra_instruction'] = $extraInstruction;

            // ─────────────────────────────────────────────
            // 10. DB Query (Direct match → LIKE fallback)
            //     No ChromaDB, no embeddings needed.
            // ─────────────────────────────────────────────
            $cacheKey = "emy_roadmap_v7_" . md5(json_encode([
                $currentProfile['education_level'] ?? '',
                $currentProfile['interest'] ?? '',
                $currentProfile['study_preference'] ?? '',
                $currentProfile['language'] ?? ''
            ]));

            $matches = Cache::remember($cacheKey, 1800, function () use ($currentProfile) {
                Log::info("Cache miss — querying DB for: " . $currentProfile['interest']);

                // Primary: exact career_field match
                $direct = CareerGuidance::where('career_field', $currentProfile['interest'])->get();
                if ($direct->isNotEmpty()) {
                    Log::info("Direct match found: " . $direct->count() . " rows");
                    return $direct;
                }

                // Fallback 1: LIKE search on career_field
                Log::warning("No direct match, trying LIKE search on field");
                $likeField = CareerGuidance::where('career_field', 'LIKE', "%{$currentProfile['interest']}%")->get();
                if ($likeField->isNotEmpty()) {
                    return $likeField->take(5);
                }

                // Fallback 2: TAG search (NEW)
                Log::warning("No field match, trying TAG search");
                return CareerGuidance::where('career_tags', 'LIKE', "%{$currentProfile['interest']}%")
                    ->limit(5)
                    ->get();
            });

            // ─────────────────────────────────────────────
            // 11. Final Persistence (Redundant but safe)
            // ─────────────────────────────────────────────
            if ($user) {
                $user->update([
                    'education_level' => $currentProfile['education_level'],
                    'interest'        => $currentProfile['interest'],
                ]);
            }

            Log::info("Generating final response");
            return $this->generateResponse($matches, $currentProfile);
        } catch (\Throwable $e) {
            Log::error("FATAL Recommendation Error: " . $e->getMessage() . " in " . $e->getFile() . " on line " . $e->getLine() . "\n" . $e->getTraceAsString());
            return response()->json(['error' => 'An internal error occurred. ' . $e->getMessage()], 500);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Generate the final career roadmap response using the EMY persona prompt
    // ─────────────────────────────────────────────────────────────────────────
    private function generateResponse($matches, $currentProfile, $realPosts = null)
    {
        Log::info("generateResponse called", ['matches_count' => count($matches)]);
        $targetLang = $currentProfile['language'] ?? 'English';
        $interest   = $currentProfile['interest'] ?? '';

        // Fetch real UniAds posts related to this field
        $postsData = Post::where('status', 'active')
            ->where(function ($q) use ($interest) {
                $q->where('title', 'LIKE', "%{$interest}%")
                    ->orWhere('course_name', 'LIKE', "%{$interest}%");
            })
            ->with('institute')
            ->orderBy('is_boosted', 'desc')
            ->limit(3)
            ->get();

        // ── Map posts for the frontend and AI context ────────────────────────
        $instituteContext = "";
        $mappedPosts = $postsData->map(function ($post, $idx) use (&$instituteContext) {
            $instituteTitle = $post->institute->institute_name ?? 'UniAds Institute';
            $price = $post->price ? "LKR " . number_format($post->price) : "Contact for pricing";
            
            $instituteContext .= ($idx + 1) . ". " . ($post->course_name ?? $post->title) . " at {$instituteTitle} ({$price})\n";

            return [
                'id' => $post->id,
                'title' => $post->title ?? $post->course_name,
                'institute_name' => $instituteTitle,
                'image' => $post->image ? url('storage/' . $post->image) : '/images/placeholders/course.jpg',
                'course_type' => $post->course_type,
                'description' => $post->small_description
            ];
        });

        // ── Strict filter ────────────────────────────────────────────────────

        // Strict filter: only use rows that exactly match the interest field
        $filteredMatches = $matches->filter(function ($m) use ($interest) {
            return strtolower($m->career_field) === strtolower($interest);
        });

        // ── No data found ────────────────────────────────────────────────────
        if ($filteredMatches->isEmpty()) {
            Log::info("No data found for: $interest. Returning static fallback.");

            $noDataMessages = [
                'English' => "I'm sorry, I couldn't find detailed roadmap data for **{$interest}** in our database yet. 

However, you can still explore related high-demand fields like **Software Engineering, Data Science, or Business Operations**. 

Would you like to try one of those?",
                'Sinhala' => "**{$interest}** පිළිබඳ සවිස්තරාත්මක තොරතුරු අප සතුව දැනට නොමැත.

නමුත් ඔබට **Software Engineering, Data Science, හෝ Business Operations** වැනි ක්ෂේත්‍ර පිළිබඳ තොරතුරු මෙහිදී ලබාගත හැකිය. 

ඔබට එම ක්ෂේත්‍රයකට උත්සාහ කිරීමට අවශ්‍යද?",
                'Tamil' => "**{$interest}** பற்றிய விரிவான விவரங்கள் தற்போது எங்களிடம் இல்லை.

இருப்பினும், நீங்கள் **Software Engineering, Data Science, அல்லது Business Operations** போன்ற துறைகளை ஆராயலாம். 

நீங்கள் அவற்றை முயற்சிக்க விரும்புகிறீர்களா?"
            ];

            return response()->json([
                'status'           => 'success',
                'recommendation'   => $noDataMessages[$targetLang] ?? $noDataMessages['English'],
                'profile'          => $currentProfile,
                'real_posts'       => $mappedPosts,
                'suggested_replies' => ['Software Engineering', 'Data Science', 'Business Operations'],
            ]);
        }

        // ── Build database context string ────────────────────────────────────
        // Pick up to 3 representative rows (to keep prompt size small)
        $sample = $filteredMatches->take(3);

        $contextData = $sample->map(function ($m) {
            return implode("\n", array_filter([
                "Career Field: {$m->career_field}",
                "Category: {$m->career_category}",
                "A/L Stream Required: {$m->al_stream_required}",
                "Minimum Education: {$m->education_level}",
                "Recommended Degree: {$m->recommended_degree_or_course}",
                "Alternative Path (NVQ/Diploma): {$m->alternative_path}",
                "Entry Level Job: {$m->entry_level_job}",
                "Mid Level Job: {$m->mid_level_job}",
                "Senior Level Job: {$m->senior_level_job}",
                "Starting Salary: LKR " . number_format((float)$m->average_starting_salary_lkr),
                "Future Salary Range: LKR {$m->future_salary_range_lkr}",
                "Industry Growth in SL: {$m->industry_growth_in_sri_lanka}",
                "Technical Skills: {$m->key_skills_required}",
                "Soft Skills: {$m->recommended_soft_skills}",
                "Study Duration: {$m->study_duration_years} Years",
                "Difficulty Level: {$m->career_difficulty}",
                "Local Job Availability: {$m->local_job_availability}",
                "International Opportunity: {$m->international_opportunity}",
                "Recommended First Step: {$m->recommended_first_step}",
                "Job Description: {$m->job_description}",
            ]));
        })->join("\n\n---\n\n");

        // ── EMY Persona Prompt ───────────────────────────────────────────────
        $targetLang   = $currentProfile['language']          ?? 'English';
        $edu          = $currentProfile['education_level']   ?? 'Not specified';
        $interest     = $currentProfile['interest']          ?? 'Not specified';
        $studyPref    = $currentProfile['study_preference']  ?? 'Any';
        $stream       = $currentProfile['al_stream']         ?? 'Not specified';
        $extraRule    = $currentProfile['extra_instruction'] ?? '';

        $prompt = "You are EMY, a friendly and professional Sri Lankan career advisor working for the UniAds platform.

PERSONALITY: Friendly, Encouraging, Professional, Clear and structured, Supportive.
Always sound like a trusted Sri Lankan academic advisor helping a school student plan their future.

LANGUAGE RULE: Respond ONLY in {$targetLang}. Do NOT mix languages.

USER CONTEXT:
- Education Level: {$edu}
- A/L Stream: {$stream}
- Field of Interest: {$interest}
- Study Preference: {$studyPref}

SRI LANKAN EDUCATION RULES:
- Students with only O/L CANNOT directly enter professional bachelor's degree programs in Engineering, Medicine, or Law.
- O/L students (Completed or Failed) MUST be guided towards the 'Alternative Path' (NVQ Level 3/4 or Diploma) mentioned in the database.
- If the student is an O/L student planning to do A/Ls, EXPLICITLY RECOMMEND the 'A/L Stream Required' mentioned in the data below.
- After completing a Diploma/NVQ Level 4 or A/L, students can enter Degree programs (NVQ Level 7) at private universities.

DATABASE CAREER DATA:
{$contextData}

ACTIVE UNIADS COURSES (Mention these specifically!):
{$instituteContext}

YOUR TASK:
Create a clear, structured Career Roadmap using EXACTLY these headings:

## Career Path
Briefly explain the role and its importance in Sri Lanka.

## Recommended Courses & Path
- If O/L: Recommend the Alternative Path (NVQ) OR the specific A/L Stream required.
- If A/L: Recommend the Degree path.
- **First Step**: Explicitly mention the 'Recommended First Step' (e.g., Diploma) as the immediate next action.
- **Duration**: Mention that this path takes approximately {duration} years.

## Specific Institute Recommendations
MENTION the 'ACTIVE UNIADS COURSES' listed above if any. Invite them to check the links below.

## Additional Certifications
List certifications from the database.

## Career Progression
- 🟢 Entry Level: {job title}
- 🔵 Mid Level: {job title}
- 🔴 Senior Level: {job title}

## Salary Expectations (LKR)
Mention starting and future ranges.

## Market Outlook
Briefly mention the 'Local Job Availability' and 'International Opportunity' (e.g., 'High demand locally with great overseas potential').

STRICT RULES:
1. Output ONLY in {$targetLang}.
2. Use ONLY data from the DATABASE CAREER DATA and ACTIVE UNIADS COURSES.
3. If no data exists, say UniAds has limited data for that field.
4. Keep the response under 200 words.
{$extraRule}";

        return $this->callGroq($prompt, $currentProfile, $mappedPosts, ['Another Field', 'Tell me more']);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Call the Groq API (OpenAI Compatible)
    // ─────────────────────────────────────────────────────────────────────────
    private function callGroq($prompt, $profile, $realPosts = [], $suggestedReplies = [])
    {
        Log::info("callGroq called");
        $apiKey = config('services.groq.key') ?? env('GROQ_API_KEY');
        $url    = "https://api.groq.com/openai/v1/chat/completions";

        try {
            Log::info("Posting to Groq API...");
            /** @var \Illuminate\Http\Client\Response $response */
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type'  => 'application/json',
            ])->timeout(30)->post($url, [
                "model"       => "llama-3.3-70b-versatile",
                "messages"    => [
                    [
                        "role"    => "user",
                        "content" => $prompt
                    ]
                ],
                "temperature" => 0.25,
                "max_tokens"  => 1024,
            ]);

            if ($response && method_exists($response, 'successful') && $response->successful()) {
                Log::info("Groq call successful");
                $data    = $response->json();
                $choices = $data['choices'] ?? [];

                $text = 'Sorry, I could not generate a response.';
                if (!empty($choices) && isset($choices[0]['message']['content'])) {
                    $text = $choices[0]['message']['content'];
                }

                return response()->json([
                    'status'           => 'success',
                    'recommendation'   => $text,
                    'profile'          => $profile,
                    'real_posts'       => $realPosts,
                    'suggested_replies' => $suggestedReplies,
                ]);
            } else {
                $status = $response && method_exists($response, 'status') ? $response->status() : 500;
                $body = $response && method_exists($response, 'body') ? $response->body() : 'No response body';
                Log::error("Groq API Error ($status): " . $body);

                if ($status === 429) {
                    return response()->json([
                        'status'           => 'success',
                        'recommendation'   => "I'm currently receiving too many requests. Please wait a few seconds and try again! ⏳",
                        'profile'          => $profile,
                        'suggested_replies' => $suggestedReplies,
                    ]);
                }
            }
        } catch (\Throwable $e) {
            Log::error("Groq Call Error: " . $e->getMessage());
        }

        return response()->json([
            'status'           => 'success',
            'recommendation'   => "I'm having a bit of trouble connecting right now. Please try again in a moment! 🧠",
            'profile'          => $profile,
            'suggested_replies' => $suggestedReplies,
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Saved Roadmaps CRUD
    // ─────────────────────────────────────────────────────────────────────────
    public function getSavedRoadmaps(Request $request)
    {
        $roadmaps = $request->user()->savedRoadmaps()->latest()->get();
        return response()->json($roadmaps);
    }

    public function saveRoadmap(Request $request)
    {
        $request->validate([
            'career_goal'         => 'nullable|string',
            'interest'            => 'nullable|string',
            'education_level'     => 'nullable|string',
            'recommendation_text' => 'required|string',
            'real_posts'          => 'nullable|array',
        ]);

        $roadmap = $request->user()->savedRoadmaps()->create([
            'career_goal'         => $request->career_goal,
            'interest'            => $request->interest,
            'education_level'     => $request->education_level,
            'recommendation_text' => $request->recommendation_text,
            'real_posts_json'     => $request->real_posts,
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Roadmap saved to your profile! ✅',
            'roadmap' => $roadmap,
        ]);
    }

    public function deleteRoadmap(Request $request, $id)
    {
        $roadmap = $request->user()->savedRoadmaps()->findOrFail($id);
        $roadmap->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Roadmap deleted.',
        ]);
    }
}
