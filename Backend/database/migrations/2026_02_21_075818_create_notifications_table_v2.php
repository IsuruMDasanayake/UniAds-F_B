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
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->unsignedBigInteger('institute_id')->nullable();

            $table->string('type', 50);
            $table->string('title', 255);
            $table->text('message');

            $table->json('data')->nullable();

            $table->boolean('is_read')->default(false);

            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('read_at')->nullable();

            // Indexes
            $table->index('institute_id');
            $table->index('is_read');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
