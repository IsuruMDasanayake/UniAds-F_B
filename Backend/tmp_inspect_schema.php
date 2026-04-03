<?php

require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

$res = DB::select("SHOW CREATE TABLE subscriptions");
$create = $res[0]->{'Create Table'};

$cols = DB::select("DESC subscriptions");
$desc_out = "";
foreach($cols as $c) {
    if ($c->Field == 'cancelled_at') {
        $desc_out = "DESC: {$c->Field}: {$c->Type} (Null: {$c->Null}, Default: ".(is_null($c->Default) ? 'NULL' : $c->Default).", Extra: {$c->Extra})\n";
    }
}

file_put_contents('schema_debug.txt', "CREATE:\n" . $create . "\n\n" . $desc_out);
echo "Debug info written to schema_debug.txt\n";
