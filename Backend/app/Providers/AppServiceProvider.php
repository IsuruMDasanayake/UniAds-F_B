<?php

namespace App\Providers;

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\View;
use App\Models\Institute;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
{
    // 1️⃣ Auto-run migrations FIRST (Render Free fix)
    if (app()->environment('production')) {
        try {
            if (!Schema::hasTable('migrations')) {
                Artisan::call('migrate', ['--force' => true]);
            }
        } catch (\Throwable $e) {
            Log::error('Auto-migration failed: ' . $e->getMessage());
        }
    }

    // 2️⃣ Share institutes ONLY if table exists
    View::composer('*', function ($view) {
        if (Schema::hasTable('institutes')) {
            $institutes = \App\Models\Institute::where('status', 'approved')->get();
            $view->with('institutes', $institutes);
        } else {
            $view->with('institutes', collect());
        }
    });

    // 3️⃣ Register Observers
    \App\Models\Institute::observe(\App\Observers\InstituteObserver::class);
}

}
