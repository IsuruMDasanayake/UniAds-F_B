<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
{
    Schema::create('about_sections', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('institute_id');  // Adding institute_id column
        $table->foreign('institute_id')->references('id')->on('institutes')->onDelete('cascade');  // Adding foreign key constraint

        // Fields
        $table->text('institute_overview')->nullable();
        $table->text('mission')->nullable();
        $table->text('vision')->nullable();
        $table->text('history')->nullable();
        $table->text('chancellor_intro')->nullable();
        $table->string('chancellor_photo')->nullable();
        $table->text('vice_chancellor_intro')->nullable();
        $table->string('vice_chancellor_photo')->nullable();
        $table->text('academic_excellence')->nullable();
        $table->json('academic_images')->nullable();
        $table->text('programs_offered')->nullable();
        $table->json('programs_images')->nullable();
        $table->text('global_partnerships')->nullable();
        $table->json('partnerships_images')->nullable();
        $table->text('life_at_institute')->nullable();
        $table->json('life_images')->nullable();
        $table->text('sports_recreation')->nullable();
        $table->json('sports_images')->nullable();
        $table->text('upcoming_programs')->nullable();
        $table->json('upcoming_images')->nullable();
        $table->json('campus_images')->nullable();
        $table->timestamps();
    });
}

public function down()
{
    Schema::dropIfExists('about_sections');
}

};
