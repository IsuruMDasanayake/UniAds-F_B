<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->boot();

use App\Models\Institute;
use App\Models\Follower;
use App\Models\Rating;

$targetProfileViews = 32;

$institutes = Institute::where('profile_views', $targetProfileViews)->get();

echo "Institutes with $targetProfileViews profile views:\n";
foreach ($institutes as $inst) {
    $fCount = Follower::where('institute_id', $inst->id)->count();
    $rCount = Rating::where('institute_id', $inst->id)->count();
    echo "ID: {$inst->id} | Name: {$inst->institute_name} | Followers: $fCount | Ratings: $rCount\n";
}

if ($institutes->isEmpty()) {
    echo "No institute found with $targetProfileViews views. Listing some recent ones:\n";
    foreach (Institute::latest()->take(5)->get() as $inst) {
        $fCount = Follower::where('institute_id', $inst->id)->count();
        echo "ID: {$inst->id} | Views: {$inst->profile_views} | Followers: $fCount\n";
    }
}
