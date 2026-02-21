<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    $admins = \App\Models\User::where('role', 'Admin')->get();
    echo "Found " . $admins->count() . " admins with role 'Admin'.\n";

    if ($admins->count() > 0) {
        $admin = $admins->first();
        \App\Models\Notification::create([
            'user_id' => $admin->id,
            'institute_id' => null,
            'type' => 'test',
            'title' => 'test',
            'message' => 'test',
            'data' => []
        ]);
        echo "Successfully created notification!\n";
    } else {
        $admins2 = \App\Models\User::whereRaw('LOWER(role) = ?', ['admin'])->get();
        echo "Found " . $admins2->count() . " admins with case insensitive check. roles are: " . implode(', ', $admins2->pluck('role')->toArray()) . "\n";
    }
} catch (\Exception $e) {
    echo "Error inserting: " . $e->getMessage() . "\n";
}
