<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class PopulateInstituteSlugs extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'institutes:populate-slugs';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Populate slugs for existing institutes';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $institutes = \App\Models\Institute::whereNull('slug')->get();
        $count = 0;

        foreach ($institutes as $institute) {
            $baseSlug = \Illuminate\Support\Str::slug($institute->institute_name);
            $slug = $baseSlug;
            $counter = 1;

            while (\App\Models\Institute::where('slug', $slug)->where('id', '!=', $institute->id)->exists()) {
                $slug = $baseSlug . '-' . $counter;
                $counter++;
            }

            $institute->slug = $slug;
            $institute->save();
            $count++;
            $this->info("Updated slug for: {$institute->institute_name} -> {$slug}");
        }

        $this->info("Completed! Updated {$count} institutes.");
    }
}
