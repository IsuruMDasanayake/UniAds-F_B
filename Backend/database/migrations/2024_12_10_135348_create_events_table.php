<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateEventsTable extends Migration
{
    public function up()
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->string('event_title');
            $table->text('event_description');
            $table->string('event_image');
            $table->date('event_date');
            $table->string('main_location');
            $table->text('sub_location');
            $table->foreignId('institute_id')->constrained('institutes')->onDelete('cascade'); // Assumes you have an institutes table
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('events');
    }
}
