<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$institutes = \App\Models\Institute::where('status', 'approved')->get();
file_put_contents('dump_insts.json', $institutes->toJson(JSON_PRETTY_PRINT));
echo "Dumped " . $institutes->count() . " institutes to dump_insts.json\n";
