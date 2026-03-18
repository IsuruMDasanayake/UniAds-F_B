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
        Schema::table('career_guidances', function (Blueprint $table) {
            $table->text('postgrad_path')->nullable()->after('recommended_first_step');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('career_guidances', function (Blueprint $table) {
            $table->dropColumn('postgrad_path');
        });
    }
};
