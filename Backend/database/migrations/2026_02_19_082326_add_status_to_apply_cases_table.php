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
        Schema::table('apply_cases', function (Blueprint $table) {
            $table->enum('status', ['new', 'viewed', 'contacted'])->default('new')->after('post_id');
            $table->string('student_name')->nullable()->after('status');
            $table->string('student_email')->nullable()->after('student_name');
            $table->string('student_phone', 20)->nullable()->after('student_email');
            $table->text('message')->nullable()->after('student_phone');
            $table->timestamp('viewed_at')->nullable()->after('message');
            $table->timestamp('contacted_at')->nullable()->after('viewed_at');

            // Add indexes for performance
            $table->index('institute_id');
            $table->index('status');
            $table->index('applied_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('apply_cases', function (Blueprint $table) {
            $table->dropIndex(['institute_id']);
            $table->dropIndex(['status']);
            $table->dropIndex(['applied_at']);

            $table->dropColumn([
                'status',
                'student_name',
                'student_email',
                'student_phone',
                'message',
                'viewed_at',
                'contacted_at'
            ]);
        });
    }
};
