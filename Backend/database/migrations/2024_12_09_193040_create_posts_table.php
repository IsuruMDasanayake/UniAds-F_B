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
        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('institute_id')->nullable();
            $table->string('title');
            $table->text('description');
            $table->string('small_description');
            $table->string('image');
            $table->string('course_name');
            $table->string('course_type');
            $table->string('location');
            $table->string('duration');
            $table->string('course_format');
            $table->string('attendance_type');
            $table->timestamps();

            // Add foreign key constraint
            $table->foreign('institute_id')
                ->references('id')
                ->on('institutes')
                ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('posts');
    }

    
};

