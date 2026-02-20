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
        Schema::table('institutes', function (Blueprint $table) {
            $table->enum('institute_type', [
                'University',
                'Higher Education Institute',
                'College',
                'Institute',
                'Training Center',
                'Vocational Training Center',
                'Technical Institute',
                'Professional Institute',
                'Academy',
                'Government Institute',
                'International Institute'
            ])->after('institute_name')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('institutes', function (Blueprint $table) {
            $table->dropColumn('institute_type');
        });
    }
};
