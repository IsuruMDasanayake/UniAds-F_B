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
        Schema::create('institute_inquiries', function (Blueprint $row) {
            $row->id();
            $row->foreignId('institute_id')->constrained()->onDelete('cascade');
            $row->string('name');
            $row->string('email');
            $row->string('subject');
            $row->text('message');
            $row->string('status')->default('new'); // new, viewed, contacted
            $row->timestamp('viewed_at')->nullable();
            $row->timestamp('contacted_at')->nullable();
            $row->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('institute_inquiries');
    }
};
