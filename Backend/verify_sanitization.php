<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Post;
use Mews\Purifier\Facades\Purifier;

$maliciousInput = "<script>alert('xss')</script><b>Safe Title</b><img src=x onerror=alert(1)>";
$sanitized = Purifier::clean($maliciousInput);

echo "Original: $maliciousInput\n";
echo "Sanitized: $sanitized\n";

if (strpos($sanitized, '<script>') === false && strpos($sanitized, 'onerror') === false) {
    echo "SUCCESS: Malicious tags stripped.\n";
} else {
    echo "FAILURE: Malicious tags remain!\n";
}
