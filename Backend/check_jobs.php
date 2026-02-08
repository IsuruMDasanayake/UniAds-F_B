<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();
echo "Jobs: " . \DB::table('jobs')->count() . "\n";
try {
    echo "Failed Jobs: " . \DB::table('failed_jobs')->count() . "\n";
} catch (\Exception $e) {
    echo "Failed Jobs Table Error: " . $e->getMessage() . "\n";
}
