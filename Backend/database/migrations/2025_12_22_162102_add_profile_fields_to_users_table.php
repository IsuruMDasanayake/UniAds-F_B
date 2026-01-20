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
        Schema::table('users', function (Blueprint $table) {
            $table->enum('gender', ['Male', 'Female'])->nullable()->after('name');
            $table->date('birthday')->nullable()->after('gender');
            $table->string('district')->nullable()->after('birthday');
            $table->string('education_level')->nullable()->after('district');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['gender', 'birthday', 'district', 'education_level']);
        });
    }
};
