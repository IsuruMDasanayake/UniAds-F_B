<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Category;
use App\Services\AdminActivityLogger;
use App\Traits\ApiResponse;


class CategoryController extends Controller
{
    use ApiResponse;

    // Display the category management page
    // categories removed




    //show in frontend
    // showCategories removed


    public function apiIndex()
    {
        $categories = Category::all()->groupBy('main_category');
        return $this->successResponse($categories);
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
            return $this->success($category, 'Category added successfully!', 201);
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
                return $this->success(null, 'Category deleted successfully!');
            }

            return redirect()->back()->with('success', 'Category deleted successfully!');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            if ($request->wantsJson()) {
                return $this->error('Category not found.', 404);
            }
            return redirect()->back()->with('error', 'Category not found.');
        } catch (\Exception $e) {
            if ($request->wantsJson()) {
                return $this->error('Failed to delete category. It may have associated content.', 500);
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
                return $this->success($category, 'Category updated successfully!');
            }

            return redirect()->back()->with('success', 'Category updated successfully!');
        } catch (\Exception $e) {
            if ($request->wantsJson()) {
                return $this->error('Failed to update category.', 500);
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

        // Optimized approach to avoid N+1 queries:
        // 1. Fetch exact match counts for mapped columns in grouped queries
        $counts = [];
        foreach (['course_type', 'duration', 'course_format', 'attendance_type', 'course_name'] as $col) {
            $counts[$col] = \App\Models\Post::select($col, \Illuminate\Support\Facades\DB::raw('count(*) as total'))
                ->whereNotNull($col)
                ->groupBy($col)
                ->pluck('total', $col)
                ->toArray();
        }

        // 2. Optimized location counts (Single indexed query)
        $locationCounts = \App\Models\PostLocation::select('location', \Illuminate\Support\Facades\DB::raw('count(*) as total'))
            ->groupBy('location')
            ->pluck('total', 'location')
            ->toArray();

        // 3. Map back to categories
        foreach ($categories as $category) {
            $column = $columnMapping[$category->main_category] ?? null;
            if ($column === 'location') {
                $category->posts_count = $locationCounts[$category->name] ?? 0;
            } elseif ($column && isset($counts[$column])) {
                $category->posts_count = $counts[$column][$category->name] ?? 0;
            } else {
                $category->posts_count = 0;
            }
        }

        return $this->successResponse($categories);
    }

    public function apiStore(Request $request)
    {
        $validated = $request->validate([
            'main_category' => 'required|string',
            'name' => 'required|string',
            'icon' => 'nullable|string',
        ]);

        $category = Category::create($validated);

        return $this->success($category, 'Category added successfully!', 201);
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

        return $this->success($category, 'Category updated successfully!');
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

        return $this->success(null, 'Category deleted successfully!');
    }
}
