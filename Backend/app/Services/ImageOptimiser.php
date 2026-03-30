<?php

namespace App\Services;

use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver; // or Imagick if available
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;

class ImageOptimiser
{
    /**
     * Store and optimize an uploaded image.
     * 
     * @param UploadedFile $file
     * @param string $directory
     * @param int $maxWidth
     * @param int $quality
     * @return string $path
     */
    public static function store(UploadedFile $file, string $directory, int $maxWidth = 1200, int $quality = 75): string
    {
        // 1. Initialise Image Manager with GD Driver
        $manager = new ImageManager(new Driver());

        // 2. Read the image
        $image = $manager->read($file->getRealPath());

        // 3. Resize if width is larger than max width
        if ($image->width() > $maxWidth) {
            $image->scale(width: $maxWidth);
        }

        // 4. Encode as WebP
        $encoded = $image->toWebp($quality);

        // 5. Generate unique filename
        $filename = Str::random(40) . '.webp';
        $path = $directory . '/' . $filename;

        // 6. Store in public disk
        Storage::disk('public')->put($path, (string)$encoded);

        return $path;
    }
}
