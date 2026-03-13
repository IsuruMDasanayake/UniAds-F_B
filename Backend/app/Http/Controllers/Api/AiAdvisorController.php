<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\CareerGuidance;
use App\Models\Post;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

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

            $currentProfile = $validated['profile'] ?? [
                'education_level'  => null,
                'stream'           => null,
                'main_field'       => null,
                'interest'         => null,
                'career_goal'      => null,
                'study_preference' => null,
                'language'         => 'English',
            ];

            Log::info("Current profile state", ['profile' => $currentProfile]);

            // ─────────────────────────────────────────────
            // 1. Language Detection
            // ─────────────────────────────────────────────
            $targetLang = $currentProfile['language'] ?? 'English';
            if (preg_match('/[අ-ෆ]/u', $lastUserMessage)) $targetLang = 'Sinhala';
            elseif (preg_match('/[அ-ஹ]/u', $lastUserMessage))  $targetLang = 'Tamil';
            $currentProfile['language'] = $targetLang;

            // ─────────────────────────────────────────────
            // 2. Field Dictionary
            //    Sub-field values MUST exactly match the
            //    career_field column in the DB.
            // ─────────────────────────────────────────────
            $fieldDictionary = [
                'Technology & IT' => [
                    'Software Engineering',
                    'Web Development',
                    'Mobile App Development',
                    'Data Science',
                    'Artificial Intelligence',
                    'Machine Learning',
                    'Cybersecurity',
                    'Information Security',
                    'Cloud Computing',
                    'DevOps Engineering',
                    'IT Infrastructure',
                    'Network Engineering',
                    'Database Administration',
                    'Game Development',
                    'UI/UX Design'
                ],
                'Engineering & Architecture' => [
                    'Civil Engineering',
                    'Mechanical Engineering',
                    'Electrical Engineering',
                    'Electronic Engineering',
                    'Mechatronics Engineering',
                    'Automobile Engineering',
                    'Industrial Engineering',
                    'Robotics Engineering',
                    'Architecture',
                    'Quantity Surveying',
                    'Construction Management'
                ],
                'Business & Management' => [
                    'Business Operations',
                    'Business Management',
                    'Entrepreneurship',
                    'Project Management',
                    'Finance',
                    'Accounting',
                    'Banking',
                    'Marketing',
                    'Digital Marketing',
                    'Human Resources',
                    'Supply Chain Management',
                    'Logistics',
                    'International Business'
                ],
                'Medicine & Health Sciences' => [
                    'Healthcare - Medical',
                    'Healthcare - Nursing',
                    'Pharmacy',
                    'Medical Laboratory Science',
                    'Public Health',
                    'Psychology',
                    'Counseling',
                    'Physiotherapy',
                    'Nutrition & Dietetics'
                ],
                'Law & Legal Studies' => [
                    'Legal Services',
                    'Corporate Law',
                    'Criminal Law',
                    'International Law',
                    'Human Rights Law',
                    'Legal Consulting'
                ],
                'Education & Teaching' => [
                    'Education',
                    'Primary Education',
                    'Secondary Education',
                    'Early Childhood Education',
                    'Educational Leadership',
                    'Special Education'
                ],
                'Creative Arts & Design' => [
                    'Graphic Design',
                    'UI/UX Design',
                    'Interior Design',
                    'Animation',
                    'Multimedia Design',
                    'Film & Video Production',
                    'Photography',
                    'Fashion & Textile',
                    'Fine Arts'
                ],
                'Hospitality & Tourism' => [
                    'Tourism',
                    'Hotel Management',
                    'Hospitality Management',
                    'Event Management',
                    'Travel & Tourism Management',
                    'Culinary Arts'
                ],
                'Agriculture & Environmental Studies' => [
                    'Agriculture & Agri-Business',
                    'Agricultural Technology',
                    'Food Science',
                    'Environmental Science',
                    'Forestry',
                    'Aquaculture'
                ],
                'Media & Communication' => [
                    'Journalism',
                    'Mass Communication',
                    'Digital Media',
                    'Public Relations',
                    'Advertising',
                    'Broadcasting'
                ],
                'Social Sciences & Humanities' => [
                    'Sociology',
                    'Political Science',
                    'International Relations',
                    'Philosophy',
                    'History',
                    'Languages & Linguistics'
                ],
                'Sports & Physical Education' => [
                    'Sports Science',
                    'Physical Education',
                    'Sports Coaching',
                    'Fitness Training'
                ]
            ];

            // ─────────────────────────────────────────────
            // 3. Alias Map — common user phrasings → exact DB values
            //    Keys must be lowercase (matched against strtolower input)
            // ─────────────────────────────────────────────
            $aliasMap = [
                // Cyber & IT
                'cybersecurity'              => 'Information Security',
                'cyber security'             => 'Information Security',
                'information security'       => 'Information Security',
                'hacking'                    => 'Information Security',
                'ethical hacking'            => 'Information Security',
                'networking'                 => 'IT Infrastructure',
                'network'                    => 'IT Infrastructure',
                'cloud computing'            => 'IT Infrastructure',
                'cloud'                      => 'IT Infrastructure',
                'it infrastructure'          => 'IT Infrastructure',
                'system admin'               => 'IT Infrastructure',
                'sysadmin'                   => 'IT Infrastructure',
                'network engineering'        => 'IT Infrastructure',
                'database administration'    => 'IT Infrastructure',

                // Software Engineering
                'software engineering'       => 'Software Engineering',
                'software developer'         => 'Software Engineering',
                'web development'            => 'Software Engineering',
                'web developer'              => 'Software Engineering',
                'mobile development'         => 'Software Engineering',
                'mobile app development'     => 'Software Engineering',
                'programming'                => 'Software Engineering',
                'devops engineering'         => 'Software Engineering',
                'game development'           => 'Software Engineering',

                // Data & AI
                'machine learning'           => 'Data Science',
                'deep learning'              => 'Data Science',
                'artificial intelligence'    => 'Data Science',
                'data science'               => 'Data Science',
                'data analyst'               => 'Data Science',
                'ai'                         => 'Data Science',
                'big data'                   => 'Data Science',

                // Business & Management
                'management'                 => 'Business Operations',
                'business operations'        => 'Business Operations',
                'business management'        => 'Business Operations',
                'entrepreneur'               => 'Business Operations',
                'entrepreneurship'           => 'Business Operations',
                'business admin'             => 'Business Operations',
                'project management'         => 'Business Operations',
                'international business'     => 'Business Operations',

                // Finance
                'accounting'                 => 'Finance',
                'finance'                    => 'Finance',
                'banking'                    => 'Finance',
                'investment'                 => 'Finance',

                // Marketing
                'marketing'                  => 'Marketing',
                'digital marketing'          => 'Marketing',
                'mass communication'         => 'Marketing',
                'digital media'              => 'Marketing',
                'public relations'           => 'Marketing',
                'advertising'                => 'Marketing',
                'broadcasting'               => 'Marketing',
                'journalism'                 => 'Marketing',

                // HR
                'hr'                         => 'Human Resources',
                'human resource'             => 'Human Resources',
                'human resources'            => 'Human Resources',

                // Supply Chain / Logistics
                'supply chain'               => 'Logistics',
                'supply chain management'    => 'Logistics',
                'logistics'                  => 'Logistics',

                // Civil Engineering
                'civil engineering'          => 'Civil Engineering',
                'civil'                      => 'Civil Engineering',
                'quantity survey'            => 'Civil Engineering',
                'quantity surveying'         => 'Civil Engineering',
                'construction management'    => 'Civil Engineering',

                // Mechanical Engineering
                'mechanical engineering'     => 'Mechanical Engineering',
                'mechanical'                 => 'Mechanical Engineering',
                'automobile'                 => 'Mechanical Engineering',
                'mechatronics'               => 'Mechanical Engineering',
                'electrical engineering'     => 'Mechanical Engineering',
                'electronic engineering'     => 'Mechanical Engineering',
                'mechatronics engineering'   => 'Mechanical Engineering',
                'automobile engineering'     => 'Mechanical Engineering',
                'industrial engineering'     => 'Mechanical Engineering',
                'robotics engineering'       => 'Mechanical Engineering',

                // Medicine & Health Sciences
                'medicine'                   => 'Healthcare - Medical',
                'doctor'                     => 'Healthcare - Medical',
                'medical'                    => 'Healthcare - Medical',
                'mbbs'                       => 'Healthcare - Medical',
                'pharmacy'                   => 'Healthcare - Medical',
                'medical laboratory science' => 'Healthcare - Medical',
                'public health'              => 'Healthcare - Medical',
                'physiotherapy'              => 'Healthcare - Medical',
                'nutrition & dietetics'      => 'Healthcare - Medical',
                'sports science'             => 'Healthcare - Medical',
                'fitness training'           => 'Healthcare - Medical',

                // Nursing
                'nursing'                    => 'Healthcare - Nursing',
                'nurse'                      => 'Healthcare - Nursing',

                // Psychology
                'psychology'                 => 'Psychology',
                'psychologist'               => 'Psychology',
                'counseling'                 => 'Psychology',
                'sociology'                  => 'Psychology',

                // Law
                'law'                        => 'Legal Services',
                'lawyer'                     => 'Legal Services',
                'attorney'                   => 'Legal Services',
                'legal'                      => 'Legal Services',
                'corporate law'              => 'Legal Services',
                'criminal law'               => 'Legal Services',
                'international law'          => 'Legal Services',
                'human rights law'           => 'Legal Services',
                'legal consulting'           => 'Legal Services',
                'political science'          => 'Legal Services',
                'international relations'    => 'Legal Services',

                // Education
                'teaching'                   => 'Education',
                'teacher'                    => 'Education',
                'education'                  => 'Education',
                'primary education'          => 'Education',
                'secondary education'        => 'Education',
                'early childhood education'  => 'Education',
                'educational leadership'     => 'Education',
                'special education'          => 'Education',
                'philosophy'                 => 'Education',
                'history'                    => 'Education',
                'languages & linguistics'    => 'Education',
                'physical education'         => 'Education',
                'sports coaching'            => 'Education',

                // Design / Creative Arts
                'graphic design'             => 'Design',
                'interior design'            => 'Design',
                'design'                     => 'Design',
                'ui/ux design'               => 'Design',
                'animation'                  => 'Design',
                'multimedia design'          => 'Design',
                'film & video production'    => 'Design',
                'photography'                => 'Design',
                'fine arts'                  => 'Design',

                // Architecture
                'architecture'               => 'Architecture',
                'architect'                  => 'Architecture',

                // Fashion
                'fashion'                    => 'Fashion & Textile',
                'textile'                    => 'Fashion & Textile',
                'fashion & textile'          => 'Fashion & Textile',

                // Hospitality & Tourism
                'tourism'                    => 'Tourism',
                'hotel'                      => 'Tourism',
                'hospitality_info'           => 'Tourism',
                'travel'                     => 'Tourism',
                'hotel management'           => 'Tourism',
                'hospitality management'     => 'Tourism',
                'event management'           => 'Tourism',
                'travel & tourism management'=> 'Tourism',
                'culinary arts'              => 'Tourism',

                // Agriculture & Environmental Studies
                'agriculture'                => 'Agriculture & Agri-Business',
                'agri'                       => 'Agriculture & Agri-Business',
                'farming'                    => 'Agriculture & Agri-Business',
                'agricultural technology'    => 'Agriculture & Agri-Business',
                'food science'               => 'Agriculture & Agri-Business',
                'environmental science'      => 'Agriculture & Agri-Business',
                'forestry'                   => 'Agriculture & Agri-Business',
                'aquaculture'                => 'Agriculture & Agri-Business',
            ];

            // ─────────────────────────────────────────────
            // 4. Extract Education Level (Robust Keyword Matching)
            // ─────────────────────────────────────────────
            $lowerInput = strtolower(trim($lastUserMessage));
            
            $quickReplyEduLevels = ['O/L Completed', 'A/L Completed', 'Diploma Holder', 'Undergraduate', 'Graduate'];
            if (in_array(trim($lastUserMessage), $quickReplyEduLevels)) {
                $currentProfile['education_level'] = trim($lastUserMessage);
            } else {
                $eduKeywords = [
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
                    'Technology & IT'                     => ['technology', 'tech', 'it', 'information technology', 'computing', 'computer'],
                    'Engineering & Architecture'          => ['engineering', 'engineer', 'architecture', 'architect'],
                    'Business & Management'               => ['business', 'management', 'commerce'],
                    'Medicine & Health Sciences'          => ['medicine', 'medical', 'health', 'healthcare'],
                    'Law & Legal Studies'                 => ['law', 'legal'],
                    'Education & Teaching'                => ['education', 'teaching', 'teacher', 'teach'],
                    'Creative Arts & Design'              => ['creative arts', 'arts', 'art', 'creative', 'design'],
                    'Hospitality & Tourism'               => ['hospitality', 'tourism', 'travel'],
                    'Agriculture & Environmental Studies' => ['agriculture', 'agri', 'farming', 'environment'],
                    'Media & Communication'               => ['media', 'communication', 'journalism'],
                    'Social Sciences & Humanities'        => ['social science', 'humanities'],
                    'Sports & Physical Education'         => ['sports', 'physical education', 'fitness'],
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
                    // Use word boundaries to prevent partial matches like 'ai' in 'hair'
                    if (preg_match("/\b" . preg_quote($alias, '/') . "\b/i", $lowerInput)) {
                        $currentProfile['interest'] = $realField;
                        // Resolve the correct main_field from dictionary, overriding Priority 1 if different
                        foreach ($fieldDictionary as $main => $subs) {
                            if (in_array($realField, $subs)) {
                                $currentProfile['main_field'] = $main;
                                break 2; // Break out of both loops
                            }
                        }
                        break; // If no break 2 happened, break out of aliasMap loop
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
            // 8. Hierarchical Flow (Education → Main Field → Sub-field)
            // ─────────────────────────────────────────────
            $edu       = $currentProfile['education_level'] ?? null;
            $mainField = $currentProfile['main_field']      ?? null;
            $subField  = $currentProfile['interest']        ?? null;

            Log::info("Flow Stage check", ['edu' => $edu, 'main' => $mainField, 'sub' => $subField]);

            $suggestedReplies = [];
            $questionToAsk    = "";

            // Stage 1: Education Level
            if (!$edu) {
                $questionToAsk    = "Hello! 👋 I'm EMY, your UniAds Career Advisor. To give you the best guidance, what is your current education level?";
                $suggestedReplies = ['O/L Completed', 'A/L Completed', 'Diploma Holder', 'Undergraduate', 'Graduate'];
            }
            // Stage 2: Main Field
            elseif (!$mainField) {
                $questionToAsk    = "Great! Which broad field interests you the most?";
                $suggestedReplies = array_keys($fieldDictionary);
            }
            // Stage 3: Sub-field
            elseif (!$subField) {
                $availableSubs = $fieldDictionary[$mainField] ?? [];

                $questionToAsk    = "Excellent choice! Which specific area of {$mainField} would you like to explore?";
                $suggestedReplies = $availableSubs;
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
            // 9. Education path restriction check
            // ─────────────────────────────────────────────
            $requiresAL = in_array($mainField, ['Engineering & Architecture', 'Medicine & Health Sciences', 'Law & Legal Studies']);
            $isOL       = ($edu === 'O/L Completed');

            if ($isOL && $requiresAL) {
                $currentProfile['extra_instruction'] =
                    "IMPORTANT: The student has only O/L. Explain clearly that {$mainField} typically requires A/L first. " .
                    "Then guide them on how to start with a Foundation or Diploma program as a stepping stone toward {$mainField}.";
            }

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

                // Fallback: LIKE search
                Log::warning("No direct match, trying LIKE search");
                return CareerGuidance::where('career_field', 'LIKE', "%{$currentProfile['interest']}%")
                    ->limit(5)
                    ->get();
            });

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
        $realPosts = Post::where('status', 'active')
            ->where(function ($q) use ($interest) {
                $q->where('title', 'LIKE', "%{$interest}%")
                    ->orWhere('course_name', 'LIKE', "%{$interest}%");
            })
            ->with('institute')
            ->orderBy('is_boosted', 'desc')
            ->limit(3)
            ->get();

        // Map posts for the frontend
        $mappedPosts = $realPosts->map(function ($post) {
            return [
                'id' => $post->id,
                'title' => $post->title ?? $post->course_name,
                'institute_name' => $post->institute->institute_name ?? 'UniAds Institute',
                'image' => $post->image ? url('storage/' . $post->image) : '/images/placeholders/course.jpg',
                'course_type' => $post->course_type,
                'description' => $post->small_description
            ];
        });

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
                "Recommended Course: {$m->recommended_degree_or_course}",
                "Certifications: {$m->certifications_or_extra_training}",
                "Entry Level Job: {$m->entry_level_job}",
                "Mid Level Job: {$m->mid_level_job}",
                "Senior Level Job: {$m->senior_level_job}",
                "Starting Salary: LKR {$m->average_starting_salary_lkr}",
                "Future Salary Range: LKR {$m->future_salary_range_lkr}",
                "Industry Growth in Sri Lanka: {$m->industry_growth_in_sri_lanka}",
            ]));
        })->join("\n\n---\n\n");

        // ── EMY Persona Prompt ───────────────────────────────────────────────
        $targetLang   = $currentProfile['language']          ?? 'English';
        $edu          = $currentProfile['education_level']   ?? 'Not specified';
        $interest     = $currentProfile['interest']          ?? 'Not specified';
        $studyPref    = $currentProfile['study_preference']  ?? 'Any';
        $extraRule    = $currentProfile['extra_instruction'] ?? '';

        $prompt = "You are EMY, a friendly and professional Sri Lankan career advisor working for the UniAds platform.

PERSONALITY: Friendly, Encouraging, Professional, Clear and structured, Supportive.
Always sound like a trusted Sri Lankan academic advisor helping a school student plan their future.

LANGUAGE RULE: Respond ONLY in {$targetLang}. Do NOT mix languages.

USER CONTEXT:
- Education Level: {$edu}
- Field of Interest: {$interest}
- Study Preference: {$studyPref}

SRI LANKAN EDUCATION RULES:
- Students with only O/L CANNOT directly enter professional degree programs in Engineering, Medicine, or Law.
- O/L students should start with Certificate / Diploma / Foundation programs.
- After completing a Diploma or A/L, students can enter Degree programs at private universities.
- Always respect these rules when recommending a path.

DATABASE CAREER DATA (use ONLY the information below — do NOT invent anything):
{$contextData}

YOUR TASK:
Create a clear, structured Career Roadmap using EXACTLY these headings:

## Career Path
## Recommended Courses
## Additional Certifications
## Career Progression
  - 🟢 Entry Level
  - 🔵 Mid Level
  - 🔴 Senior Level
## Salary Expectations (LKR)

STRICT RULES:
1. Output ONLY in {$targetLang}.
2. Use ONLY data from the DATABASE CAREER DATA above. Do NOT invent jobs, courses, or salaries.
3. If the career field is NOT in the database, do NOT create a roadmap — instead say UniAds has limited data for that field.
4. ALL salaries MUST be in LKR. Do not use USD or any other currency.
5. Keep the response under 200 words.
6. Be warm, encouraging, and motivating — this is a school student planning their future.
{$extraRule}";

        return $this->callGroq($prompt, $currentProfile, $mappedPosts);
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

            if ($response->successful()) {
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
                $status = $response->status();
                Log::error("Groq API Error ($status): " . $response->body());

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
