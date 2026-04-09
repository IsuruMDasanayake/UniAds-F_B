<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('post_locations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('post_id');
            $table->string('location', 100);
            
            $table->unique(['post_id', 'location']);
            $table->index('location');
            $table->foreign('post_id')->references('id')->on('posts')->onDelete('cascade');
        });

        // Migrate existing comma-separated locations to pivot table
        $posts = \Illuminate\Support\Facades\DB::table('posts')->whereNotNull('location')->where('location', '!=', '')->select('id', 'location')->get();
        $inserts = [];
        
        foreach ($posts as $post) {
            $locations = array_filter(array_map('trim', explode(',', $post->location)));
            foreach ($locations as $loc) {
                if (!empty($loc)) {
                    $normLoc = strtolower($loc);
                    $inserts[] = [
                        'post_id' => $post->id,
                        'location' => substr($normLoc, 0, 100),
                    ];
                }
            }
        }
        
        if (!empty($inserts)) {
            $inserts = collect($inserts)->unique(function ($item) { return $item['post_id'].'-'.$item['location']; })->values()->toArray();
            \Illuminate\Support\Facades\DB::table('post_locations')->insertOrIgnore($inserts);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('post_locations');
    }
};
