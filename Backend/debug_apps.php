<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\ApplyCase;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

$userId = 8;
$user = User::find($userId);
if ($user) {
    Auth::login($user);
    $apps = ApplyCase::with(['institute', 'post'])
        ->where('user_id', $userId)
        ->get();
    
    echo "Found " . $apps->count() . " applications for user 8.\n";
    foreach ($apps as $app) {
        echo "ID: " . $app->id . " Status: " . $app->status . " Institute: " . ($app->institute->institute_name ?? 'N/A') . "\n";
    }
} else {
    echo "User 8 not found.\n";
}
