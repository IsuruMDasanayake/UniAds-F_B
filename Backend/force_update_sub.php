<?php

require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

try {
    echo "Updating ID 1...\n";
    $affected = DB::table('subscriptions')->where('id', 1)->update(['cancelled_at' => null]);
    echo "Rows affected: " . $affected . "\n";
    
    $row = DB::table('subscriptions')->where('id', 1)->first();
    echo "Current value: " . ($row->cancelled_at ?? 'NULL') . "\n";
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
}
