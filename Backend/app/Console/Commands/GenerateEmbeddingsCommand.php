<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\CareerGuidance;
use App\Models\Post;
use Illuminate\Support\Facades\Http;

class GenerateEmbeddingsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'ai:embed-data';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate and store semantic vector embeddings in ChromaDB for AI Assistant';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info("Starting embedding generation...");
        
        $chromaUrl = "http://chromadb:8000";

        // 1. Ensure combinations exist in ChromaDB
        $v2DbPath = "$chromaUrl/api/v2/tenants/default_tenant/databases/default_database";
        
        foreach(['career_guidance', 'posts'] as $collectionName) {
            // Delete if exists to handle potential dimension changes
            Http::delete("$v2DbPath/collections/$collectionName");
            Http::post("$v2DbPath/collections", [
                "name" => $collectionName
            ]);
        }

        // Get collection IDs
        $collections = Http::get("$v2DbPath/collections")->json();
        $cgCollectionId = collect($collections)->firstWhere('name', 'career_guidance')['id'] ?? null;
        $postsCollectionId = collect($collections)->firstWhere('name', 'posts')['id'] ?? null;

        if (!$cgCollectionId || !$postsCollectionId) {
            $this->error("Failed to create or retrieve ChromaDB collections.");
            return;
        }

        // 2. Process Career Guidance records
        $this->info("Processing CareerGuidance records...");
        $guidances = CareerGuidance::all();
        
        foreach ($guidances as $item) {
            $textToEmbed = "Career Field: {$item->career_field}. Recommended Course: {$item->recommended_degree_or_course}. Interests: {$item->stream_or_subject_interest}. Entry Career Goal: {$item->entry_level_job}. Mid Career: {$item->mid_level_job}. Senior Career: {$item->senior_level_job}.";
            
            $embedding = $this->getEmbedding($textToEmbed);
            
            if ($embedding) {
                // Upsert into ChromaDB
                Http::post("$v2DbPath/collections/$cgCollectionId/upsert", [
                    "ids" => ["cg_{$item->id}"],
                    "embeddings" => [$embedding],
                    "metadatas" => [["id" => $item->id, "type" => "career_guidance", "text" => $textToEmbed]],
                    "documents" => [$textToEmbed]
                ]);
                $this->line(" embedded: {$item->career_field}");
            }
        }

        // 3. Process Premium Posts
        $this->info("Processing Premium Active Posts...");
        $posts = Post::query()
            ->join('institutes', 'posts.institute_id', '=', 'institutes.id')
            ->where('institutes.is_premium', 1)
            ->where('posts.status', 'active')
            ->select('posts.*')
            ->get();

        foreach ($posts as $post) {
            $textToEmbed = "Post Title: {$post->title}. Description: {$post->description}. Requirements: {$post->requirements}";
            
            $embedding = $this->getEmbedding($textToEmbed);
            
            if ($embedding) {
                Http::post("$chromaUrl/api/v2/collections/$postsCollectionId/upsert", [
                    "ids" => ["post_{$post->id}"],
                    "embeddings" => [$embedding],
                    "metadatas" => [["id" => $post->id, "type" => "post", "title" => $post->title]],
                    "documents" => [$textToEmbed]
                ]);
                $this->line(" embedded post: {$post->title}");
            }
        }

        $this->info("Finished embedding all data!");
    }

    private function getEmbedding($text)
    {
        $apiKey = env('GEMINI_API_KEY');
        $url = "https://generativelanguage.googleapis.com/v1/models/gemini-embedding-001:embedContent?key=" . $apiKey;

        try {
            $response = Http::post($url, [
                "content" => [
                    "parts" => [
                        ["text" => $text]
                    ]
                ],
                "taskType" => "RETRIEVAL_DOCUMENT"
            ]);

            if ($response->successful()) {
                return $response->json('embedding.values');
            } else {
                $this->error("Gemini Embedding Error Code: " . $response->status());
                file_put_contents(storage_path('logs/gemini_error.json'), $response->body());
                $this->error("Error body saved to storage/logs/gemini_error.json");
            }
        } catch (\Exception $e) {
            $this->error("Failed to connect to Gemini API: " . $e->getMessage());
        }
        return null;
    }
}
