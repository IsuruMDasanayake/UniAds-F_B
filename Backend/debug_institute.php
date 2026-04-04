<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$institute = \App\Models\Institute::where('email', 'abc@gmail.com')->first();
if ($institute) {
    echo "ID: " . $institute->id . "\n";
    echo "Name: " . $institute->institute_name . "\n";
    echo "Is Premium: " . ($institute->is_premium ? 'YES' : 'NO') . " (Raw: " . $institute->getRawOriginal('is_premium') . ")\n";
    echo "Premium Expires At: " . ($institute->premium_expires_at ? $institute->premium_expires_at->toDateTimeString() : 'NULL') . "\n";
    echo "Now (UTC): " . now()->toDateTimeString() . "\n";
    echo "Now (Local): " . now()->setTimezone('Asia/Colombo')->toDateTimeString() . "\n";
    echo "Is Future: " . ($institute->premium_expires_at && $institute->premium_expires_at->isFuture() ? 'YES' : 'NO') . "\n";
} else {
    echo "Institute not found with email abc@gmail.com\n";
}
