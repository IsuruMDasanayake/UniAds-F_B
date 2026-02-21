<?php

require 'vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\AdminNotification;

$admins = User::where('role', 'Admin')->get();

foreach ($admins as $admin) {
    echo "Creating admin notification for user_id: " . $admin->id . "\n";
    $notif = AdminNotification::create([
        'user_id' => $admin->id,
        'type' => 'test',
        'title' => 'test admin notif',
        'message' => 'test admin message',
        'data' => [
            'test_key' => 'test_value'
        ]
    ]);
    echo "Created notification with ID: " . $notif->id . "\n";
}

echo "Done.\n";
