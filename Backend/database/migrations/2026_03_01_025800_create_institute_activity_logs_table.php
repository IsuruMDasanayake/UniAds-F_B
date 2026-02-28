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
        Schema::create('institute_activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('institute_id')->constrained('institutes')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade'); // The specific user (admin/staff) who did the action
            $table->string('action_type'); // e.g., 'Post Created', 'Event Edited'
            $table->text('description'); // e.g., 'Edited Post: Summer Intake 2026'
            $table->string('category')->default('General'); // Content, Application, Account, Subscription
            $table->string('subject_type')->nullable(); // Optional: link to model
            $table->unsignedBigInteger('subject_id')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('institute_activity_logs');
    }
};
