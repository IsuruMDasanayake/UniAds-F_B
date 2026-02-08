<?php

namespace App\Http\Controllers;

use App\Models\ApplyCase;
use Illuminate\Http\Request;

class ApplicationController extends Controller
{
    /**
     * Display a listing of the applications.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function apiIndex(Request $request)
    {
        $query = ApplyCase::with(['user', 'institute', 'post']);

        // Search functionality
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('course_title', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    })
                    ->orWhereHas('institute', function ($q) use ($search) {
                        $q->where('institute_name', 'like', "%{$search}%");
                    });
            });
        }

        // Filter by Institute
        if ($request->has('institute_id') && $request->institute_id && $request->institute_id !== 'all') {
            $query->where('institute_id', $request->institute_id);
        }

        // Sort by latest applied_at or created_at
        $query->orderBy('applied_at', 'desc');

        $applications = $query->paginate(15);

        return response()->json($applications);
    }
}
