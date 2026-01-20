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
    Schema::create('followers', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('user_id'); // Follower
        $table->unsignedBigInteger('institute_id'); // Followed
        $table->timestamps();

        $table->unique(['user_id', 'institute_id']);

        $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        $table->foreign('institute_id')->references('id')->on('institutes')->onDelete('cascade');
    });
}


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('followers');
    }
};
