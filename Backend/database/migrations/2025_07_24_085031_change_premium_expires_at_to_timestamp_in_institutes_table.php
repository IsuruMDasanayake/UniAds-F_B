<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class ChangePremiumExpiresAtToTimestampInInstitutesTable extends Migration
{
    public function up()
    {
        Schema::table('institutes', function (Blueprint $table) {
            $table->timestamp('premium_expires_at')->nullable()->change();
        });
    }

    public function down()
    {
        Schema::table('institutes', function (Blueprint $table) {
            $table->date('premium_expires_at')->nullable()->change();
        });
    }
}

