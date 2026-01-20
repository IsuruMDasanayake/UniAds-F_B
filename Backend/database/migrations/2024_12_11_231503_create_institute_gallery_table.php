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
    Schema::create('institute_gallery', function (Blueprint $table) {
        $table->id();
        $table->unsignedBigInteger('institute_id');
        $table->string('image_path');
        $table->timestamps();

        $table->foreign('institute_id')->references('id')->on('institutes')->onDelete('cascade');
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('institute_gallery');
    }
};
