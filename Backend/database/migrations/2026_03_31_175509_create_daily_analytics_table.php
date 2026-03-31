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
        Schema::create('daily_analytics', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('institute_id');
            $table->date('date');
            
            $table->integer('profile_views')->default(0);
            $table->integer('post_views')->default(0);
            $table->integer('new_followers')->default(0);
            $table->integer('inquiries_received')->default(0);
            
            $table->timestamps();
            
            $table->unique(['institute_id', 'date']);
            $table->index('date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('daily_analytics');
    }
};
