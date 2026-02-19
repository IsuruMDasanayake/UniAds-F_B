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
        Schema::create('contacted_emails', function (Blueprint $table) {
            $table->id();
            $table->foreignId('apply_case_id')->constrained('apply_cases')->onDelete('cascade');
            $table->foreignId('institute_id')->constrained('institutes')->onDelete('cascade');
            $table->string('student_email');
            $table->string('subject');
            $table->text('message');
            $table->timestamp('sent_at')->useCurrent();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contacted_emails');
    }
};
