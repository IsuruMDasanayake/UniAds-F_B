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
    Schema::create('institutes', function (Blueprint $table) {
        $table->id();
        $table->string('institute_name');
        $table->string('location');
        $table->string('email')->unique();
        $table->string('contact_number');
        $table->string('gov_register_number'); // Added government registration number
        $table->string('profile_photo')->nullable(); // Added profile photo
        $table->string('cover_photo')->nullable();
        $table->string('bio')->nullable();  // Added bio
        $table->string('password'); // Add password field (required for login)
        $table->timestamps();
    });
    
    
    
}


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('institutes');
    }
};