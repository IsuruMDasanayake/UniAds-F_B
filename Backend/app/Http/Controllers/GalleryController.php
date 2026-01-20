<?php

namespace App\Http\Controllers;

use App\Models\InstituteGallery;
use App\Models\Institute;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class GalleryController extends Controller
{
    public function index($id)
    {
        $gallery = InstituteGallery::where('institute_id', $id)->get();
        return response()->json($gallery);
    }

    public function store(Request $request, $id)
    {
        // Validate the image input
        $request->validate([
            'image' => 'required|image|max:2048', // Validate image type and size
        ]);

        // Store the image in the 'institute_gallery' folder within 'public' storage
        $imagePath = $request->file('image')->store('institute_gallery', 'public');

        // Create a new gallery entry in the database
        $gallery = InstituteGallery::create([
            'institute_id' => $id, // Associate the image with the institute by its ID
            'image_path' => $imagePath, // Store the path to the uploaded image
        ]);

        // Return the response with the newly uploaded image's details
        return response()->json([
            'message' => 'Image uploaded successfully!',
            'image' => $gallery, // Send the image info back to update the gallery dynamically
        ]);
    }

    public function destroy($id)
    {
        $galleryItem = InstituteGallery::findOrFail($id);

        // Delete image file from storage
        if (Storage::exists('public/' . $galleryItem->image_path)) {
            Storage::delete('public/' . $galleryItem->image_path);
        }

        $galleryItem->delete();

        return response()->json(['success' => true]);
    }
}
