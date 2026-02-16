<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Category;
use App\Services\AdminActivityLogger;


class CategoryController extends Controller
{
    // Display the category management page
    // categories removed




    //show in frontend
    // showCategories removed


    public function apiIndex()
    {
        $categories = Category::all()->groupBy('main_category');
        return response()->json($categories);
    }



    // Store a new category
    public function store(Request $request)
    {
        $validated = $request->validate([
            'main_category' => 'required|string',
            'name' => 'required|string',
            'icon' => 'nullable|string',
        ]);

        $category = Category::create($validated);

        AdminActivityLogger::log(
            'Created Category',
            'Category',
            $category->id,
            auth()->user()->name . " created a new category \"{$category->name}\" ({$category->main_category})"
        );

        if ($request->wantsJson()) {
            return response()->json($category, 201);
        }

        return redirect()->back()->with('success', 'Category added successfully!');
    }

    // Delete a category
    public function destroy(Request $request, $id)
    {
        try {
            $category = Category::findOrFail($id);
            $categoryName = $category->name;
            $categoryId = $category->id;
            $category->delete();

            AdminActivityLogger::log(
                'Deleted Category',
                'Category',
                $categoryId,
                auth()->user()->name . " deleted category \"{$categoryName}\""
            );

            if ($request->wantsJson()) {
                return response()->json(['message' => 'Category deleted successfully!'], 200);
            }

            return redirect()->back()->with('success', 'Category deleted successfully!');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            if ($request->wantsJson()) {
                return response()->json(['message' => 'Category not found.'], 404);
            }
            return redirect()->back()->with('error', 'Category not found.');
        } catch (\Exception $e) {
            if ($request->wantsJson()) {
                return response()->json(['message' => 'Failed to delete category. It may have associated content.'], 500);
            }
            return redirect()->back()->with('error', 'Failed to delete category.');
        }
    }

    // Update Category
    public function update(Request $request, $id)
    {
        try {
            $category = Category::findOrFail($id);

            // Validate the incoming data
            $request->validate([
                'main_category' => 'required|string',
                'name' => 'required|string',
                'icon' => 'required|string',
            ]);

            // Update the category in the database
            $category->update([
                'main_category' => $request->main_category,
                'name' => $request->name,
                'icon' => $request->icon,
            ]);

            AdminActivityLogger::log(
                'Updated Category',
                'Category',
                $category->id,
                auth()->user()->name . " updated category \"{$category->name}\""
            );

            if ($request->wantsJson()) {
                return response()->json($category, 200);
            }

            return redirect()->back()->with('success', 'Category updated successfully!');
        } catch (\Exception $e) {
            if ($request->wantsJson()) {
                return response()->json(['message' => 'Failed to update category.'], 500);
            }
            return redirect()->back()->with('error', 'Failed to update category.');
        }
    }



    // Edit Category
    // edit removed


    // ==========================================
    // API METHODS FOR ADMIN DASHBOARD
    // ==========================================

    public function apiAdminIndex()
    {
        $categories = Category::all();

        // Match main_category to Post table columns
        $columnMapping = [
            'Course Type' => 'course_type',
            'Location' => 'location',
            'Duration' => 'duration',
            'Course Format' => 'course_format',
            'Attendance Type' => 'attendance_type',
            'Courses' => 'course_name'
        ];

        foreach ($categories as $category) {
            $column = $columnMapping[$category->main_category] ?? null;

            if ($column) {
                if ($column === 'location') {
                    // Location is often a comma-separated string in this DB
                    $category->posts_count = \App\Models\Post::where($column, 'LIKE', '%' . $category->name . '%')->count();
                } else {
                    $category->posts_count = \App\Models\Post::where($column, $category->name)->count();
                }
            } else {
                $category->posts_count = 0;
            }
        }

        return response()->json($categories);
    }

    public function apiStore(Request $request)
    {
        $validated = $request->validate([
            'main_category' => 'required|string',
            'name' => 'required|string',
            'icon' => 'nullable|string',
        ]);

        $category = Category::create($validated);

        return response()->json(['success' => true, 'message' => 'Category added successfully!', 'category' => $category]);
    }

    public function apiUpdate(Request $request, $id)
    {
        $category = Category::findOrFail($id);

        $request->validate([
            'main_category' => 'required|string',
            'name' => 'required|string',
            'icon' => 'required|string',
        ]);

        $category->update([
            'main_category' => $request->main_category,
            'name' => $request->name,
            'icon' => $request->icon,
        ]);

        AdminActivityLogger::log(
            'Updated Category',
            'Category',
            $category->id,
            auth()->user()->name . " updated category \"{$category->name}\" via API"
        );

        return response()->json(['success' => true, 'message' => 'Category updated successfully!', 'category' => $category]);
    }

    public function apiDestroy($id)
    {
        $category = Category::findOrFail($id);
        $categoryName = $category->name;
        $categoryId = $category->id;
        $category->delete();

        AdminActivityLogger::log(
            'Deleted Category',
            'Category',
            $categoryId,
            auth()->user()->name . " deleted category \"{$categoryName}\" via API"
        );

        return response()->json(['success' => true, 'message' => 'Category deleted successfully!']);
    }
}
