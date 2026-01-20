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
        Schema::create('refund_policy', function (Blueprint $table) {
            $table->id();
            $table->string('title'); // e.g., "Introduction", "Information We Collect"
            $table->longText('content'); // detailed text
            $table->integer('order_index')->default(0); // to keep correct order
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('refund_policy');
    }
};
