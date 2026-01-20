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
        Schema::create('institute_profile_views', function (Blueprint $table) {
        $table->id();
        $table->foreignId('institute_id')->constrained()->onDelete('cascade');
        $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade'); // optional
        $table->string('ip_address')->nullable(); // for guest tracking
        $table->timestamp('viewed_at')->useCurrent();
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('institute_profile_views');
    }
};
