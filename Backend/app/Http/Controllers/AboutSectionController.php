<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Institute;
use App\Models\AboutSection;
use App\Models\Follower;
use App\Models\Category;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use App\Traits\ApiResponse;
use Mews\Purifier\Facades\Purifier;


class AboutSectionController extends Controller
{
    use ApiResponse;
    // showAboutPage removed


    public function store(Request $request, $id)
    {
        return DB::transaction(function () use ($request, $id) {
            // Fetch existing AboutSection or create new
            $aboutSection = AboutSection::firstOrNew(['institute_id' => $id]);

            // Validate text fields only
            $validated = $request->validate([
                'institute_overview' => 'nullable|string',
                'mission' => 'nullable|string',
                'vision' => 'nullable|string',
                'history' => 'nullable|string',
                'chancellor_intro' => 'nullable|string',
                'vice_chancellor_intro' => 'nullable|string',
                'academic_excellence' => 'nullable|string',
                'programs_offered' => 'nullable|string',
                'global_partnerships' => 'nullable|string',
                'life_at_institute' => 'nullable|string',
                'sports_recreation' => 'nullable|string',
                'upcoming_programs' => 'nullable|string',
            ]);

            $data = [];
            // Sanitize all text inputs
            foreach ($validated as $key => $value) {
                $data[$key] = $value ? Purifier::clean($value) : null;
            }

            $skippedFiles = [];

            // --- Handle single image uploads ---
            $singleImageFields = ['chancellor_photo', 'vice_chancellor_photo'];
            foreach ($singleImageFields as $field) {
                if ($request->hasFile($field)) {
                    $file = $request->file($field);
                    if ($file->getSize() <= 2 * 1024 * 1024) { // 2MB limit
                        $data[$field] = $file->store('images', 'public');
                    } else {
                        $skippedFiles[] = $file->getClientOriginalName();
                    }
                }
            }

            // --- Handle multiple image uploads ---
            $multiFileFields = [
                'academic_images',
                'programs_images',
                'partnerships_images',
                'life_images',
                'sports_images',
                'upcoming_images',
                'campus_images'
            ];

            foreach ($multiFileFields as $field) {
                if ($request->hasFile($field)) {
                    $uploadedFiles = [];
                    foreach ($request->file($field) as $file) {
                        if ($file->getSize() <= 2 * 1024 * 1024) { // 2MB
                            $uploadedFiles[] = $file->store('images', 'public');
                        } else {
                            $skippedFiles[] = $file->getClientOriginalName();
                        }
                    }
                    if (!empty($uploadedFiles)) {
                        $data[$field] = json_encode($uploadedFiles);
                    }
                }
            }

            // Add institute ID
            $data['institute_id'] = $id;

            // Save or update the AboutSection
            $aboutSection->fill($data);
            $aboutSection->save();

            // Build success message
            $message = 'Data saved successfully!';
            if (!empty($skippedFiles)) {
                $message .= ' Skipped files: ' . implode(', ', $skippedFiles) . ' (too large).';
            }

            if ($request->wantsJson()) {
                return $this->success($aboutSection, $message);
            }

            return redirect()->back()->with('success', $message);
        });
    }




    public function update(Request $request, $id)
    {
        return DB::transaction(function () use ($request, $id) {
            // Fetch the AboutSection first
            $aboutSection = AboutSection::where('institute_id', $id)->first();

            if (!$aboutSection) {
                if ($request->wantsJson()) {
                    return $this->error('About section not found.', 404);
                }
                return redirect()->back()->with('error', 'About section not found.');
            }

            // Validate the data
            $validated = $request->validate([
                'institute_overview' => 'nullable|string',
                'mission' => 'nullable|string',
                'vision' => 'nullable|string',
                'history' => 'nullable|string',
                'chancellor_intro' => 'nullable|string',
                'chancellor_photo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
                'vice_chancellor_intro' => 'nullable|string',
                'vice_chancellor_photo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
                'academic_excellence' => 'nullable|string',
                'academic_images' => 'nullable|array',
                'academic_images.*' => 'image|mimes:jpeg,png,jpg,gif,svg|max:2048',
                'programs_offered' => 'nullable|string',
                'programs_images' => 'nullable|array',
                'programs_images.*' => 'image|mimes:jpeg,png,jpg,gif,svg|max:2048',
                'global_partnerships' => 'nullable|string',
                'partnerships_images' => 'nullable|array',
                'partnerships_images.*' => 'image|mimes:jpeg,png,jpg,gif,svg|max:2048',
                'life_at_institute' => 'nullable|string',
                'life_images' => 'nullable|array',
                'life_images.*' => 'image|mimes:jpeg,png,jpg,gif,svg|max:2048',
                'sports_recreation' => 'nullable|string',
                'sports_images' => 'nullable|array',
                'sports_images.*' => 'image|mimes:jpeg,png,jpg,gif,svg|max:2048',
                'upcoming_programs' => 'nullable|string',
                'upcoming_images' => 'nullable|array',
                'upcoming_images.*' => 'image|mimes:jpeg,png,jpg,gif,svg|max:2048',
                'campus_images' => 'nullable|array',
                'campus_images.*' => 'image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            ]);

            $data = [];
            // Sanitize text fields
            foreach ($validated as $key => $value) {
                if (is_string($value)) {
                    $data[$key] = Purifier::clean($value);
                } else {
                    $data[$key] = $value;
                }
            }

            // Handle file uploads for single files
            foreach (['chancellor_photo', 'vice_chancellor_photo'] as $field) {
                if ($request->hasFile($field)) {
                    if ($aboutSection->$field && Storage::exists('public/' . $aboutSection->$field)) {
                        Storage::delete('public/' . $aboutSection->$field);
                    }
                    $data[$field] = $request->file($field)->store('images', 'public');
                }
            }

            // Handle multiple file uploads
            $multiFileFields = ['academic_images', 'programs_images', 'partnerships_images', 'life_images', 'sports_images', 'upcoming_images', 'campus_images'];

            foreach ($multiFileFields as $field) {
                $existingFiles = json_decode($aboutSection->$field) ?: [];

                // Handle removed images
                $removedField = 'removed_' . $field;
                if ($request->has($removedField)) {
                    $removedImages = json_decode($request->$removedField) ?: [];
                    foreach ($removedImages as $remove) {
                        if (($key = array_search($remove, $existingFiles)) !== false) {
                            unset($existingFiles[$key]);
                            Storage::delete($remove);
                        }
                    }
                }

                if ($request->hasFile($field)) {
                    foreach ($request->file($field) as $file) {
                        $existingFiles[] = $file->store('images', 'public');
                    }
                }

                $data[$field] = json_encode(array_values($existingFiles));
            }

            // Update the database
            $aboutSection->update($data);

            if ($request->wantsJson()) {
                return $this->success($aboutSection, 'Data updated successfully!');
            }

            return redirect()->back()->with('success', 'Data updated successfully!');
        });
    }



    public function destroy($id)
    {
        // Find the about section by institute_id
        $aboutSection = AboutSection::where('institute_id', $id)->first();

        if ($aboutSection) {
            // If the record exists, delete it
            $aboutSection->delete();

            if (request()->wantsJson()) {
                return $this->success(null, 'Institute information deleted successfully.');
            }

            // Redirect with success message
            return redirect()->back()->with('success', 'Institute information deleted successfully.');
        }

        if (request()->wantsJson()) {
            return $this->error('No information found to delete for this institute.', 404);
        }

        // If no record is found, redirect with an error message
        return redirect()->back()->with('error', 'No information found to delete for this institute.');
    }


    // Delete single image
    public function deleteSingleImage(Request $request)
    {
        $request->validate([
            'field' => 'required|string',
            'institute_id' => 'required|integer',
        ]);

        $institute = Institute::findOrFail($request->institute_id);
        $field = $request->field;

        if ($institute->$field) {
            Storage::delete($institute->$field); // Delete file
            $institute->$field = null;
            $institute->save();
        }

        return $this->success(null, 'Image deleted successfully.');
    }

    // Delete multi image
    public function deleteMultiImage(Request $request)
    {
        $request->validate([
            'field' => 'required|string',
            'image_name' => 'required|string',
            'institute_id' => 'required|integer',
        ]);

        $institute = Institute::findOrFail($request->institute_id);
        $field = $request->field;
        $images = json_decode($institute->$field, true) ?? [];

        if (($key = array_search($request->image_name, $images)) !== false) {
            Storage::delete($request->image_name);
            unset($images[$key]);
            $institute->$field = json_encode(array_values($images));
            $institute->save();
        }

        return $this->success(null, 'Image deleted successfully.');
    }
}
