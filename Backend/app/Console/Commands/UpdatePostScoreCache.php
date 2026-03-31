<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Post;

class UpdatePostScoreCache extends Command
{
    protected $signature = 'posts:update-score';
    protected $description = 'Pre-computes and caches the static ranking score for active posts.';

    public function handle()
    {
        $this->info("Updating post scores...");

        Post::with('institute')
            ->where('status', 'active')
            ->chunk(500, function ($posts) {
                foreach ($posts as $post) {
                    /** @var \App\Models\Post $post */
                    if (!$post->institute) {
                        continue;
                    }

                    $score = $post->calculateScore();

                    $post->score_cache = $score;
                    $post->save();
                }
            });

        $this->info("Post scores updated successfully!");
    }
}
