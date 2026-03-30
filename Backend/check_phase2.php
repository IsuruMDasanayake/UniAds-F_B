<?php

use App\Services\ImageOptimiser;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use App\Models\Post;

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "--- PHASE 2 RE-CHECK ---\n";

// 1. Check Image Optimization
echo "Image Optimizer Check:\n";
try {
    // Create a dummy image
    $tempFile = tempnam(sys_get_temp_dir(), 'test_image');
    $img = imagecreatetruecolor(2000, 2000); // Larger than 1200px
    imagefill($img, 0, 0, imagecolorallocate($img, 255, 0, 0));
    imagejpeg($img, $tempFile);
    imagedestroy($img);

    $originalSize = filesize($tempFile);
    $uploadedFile = new UploadedFile($tempFile, 'test.jpg', 'image/jpeg', null, true);

    echo "  Original size: " . round($originalSize / 1024, 2) . " KB\n";

    // Run Optimizer
    $path = ImageOptimiser::store($uploadedFile, 'test_optimise');
    
    $fullPath = Storage::disk('public')->path($path);
    $newSize = filesize($fullPath);

    echo "  Optimized Path: $path\n";
    echo "  Optimized size: " . round($newSize / 1024, 2) . " KB\n";

    // Verify properties
    $info = getimagesize($fullPath);
    echo "  Optimized Width: {$info[0]}px\n";
    echo "  Mime Type: {$info['mime']}\n";

    if ($info[0] <= 1200 && $info['mime'] === 'image/webp') {
        echo "  RESULT: PASS\n";
    } else {
        echo "  RESULT: FAIL (Check constraints)\n";
    }

    // Cleanup
    Storage::disk('public')->delete($path);
    unlink($tempFile);
} catch (\Exception $e) {
    echo "  Image Optimizer ERROR: " . $e->getMessage() . "\n";
}

// 2. Check API Response Trait on a Controller
echo "API Response Trait Check:\n";
try {
    $controller = new \App\Http\Controllers\PostController();
    $reflect = new \ReflectionClass($controller);
    if ($reflect->hasMethod('success') && $reflect->hasMethod('error')) {
        echo "  Trait methods present in PostController: YES\n";
    } else {
        echo "  Trait methods present in PostController: NO\n";
    }
} catch (\Exception $e) {
    echo "  Trait Check ERROR: " . $e->getMessage() . "\n";
}

echo "--- RE-CHECK COMPLETE ---\n";
