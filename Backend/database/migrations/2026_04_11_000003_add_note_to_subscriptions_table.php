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
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->text('note')->nullable()->after('cancel_reason');
        });

        // Migrate existing "Admin manual grant" notes from cancel_reason to note
        \Illuminate\Support\Facades\DB::table('subscriptions')
            ->where('cancel_reason', 'like', 'Admin manual grant:%')
            ->update([
                'note' => \Illuminate\Support\Facades\DB::raw('cancel_reason'),
                'cancel_reason' => null
            ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->dropColumn('note');
        });
    }
};
