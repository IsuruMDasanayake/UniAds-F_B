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
use App\Services\CareerAliasMapper;

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
            $initialProfile = $currentProfile; // [NEW] Capture profile state before extraction logic

            // ─────────────────────────────────────────────
            // 0. Global Command Reset (Another Field / Start Over)
            // ─────────────────────────────────────────────
            $lowerInput = strtolower($lastUserMessage);
            if (preg_match('/\b(another field|change field|different field|new field|explore all fields)\b/i', $lowerInput)) {
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

            // Removed early user->update; moved to after extraction logically.
            if ($user && !empty($lastUserMessage) && !preg_match('/\b(start over|reset|another field)\b/i', $lastUserMessage)) {
                // FEATURE: Auto-infer path_preference based on education level
                if (empty($currentProfile['path_preference']) && !empty($currentProfile['education_level'])) {
                    if (in_array($currentProfile['education_level'], ['A/L Completed', 'Undergraduate', 'Graduate', 'Diploma Holder'])) {
                        $currentProfile['path_preference'] = 'A/L';
                    }
                }
            }

            // ─────────────────────────────────────────────
            // 2. Field Dictionary
            //    Sub-field values MUST exactly match the
            //    career_field column in the DB.
            // ─────────────────────────────────────────────
            $fieldDictionary = [
                'Technology & IT' => [
                    'Software Architect', 'Cybersecurity Analyst', 'Cybersecurity Engineer', 'Data Engineer', 'Data Analyst', 'Machine Learning Engineer', 'MLOps Engineer', 'Cloud Architect', 'DevOps Engineer', 'Site Reliability Engineer', 'Blockchain Developer', 'Game Developer', 'AR Developer', 'VR Developer', 'Mobile App Developer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'IT Systems Administrator', 'Network Engineer', 'Database Administrator', 'AI Engineer', 'Robotics Software Engineer', 'Information Security Officer', 'Software QA Engineer', 'Technical Support Engineer', 'Software Engineer', 'Data Scientist',
                ],
                'Engineering' => [
                    'Civil Engineer', 'Structural Engineer', 'Mechanical Engineer', 'Electrical Engineer', 'Electronic Engineer', 'Mechatronics Engineer', 'Industrial Engineer', 'Chemical Engineer', 'Aerospace Engineer', 'Petroleum Engineer', 'Geotechnical Engineer', 'Marine Engineer', 'Renewable Energy Engineer', 'Automotive Engineer', 'Manufacturing Engineer', 'Environmental Engineer', 'Mining Engineer', 'Quality Engineer',
                ],
                'Healthcare & Medical' => [
                    'Doctor / Physician', 'Dentist', 'Nurse', 'Pharmacist', 'Radiologist', 'Physiotherapist', 'Optometrist', 'Veterinarian', 'Psychologist', 'Clinical Psychologist', 'Nutritionist', 'Dietitian', 'Speech Therapist', 'Medical Laboratory Scientist', 'Public Health Officer', 'Medical Writer', 'Occupational Therapist', 'Paramedic', 'Health Information Technician', 'Speech Pathologist',
                ],
                'Business & Management' => [
                    'Business Analyst', 'Product Manager', 'Operations Manager', 'Marketing Manager', 'Sales Manager', 'Human Resource Manager', 'Project Manager', 'Business Development Manager', 'Management Consultant', 'Logistics Manager', 'E-commerce Manager', 'Event Manager', 'Supply Chain Manager', 'Risk Manager', 'Financial Controller', 'Procurement Manager', 'Training and Development Manager', 'Export Manager', 'Sustainability Manager', 'Economist', 'Entrepreneur / Startup Founder',
                ],
                'Agri-Tech & Sustainability' => [
                    'Agricultural Scientist', 'Estate Manager', 'Agricultural Engineer', 'Hydroponics Specialist', 'Agribusiness Manager', 'Sustainability Consultant', 'Environmental Scientist',
                ],
                'Finance & Accounting' => [
                    'Chartered Accountant', 'Auditor', 'Tax Consultant', 'Financial Analyst', 'Investment Analyst', 'Risk Analyst', 'Financial Advisor', 'Bank Manager', 'Credit Analyst', 'Stockbroker', 'Internal Auditor', 'Forensic Accountant',
                ],
                'Law & Legal Studies' => [
                    'Attorney-at-Law', 'Corporate Lawyer', 'Legal Consultant', 'Legal Researcher', 'Judge', 'Notary Public', 'Legal Compliance Officer', 'Paralegal', 'Corporate Secretary',
                ],
                'Creative Arts & Design' => [
                    'Graphic Designer', 'UI Designer', 'UX Designer', 'Product Designer', 'Interior Designer', 'Fashion Designer', 'Animator', 'Illustrator', 'Video Game Artist', 'Interior Architect', 'UI/UX Engineer', 'Digital Artist', '3D Modeler', 'Art Director', 'Set Designer', 'Sound Designer', 'Jewelry Designer', 'Landscape Architect', 'Fashion Stylist',
                ],
                'Media & Communication' => [
                    'Journalist', 'Content Writer', 'PR Specialist', 'Social Media Manager', 'Broadcast Journalist', 'Copywriter', 'Web Content Manager', 'Media Researcher', 'Content Strategist', 'Public Relations Officer', 'News Presenter', 'Video Producer', 'Podcast Producer',
                ],
                'Hospitality & Tourism' => [
                    'Travel Agent', 'Tour Guide', 'Chef', 'Hotel Manager', 'Waitron / Server', 'Housekeeper', 'Pastry Chef', 'Sommelier', 'Barista', 'Flight Attendant', 'Cruise Ship Attendant', 'Restaurant Manager', 'Travel Consultant', 'Event Planner', 'Hotel Receptionist',
                ],
                'Modern Finance' => [
                    'Fintech Analyst', 'Cryptocurrency Analyst', 'Blockchain Finance Specialist', 'Digital Payments Specialist',
                ],
                'Education & Teaching' => [
                    'University Lecturer', 'School Teacher', 'Primary School Teacher', 'Secondary School Teacher', 'Special Education Teacher', 'Academic Counselor', 'Curriculum Developer',
                ],
                'Logistics & Supply Chain' => [
                    'Supply Chain Analyst', 'Warehouse Manager', 'Logistics Coordinator', 'Inventory Manager',
                ],
                'Construction & Architecture' => [
                    'Architect', 'Urban Planner', 'Quantity Surveyor', 'Construction Project Manager',
                ],
                'Skilled Trades & Vocational' => [
                    'Electrician', 'Plumber', 'Carpenter', 'Welder', 'Automobile Mechanic', 'AC Technician', 'Electronics Repair Technician', 'Mason', 'Painter', 'Tiler', 'Beautician', 'Tailor', 'Barber',
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
            // 4. Extract Education Level (Robust Keyword Matching)
            // ─────────────────────────────────────────────
            
            $quickReplyEduLevels = ['O/L Completed', 'O/L Failed', 'A/L Completed', 'Diploma Holder', 'Undergraduate', 'Graduate'];
            if (in_array(trim($lastUserMessage), $quickReplyEduLevels)) {
                $currentProfile['education_level'] = trim($lastUserMessage);
            } else {
                $eduKeywords = [
                    'O/L Failed'     => ['failed o/l', 'fail o/l', 'failed ol', 'fail ol', 'failed ordinary level'],
                    'O/L Completed'  => ['o/l', 'o/ls', 'ol', 'ols', 'ordinary level', 'grade 11', 'o levels', 'o/l completed', 'o/l student', 'o/l pending', 'O/L Pending', 'O/L', 'O/L Student','OL'],
                    'A/L Completed'  => ['a/l', 'a/ls', 'al', 'als', 'advanced level', 'grade 13', 'a level', 'a levels', 'a/l completed', 'a/l student', 'a/l pending', 'A/L Pending', 'A/L', 'A/L Student','AL'],
                    'Diploma Holder' => ['hnd', 'higher national diploma', 'hnc', 'diploma holder', 'diploma student', 'diploma pending', 'Diploma Pending', 'Diploma Holder', 'Diploma Student'],
                    'Undergraduate'  => ['undergraduate', 'undergrad', 'bachelor', 'degree student', 'uni student', 'university student', 'undergraduate', 'undergraduate student', 'undergraduate pending', 'Undergraduate Pending'],
                    'Graduate'       => ['graduate', 'graduated', 'degree holder', 'bsc', 'ba', 'bba', 'masters', 'phd', 'graduate', 'graduate student', 'graduate pending', 'Graduate Pending'],
                ];
                
                foreach ($eduKeywords as $level => $keywords) {
                    foreach ($keywords as $kw) {
                        // Use word boundaries for short acronyms to avoid false positives (e.g. 'ba' in 'backend')
                        if (in_array($kw, ['ol', 'al', 'ols', 'als', 'ba', 'bsc', 'msc', 'hnd', 'hnc'])) {
                            // Fix: Don't match 'al stream' or 'al path' as 'A/L Completed'
                            if (preg_match("/\b" . preg_quote($kw, '/') . "\b/i", $lowerInput) && !preg_match('/\b(stream|path)\b/i', $lowerInput)) {
                                $currentProfile['education_level'] = $level;
                                $eduFound = true;
                                break 2;
                            }
                        } else {
                            if (str_contains($lowerInput, $kw) && !preg_match('/\b(stream|path)\b/i', $lowerInput)) {
                                $currentProfile['education_level'] = $level;
                                $eduFound = true;
                                break 2;
                            }
                        }
                    }
                }
            }

            // FEATURE: Reset downstream fields if a NEW education level was just picked
            // This prevents skipping questions based on stale data from previous searches.
            $isQuickReply = in_array(trim($lastUserMessage), $quickReplyEduLevels);
            if ($isQuickReply || ($currentProfile['education_level'] && !empty($eduFound))) {
                $currentProfile['path_preference']  = null;
                $currentProfile['al_stream']        = null;
                $currentProfile['main_field']       = null;
                $currentProfile['interest']         = null;
                $currentProfile['study_preference'] = null;
                $currentProfile['personality_quiz'] = false;
                Log::info("Education Level updated. Resetting downstream profile for a clean flow.");
            }

            // ─────────────────────────────────────────────
            // 4.5. Extract Path Preference, A/L Stream & Personality Quiz
            // ─────────────────────────────────────────────
            // Path Preference
            if (!$currentProfile['path_preference']) {
                if (preg_match('/\b(a\/l stream|do a\/ls|al stream|a\/ls|al)\b/i', $lowerInput)) {
                    $currentProfile['path_preference'] = 'A/L';
                } elseif (preg_match('/\b(alternative path|vocational course|nvq|alternative)\b/i', $lowerInput)) {
                    $currentProfile['path_preference'] = 'Alternative';
                } elseif (preg_match('/\b(explore all fields)\b/i', $lowerInput) && $currentProfile['education_level'] === 'O/L Completed') {
                    // Bypass Stage 2 & 3 (Path Selection) to get straight to careers
                    $currentProfile['path_preference'] = 'Discovery';
                    Log::info("User clicked 'Explore All Fields' at O/L stage. Bypassing path selection via 'Discovery' state.");
                }
            }

            // 4.6. Parse Personality Quiz Responses (Priority for quiz flow)
            if ($currentProfile['personality_quiz']) {
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

            // 4.7. A/L Stream (Extraction)
            if (!$currentProfile['al_stream']) {
                if (preg_match('/\b(math|maths|physical science)\b/i', $lowerInput)) $currentProfile['al_stream'] = 'Physical Science';
                elseif (preg_match('/\b(bio|biological science|biology)\b/i', $lowerInput)) $currentProfile['al_stream'] = 'Biological Science';
                elseif (preg_match('/\b(art|arts)\b/i', $lowerInput)) $currentProfile['al_stream'] = 'Arts';
                elseif (preg_match('/\b(commerce|business)\b/i', $lowerInput)) $currentProfile['al_stream'] = 'Commerce';
                elseif (preg_match('/\b(tech|technology|ict|sft)\b/i', $lowerInput)) $currentProfile['al_stream'] = 'Technology';
            }

            // 4.8. Personality Quiz Trigger
            if (preg_match('/\b(help me decide|i don\'t know|not sure|help)\b/i', $lowerInput) && !$currentProfile['al_stream']) {
                $currentProfile['personality_quiz'] = true;
            }

            // ─────────────────────────────────────────────
            // 5. Extract Interest and Main Field (Robust Matching)
            // ─────────────────────────────────────────────
            
            $lowerInput = strtolower(trim($lastUserMessage));
            // Preserve ampersands for specific categories (like Skilled Trades & Vocational)
            $cleanInput = strtolower(trim(preg_replace('/[^a-z0-9\s&]/i', '', $lastUserMessage)));
            Log::info("Processing input: '$lastUserMessage' (Clean: '$cleanInput')");
            
            // FEATURE: Skip career extraction if input is a pure A/L Stream name 
            // to avoid false positives (e.g. "Arts" stream being seen as "Graphic Designer" interest)
            $isPureStreamName = in_array($lowerInput, ['arts', 'art', 'biological science', 'bio', 'biology', 'physical science', 'math', 'maths', 'commerce', 'business', 'technology', 'tech', 'ict']);

            // Priority 0: Exact Main Field match (Quick Reply)
            $exactMainMatch = false;
            if (!$isPureStreamName) {
                foreach ($fieldDictionary as $main => $subs) {
                    if (strtolower($main) === $lowerInput) {
                        $currentProfile['main_field'] = $main;
                        $currentProfile['interest']   = null; // Reset interest to force Sub-field question
                        $exactMainMatch = true;
                        Log::info("Exact Main Field match detected: $main. Resetting interest.");
                        break;
                    }
                }
            }

            // Priority 1: Main Field Keyword match (Free text typing)
            if (!$exactMainMatch && !$isPureStreamName) {
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
                            // Specific case sensitivity rule for IT to avoid matching within generic wording
                            $modifier = $kw === 'it' ? '' : 'i';
                            $patternKW = $kw === 'it' ? 'IT' : $kw;
                            if (preg_match("/\b" . preg_quote($patternKW, '/') . "\b/{$modifier}", $kw === 'it' ? $lastUserMessage : $lowerInput)) {
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
                // Instantiate the external mapper service
                $aliasMapper = new CareerAliasMapper();
                $mappedTitle = $aliasMapper->getStandardTitle($lowerInput);

                if ($mappedTitle) {
                    $currentProfile['interest'] = $mappedTitle;
                    // Resolve correct main_field from dictionary
                    $resolvedMainField = $aliasMapper->getMainFieldForTitle($mappedTitle, $fieldDictionary);
                    if ($resolvedMainField) {
                        $currentProfile['main_field'] = $resolvedMainField;
                    }
                }
            }

            // Priority 3: Extract Sub-field via Tag Match (Database-backed fallback)
            if (!$exactMainMatch && !$currentProfile['interest'] && !$isPureStreamName) {
                if (strlen($lowerInput) > 3) {
                    $sanitizedInput = \Illuminate\Support\Str::limit(trim(preg_replace('/[^a-z0-9\s]/i', '', $lowerInput)), 40, '');
                    $tagMatch = \App\Models\CareerGuidance::where('career_tags', 'LIKE', "%{$sanitizedInput}%")
                        ->orWhere('career_field', 'LIKE', "%{$sanitizedInput}%")
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
            if (!$exactMainMatch && !$currentProfile['interest'] && !$isPureStreamName) {
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
                // If they specifically picked Skilled Trades as a shortcut
                if (str_contains($lowerInput, 'skilled trades')) {
                    $currentProfile['main_field'] = 'Skilled Trades & Vocational';
                    $currentProfile['path_preference'] = 'Alternative';
                }
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
            $studyPref = $currentProfile['study_preference']?? null;
            $stream    = $currentProfile['al_stream']       ?? null;
            $quiz      = $currentProfile['personality_quiz']?? false;

            Log::info("Flow Stage check", ['edu' => $edu, 'main' => $mainField, 'sub' => $subField]);

            // ─────────────────────────────────────────────
            // 8.1. Persist State to User DB (Post-Extraction)
            // ─────────────────────────────────────────────
            if ($user && !empty($lastUserMessage) && !preg_match('/\b(start over|reset|another field)\b/i', $lastUserMessage)) {
                $updateData = [
                    'education_level' => $currentProfile['education_level'],
                    'path_preference' => $currentProfile['path_preference'] ?? null,
                    'al_stream'       => $currentProfile['al_stream'],
                    'main_field'      => $currentProfile['main_field'],
                    'interest'        => $currentProfile['interest'],
                    'study_preference'=> $currentProfile['study_preference'],
                ];

                if (!empty($currentProfile['education_level']) && 
                    empty($currentProfile['main_field']) && 
                    !preg_match('/\b(check last search)\b/i', $lowerInput)) {
                    $updateData['main_field'] = null;
                    $updateData['interest']   = null;
                }

                $user->update($updateData);
            }

            // ─────────────────────────────────────────────
            // Feature: On-Demand Career Recall (Button Clicked)
            // ─────────────────────────────────────────────
            if ($user && preg_match('/\b(check last search|last search|මගේ කල්පිතය)\b/i', $lowerInput)) {
                Log::info("On-Demand Recall triggered for user {$user->id}");
                
                if (empty($subField)) {
                    $noSearchMsg = "You have no previous career searches found. 🔍";
                    if ($targetLang === 'Sinhala') $noSearchMsg = "ඔබට කිසිදු පෙර සෙවීමක් හමු නොවීය. 🔍";
                    elseif ($targetLang === 'Tamil') $noSearchMsg = "உங்கள் முந்தைய தேடல்கள் எதுவும் கிடைக்கவில்லை. 🔍";

                    return $this->success([
                        'recommendation'    => $noSearchMsg,
                        'profile'           => $currentProfile,
                        'suggested_replies' => ['Start New Search'],
                    ]);
                }

                $recallHeader = "### Your last search. 🔍\n\n";
                if ($targetLang === 'Sinhala') $recallHeader = "### ඔබේ අවසන් සෙවීම. 🔍\n\n";
                elseif ($targetLang === 'Tamil') $recallHeader = "### உங்கள் கடைசி தேடல். 🔍\n\n";

                $savedRoadmap = UserSavedRoadmap::where('user_id', $user->id)
                    ->where('interest', $subField)
                    ->latest()
                    ->first();

                if ($savedRoadmap) {
                    $refreshedPosts = $this->getMappedPosts($subField)['mappedPosts'];
                    return $this->success([
                        'recommendation'    => $recallHeader . $savedRoadmap->recommendation_text,
                        'profile'           => $currentProfile,
                        'real_posts'        => !empty($refreshedPosts) ? $refreshedPosts : ($savedRoadmap->real_posts_json ?? []),
                        'suggested_replies' => ['Another Field'],
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
                elseif ($edu === 'O/L Completed' && !$pathPref && !$studyPref && !$mainField && !$subField) {
                    $questionToAsk    = "Since you have completed your O/Ls, would you like to continue with A/Ls or explore an Alternative Path (like a Diploma or Vocational NVQ course)?";
                    $suggestedReplies = ['A/L Stream', 'Diploma', 'Skilled Trades & Vocational', 'Explore All Fields'];
                }
                // Stage 3a: A/L Stream (for O/L students planning A/Ls — future tense)
                elseif ($pathPref === 'A/L' && $edu === 'O/L Completed' && !$stream && !$quiz && !$mainField) {
                    $questionToAsk    = "Which A/L stream are you planning to study?";
                    $suggestedReplies = ['Biological Science', 'Physical Science', 'Commerce', 'Arts', 'Technology', 'Help me decide'];
                }
                // Stage 3b-i: A/L Stream (for A/L Completed students — past tense)
                elseif ($edu === 'A/L Completed' && !$stream && !$quiz && !$mainField) {
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
                        // Customize message for higher education levels
                        if (in_array($edu, ['Diploma Holder', 'Undergraduate', 'Graduate'])) {
                            $questionToAsk = "Great! Which broad field is your current qualification or area of expertise in?";
                        }
                        $suggestedReplies = array_keys($fieldDictionary);
                    }
                }
                // Stage 5: Sub-field
                elseif (!$subField) {
                    $availableSubs = $fieldDictionary[$mainField] ?? [];
                    $questionToAsk    = "Excellent choice! Which specific area of {$mainField} would you like to explore?";
                    $suggestedReplies = array_merge($availableSubs, ['Explore All Fields']);
                }
            }

            if ($questionToAsk) {
                // [NEW] Logic to detect "State Lock" (No progress made)
                // Filter out commands that intentionally don't change fields yet (like 'Help' or 'Check last search')
                $isSystemCommand = preg_match('/\b(start over|reset|another field|help|check last search)\b/i', $lowerInput);
                
                // Compare relevant profile fields
                $fieldsToWatch = ['education_level', 'path_preference', 'al_stream', 'main_field', 'interest', 'study_preference'];
                $progressMade = false;
                foreach ($fieldsToWatch as $f) {
                    if (($currentProfile[$f] ?? null) !== ($initialProfile[$f] ?? null)) {
                        $progressMade = true;
                        break;
                    }
                }

                $nudgeMessage = $questionToAsk;
                if (!$progressMade && !$isSystemCommand && !empty($lastUserMessage)) {
                    $prefix = "I'm sorry, I didn't quite catch that. 😅 To help you better, ";
                    if ($targetLang === 'Sinhala') $prefix = "සමාවන්න, මට එය හරියටම වැටහුණේ නැහැ. 😅 ඔබට වඩා හොඳින් උදවු කිරීමට, ";
                    elseif ($targetLang === 'Tamil') $prefix = "மன்னிக்கவும், எனக்கு அது சரியாக புரியவில்லை. 😅 உங்களுக்கு சிறப்பாக உதவ, ";
                    
                    $nudgeMessage = $prefix . mb_strtolower(mb_substr($questionToAsk, 0, 1)) . mb_substr($questionToAsk, 1);
                }

                Log::info("Returning guiding question (Progress: " . ($progressMade ? 'Yes' : 'No') . "): $nudgeMessage");

                return $this->success([
                    'recommendation'    => $nudgeMessage,
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
                $currentProfile['al_stream'] ?? '',
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
            return $this->error('An internal error occurred. Please try again later.');
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

        // Fetch and map real UniAds posts
        $courseData = $this->getMappedPosts($interest);
        $mappedPosts = $courseData['mappedPosts'];
        $instituteContext = $courseData['instituteContext'];

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

            return $this->success([
                'recommendation'   => $noDataMessages[$targetLang] ?? $noDataMessages['English'],
                'profile'          => $currentProfile,
                'real_posts'       => $mappedPosts,
                'suggested_replies' => ['Software Engineering', 'Data Science', 'Business Operations'],
            ]);
        }

        // ── Build database context string ────────────────────────────────────
        // Pick up to 2 representative rows (to keep prompt size small and save tokens)
        $sample = $filteredMatches->take(2);

        $contextData = $sample->map(function ($m) {
            $postGrad = $m->postgrad_path ?: str_replace('Bachelor', 'Master', $m->recommended_degree_or_course);
            return implode("\n", array_filter([
                "Career Field: {$m->career_field}",
                "Category: {$m->career_category}",
                "A/L Stream Required: {$m->al_stream_required}",
                "Minimum Education: {$m->education_level}",
                "Recommended Degree Fields: {$m->recommended_degree_or_course}",
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
                "Postgraduate/Master's Pathway: {$postGrad}",
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

PERSONALITY:
Friendly, supportive, professional, and clear.
Guide students like a trusted Sri Lankan academic advisor.

LANGUAGE RULE:
Respond ONLY in {$targetLang}. Never mix languages.

USER CONTEXT
Education Level: {$edu}
A/L Stream: {$stream}
Field of Interest: {$interest}
Study Preference: {$studyPref}

SRI LANKAN EDUCATION RULES
- Students with only O/L cannot directly enter professional bachelor's degrees such as Engineering, Medicine, or Law.
- **CRITICAL (O/L with Diploma Selection)**: If Education Level is 'O/L Completed' AND Study Preference is 'Diploma', you MUST recommend this exact sequence:
  1. **Short Diploma** (6 months to 1 year duration) to gain immediate basic skills.
  2. **A/Ls** in the recommended stream (from database) while or after the diploma.
  3. **Bachelor's Degree** after completing A/Ls.
- **CRITICAL**: If Study Preference is 'Diploma', you MUST suggest a **Diploma, HND, or NVQ course** as the first step. Do NOT suggest a degree even if they have A/Ls.
- **CRITICAL (Undergraduates & Graduates)**: If Education Level is 'Undergraduate' or 'Graduate', you MUST NOT recommend starting a basic Bachelor's degree. Instead, STRICTLY recommend the **Postgraduate/Master's Pathway** (e.g., MSc, MBA, PhD, Postgraduate Diplomas) provided in the database as their next step.
- **CRITICAL**: Do NOT assume the student is already a 'Diploma Holder' if they are only expressing a preference for one. Only use the 'Diploma Holder' rules if Education Level is exactly 'Diploma Holder'.
- **AGRICULTURAL FIELDS**: For Agricultural-related fields, always recommend the **Biological Science** A/L stream, but explicitly advise the user to **take 'Agriculture' as a subject instead of 'Biology'**.
- **IT FIELDS**: For IT-related fields, explicitly state that the student can choose **ANY A/L stream** (Maths, Arts, Commerce, or Technology), provided they take **ICT** as a subject.
- **TOURISM & HOSPITALITY**: For Tourism, Hotel Management, and Hospitality-related fields, you MUST explicitly suggest **SLITHM (Sri Lanka Institute of Tourism and Hotel Management)** as the premier institute for professional courses and diplomas in Sri Lanka.
- If the student plans to do A/L, recommend the required A/L stream from the database.
- If the database says the required stream is 'Any', explicitly state that ANY A/L stream is acceptable for this career.
- **DEGREE VARIETY**: The 'Recommended Degree Fields' from the database contain broad categories (e.g., 'Computer Science; Software Engineering'). You MUST recommend that students can pursue various degree types such as **BSc, BEng, BIT, or BTech** in these specific fields. Do NOT suggest only one degree title.
- **PRECISION**: Use the exact **Recommended First Step** from the database as the primary instruction for the student.
- After NVQ Level 4 or A/L, students can enter degree programs.

DATABASE CAREER DATA
{$contextData}

ACTIVE UNIADS COURSES
{$instituteContext}

TASK
Create a clear career roadmap using these headings.

## Career Path
Explain the role and why it is important in Sri Lanka.

## Recommended Courses & Path
Outline the full progression based on their Education Level. Include:
1. **A/L Requirements**: The necessary stream (skip if Undergraduate/Graduate).
2. **Standard Path**: The recommended university degree (or Postgraduate/Master's Pathway if they are an Undergraduate/Graduate).
3. **Alternative Path**: Any diploma, NVQ, or alternative entry point listed in the database.
First Step: Provide the exact sensible **Recommended First Step** based on their current Education Level.

## Specific Institute Recommendations
Mention the ACTIVE UNIADS COURSES if available.

## Additional Certifications
List useful certifications from the database.

## Career Progression
Entry Level → Mid Level → Senior Level

## Salary Expectations (LKR)
Provide realistic ranges.

## Market Outlook
Mention local demand and international opportunities.

RULES
- Use ONLY information from the provided database.
- If information is missing, say 'Data currently limited in UniAds'.
- Do not invent universities or courses.
- **Bold** all degree names, course titles, and the 'First Step' recommendation.
- Keep response concise (150–250 words).
- Do not recommend illegal, unrealistic, or dangerous paths.
{$extraRule}";

        return $this->callGroq($prompt, $currentProfile, $mappedPosts, ['Another Field']);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Call the Groq API (OpenAI Compatible)
    // ─────────────────────────────────────────────────────────────────────────
    private function callGroq($prompt, $profile, $realPosts = [], $suggestedReplies = [])
    {
        Log::info("callGroq called");
        $apiKey = config('services.groq.key');
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

                return $this->success([
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
                    return $this->success([
                        'recommendation'   => "I'm currently receiving too many requests. Please wait a few seconds and try again! ⏳",
                        'profile'          => $profile,
                        'suggested_replies' => $suggestedReplies,
                    ]);
                }
            }
        } catch (\Throwable $e) {
            Log::error("Groq Network/Execution Error: " . $e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
        }

        return $this->success([
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
        return $this->successResponse($roadmaps);
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

        return $this->success($roadmap, 'Roadmap saved to your profile! ✅');
    }

    public function deleteRoadmap(Request $request, $id)
    {
        $roadmap = $request->user()->savedRoadmaps()->findOrFail($id);
        $roadmap->delete();

        return $this->success(null, 'Roadmap deleted.');
    }

    /**
     * Helper to fetch and map UniAds posts for a given interest.
     * Prioritizes premium institutes and provides detailed attributes.
     */
    private function getMappedPosts($interest)
    {
        if (empty($interest)) {
            return ['mappedPosts' => [], 'instituteContext' => ""];
        }

        $postsData = Post::where('posts.status', 'active')
            ->where(function ($q) use ($interest) {
                $q->where('posts.title', 'LIKE', "%{$interest}%")
                    ->orWhere('posts.course_name', 'LIKE', "%{$interest}%");
            })
            ->join('institutes', 'posts.institute_id', '=', 'institutes.id')
            ->select('posts.*')
            ->with(['institute', 'category'])
            ->orderByDesc('posts.score_cache')
            ->limit(15)
            ->get();

        $mixedPosts = \App\Services\RankingService::applyFairExposure($postsData, 5, 2, 1)->take(3);

        $instituteContext = "";
        $mappedPosts = $mixedPosts->map(function ($post, $idx) use (&$instituteContext) {
            $instituteTitle = $post->institute->institute_name ?? 'UniAds Institute';
            $priceValue = $post->price ?? null;
            $price = $priceValue ? "LKR " . number_format($priceValue) : "Contact for pricing";
            
            $instituteContext .= ($idx + 1) . ". " . ($post->course_name ?? $post->title) . " at {$instituteTitle} ({$price})\n";

            return [
                'id' => $post->id,
                'title' => $post->title ?? $post->course_name,
                'institute_name' => $instituteTitle,
                'image' => $post->image ? url('storage/' . $post->image) : '/images/placeholders/course.jpg',
                'course_type' => $post->course_type,
                'course_name' => $post->category?->name ?? $post->course_name,
                'location' => $post->location,
                'duration' => $post->duration,
                'course_format' => $post->course_format,
                'attendance_type' => $post->attendance_type,
                'description' => $post->description,
                'is_premium' => (bool) ($post->institute->is_premium ?? false),
                'premium_expires_at' => $post->institute->premium_expires_at ?? null,
                'share_link' => $post->share_link
            ];
        })->toArray();

        return [
            'mappedPosts' => $mappedPosts,
            'instituteContext' => $instituteContext
        ];
    }
}
