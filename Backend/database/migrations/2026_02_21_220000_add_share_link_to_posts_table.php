<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            $table->string('share_link')->unique()->nullable()->after('status');
        });

        // Backfill share_link for existing posts
        DB::table('posts')->whereNull('share_link')->orderBy('id')->each(function ($post) {
            DB::table('posts')
                ->where('id', $post->id)
                ->update(['share_link' => (string) Str::uuid()]);
        });
    }

    public function down(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            $table->dropColumn('share_link');
        });
    }
};
