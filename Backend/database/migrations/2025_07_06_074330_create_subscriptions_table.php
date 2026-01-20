<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('institute_id');
            $table->string('gateway_subscription_id')->nullable(); // Stripe or other gateway ID
            $table->enum('plan', ['monthly', 'annual', 'trial']);
            $table->boolean('is_trial')->default(false);
            $table->enum('status', ['active', 'cancelled', 'expired'])->default('active');
            $table->date('started_at');
            $table->date('ends_at');
            $table->date('cancelled_at')->nullable();
            $table->timestamps();

            $table->foreign('institute_id')->references('id')->on('institutes')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};

