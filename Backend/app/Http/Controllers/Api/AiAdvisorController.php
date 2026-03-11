<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\CareerGuidance;
use Illuminate\Support\Facades\Http;

class AiAdvisorController extends Controller
{
    public function recommend(Request $request)
    {
        $validated = $request->validate([
            'messages' => 'required|array',
            'profile' => 'nullable|array',
        ]);

        $messages = $validated['messages'];
        $currentProfile = $validated['profile'] ?? [
            'education_level' => null,
            'stream' => null,
            'interest' => null,
            'career_goal' => null,
            'study_preference' => null
        ];

        // 1. Extraction Step: Ask Ollama to update the profile based on the latest message
        $lastUserMessage = end($messages)['content'];
        $extractionPrompt = "You are a data extraction assistant. Based on the following conversation history (which may be in English, Sinhala, or Tamil), extract or update the user profile JSON. 
        Current Profile: " . json_encode($currentProfile) . "
        Last message: \"$lastUserMessage\"
        
        Return ONLY a valid JSON object with these keys: education_level, stream, interest, career_goal, study_preference. 
        If a piece of information is missing, use null. Translate the values to English for the JSON fields. Do not include any other text.";

        $ollamaUrl = "http://ollama:11434/api/generate";
        
        try {
            $extractResponse = Http::timeout(300)->post($ollamaUrl, [
                "model" => "llama3.2:1b",
                "prompt" => $extractionPrompt,
                "stream" => false,
                "format" => "json"
            ]);

            if ($extractResponse->successful()) {
                $newProfile = json_decode($extractResponse->json('response'), true);
                if ($newProfile) {
                    $currentProfile = array_merge($currentProfile, array_filter($newProfile));
                }
            }
        } catch (\Exception $e) {
            // Fallback: keep current profile if extraction fails
        }

        // 2. Decide: Is the profile complete enough for a database recommendation?
        // We need at least Education, Interest, and Goal to give a good roadmap.
        $isComplete = !empty($currentProfile['education_level']) && 
                     !empty($currentProfile['interest']) && 
                     !empty($currentProfile['career_goal']);

        if (!$isComplete) {
            // Ask for missing info naturally
            $missing = [];
            if (empty($currentProfile['education_level'])) $missing[] = "current education level (O/L, A/L, etc.)";
            if (empty($currentProfile['interest'])) $missing[] = "field of interest (IT, Business, etc.)";
            if (empty($currentProfile['career_goal'])) $missing[] = "dream career goal";
            
            $prompt = "You are EMY, the UniAds Career Advisor. The user just said: \"$lastUserMessage\". 
            You need to learn their " . implode(", ", $missing) . " to give them a career roadmap. 
            Detect the language used by the user (English, Sinhala, or Tamil) and respond NATURALLY and warmly in that SAME language.
            Respond to their last message, then ask for one of the missing pieces of information. 
            Keep it short and friendly. Use Markdown.";

            return $this->callOllama($prompt, $currentProfile);
        }

        // 3. Retrieval Step: Query DB based on extracted profile
        $query = CareerGuidance::query();
        $interestMapping = [
            'Software & IT' => ['IT', 'Data Science', 'Cybersecurity', 'Programming', 'Software'],
            'Business & Marketing' => ['Business', 'Marketing', 'Accounting', 'HR', 'Finance'],
            'Engineering' => ['Engineering', 'Mechanical Engineering', 'Electrical Engineering'],
            'Healthcare' => ['Medicine', 'Healthcare', 'Nursing'],
            'Design & Media' => ['Graphic Design', 'Architecture', 'Media'],
            'Finance' => ['Accounting', 'Finance']
        ];
        
        $interestKey = $currentProfile['interest'];
        $mappedInterests = $interestMapping[$interestKey] ?? [$interestKey];
        $userGoal = $currentProfile['career_goal'];

        $query->where(function($q) use ($mappedInterests, $userGoal) {
            foreach ($mappedInterests as $mapped) {
                $q->orWhere('career_field', 'LIKE', '%' . $mapped . '%')
                  ->orWhere('stream_or_subject_interest', 'LIKE', '%' . $mapped . '%');
            }
            $q->orWhere('entry_level_job', 'LIKE', '%' . $userGoal . '%')
              ->orWhere('mid_level_job', 'LIKE', '%' . $userGoal . '%')
              ->orWhere('senior_level_job', 'LIKE', '%' . $userGoal . '%');
        });

        $matches = $query->limit(10)->get();
        if ($matches->isEmpty()) {
            $matches = CareerGuidance::where('education_level', 'LIKE', '%' . $currentProfile['education_level'] . '%')
                                     ->inRandomOrder()->limit(5)->get();
        }

        $contextData = $matches->map(function($m) {
            return "Type: " . (stripos($m->recommended_degree_or_course, 'BSc') !== false || stripos($m->recommended_degree_or_course, 'BA') !== false ? 'Degree' : 'Diploma/Cert') . "\n" .
                   "Source Course: {$m->recommended_degree_or_course}\n" .
                   "Relevant Certifications: {$m->certifications_or_extra_training}\n" .
                   "Role/Field: {$m->career_field}\n" .
                   "Progression: {$m->entry_level_job} -> {$m->mid_level_job} -> {$m->senior_level_job}\n" .
                   "Salary in LK: {$m->average_starting_salary_lkr} up to {$m->future_salary_range_lkr}";
        })->join("\n\n---\n\n");

        // 4. Generation Step: Build the final Roadmap response
        $prompt = "You are EMY, the UniAds Career Advisor.
        User Profile: " . json_encode($currentProfile) . "
        
        EXACT data from our database:
        {$contextData}
        
        Detect the language used in the last user message: \"$lastUserMessage\".
        Provide the final career roadmap response in that SAME language (English, Sinhala, or Tamil).
        
        Based ONLY on the provided EXACT data, provide a warm career roadmap in Markdown.
        
        # Course Recommendations
        Suggest 1 to 5 suitable courses. Try to provide a mix of Degrees, Diplomas, and Professional Certifications if available in the EXACT data.
        For each, explain briefly why it fits.

        # Career Path
        Provide a step-by-step career progression from entry to senior level based on the EXACT data.

        # Industry Trends
        Explain the growth in Sri Lanka and globally based on the EXACT data.";

        // 5. NEW: Fetch Real site posts (Premium only) matching user interests
        $realPosts = \App\Models\Post::query()
            ->join('institutes', 'posts.institute_id', '=', 'institutes.id')
            ->where('institutes.is_premium', 1)
            ->where('posts.status', 'active')
            ->where(function($q) use ($mappedInterests, $userGoal) {
                foreach ($mappedInterests as $mapped) {
                    $q->orWhere('posts.title', 'LIKE', '%' . $mapped . '%')
                      ->orWhere('posts.description', 'LIKE', '%' . $mapped . '%');
                }
                $q->orWhere('posts.title', 'LIKE', '%' . $userGoal . '%');
            })
            ->select('posts.*', 'institutes.institute_name', 'institutes.is_premium', 'institutes.premium_expires_at')
            ->inRandomOrder()
            ->limit(3)
            ->get();

        return $this->callOllama($prompt, $currentProfile, $realPosts);
    }

    public function getSavedRoadmaps(Request $request)
    {
        $roadmaps = $request->user()->savedRoadmaps()->latest()->get();
        return response()->json($roadmaps);
    }

    public function saveRoadmap(Request $request)
    {
        $request->validate([
            'career_goal' => 'nullable|string',
            'recommendation_text' => 'required|string',
            'real_posts' => 'nullable|array'
        ]);

        $roadmap = $request->user()->savedRoadmaps()->create([
            'career_goal' => $request->career_goal,
            'recommendation_text' => $request->recommendation_text,
            'real_posts_json' => $request->real_posts
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Roadmap saved to profile!',
            'roadmap' => $roadmap
        ]);
    }

    public function deleteRoadmap(Request $request, $id)
    {
        $roadmap = $request->user()->savedRoadmaps()->findOrFail($id);
        $roadmap->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Roadmap deleted.'
        ]);
    }

    private function callOllama($prompt, $profile, $realPosts = [])
    {
        $ollamaUrl = "http://ollama:11434/api/generate";
        
        try {
            $response = Http::timeout(300)->post($ollamaUrl, [
                "model" => "llama3.2",
                "prompt" => $prompt,
                "stream" => false
            ]);

            if ($response->successful()) {
                return response()->json([
                    'status' => 'success',
                    'recommendation' => $response->json('response'),
                    'profile' => $profile,
                    'real_posts' => $realPosts
                ]);
            }
        } catch (\Exception $e) {
            return response()->json(['error' => 'AI generation failed'], 500);
        }

        return response()->json(['error' => 'AI generation failed'], 500);
    }
}
