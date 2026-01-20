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
        Schema::create('ratings', function (Blueprint $table) {
    $table->id();
    $table->unsignedBigInteger('user_id');
    $table->unsignedBigInteger('institute_id');
    $table->unsignedTinyInteger('rating'); // 1 to 5
    $table->text('comment')->nullable();
    $table->timestamps();

    $table->unique(['user_id', 'institute_id']); // prevent duplicates
    $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
    $table->foreign('institute_id')->references('id')->on('institutes')->onDelete('cascade');
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ratings');
    }
};
