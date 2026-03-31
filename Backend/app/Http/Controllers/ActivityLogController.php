<?php

namespace App\Http\Controllers;

use App\Models\AdminActivityLog;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    /**
     * Get paginated activity logs with optional filtering.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $query = AdminActivityLog::with('admin:id,name,profile_picture')
            ->orderBy('created_at', 'desc');

        // Filter by search term (description or action)
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('description', 'LIKE', "%{$search}%")
                    ->orWhere('action', 'LIKE', "%{$search}%");
            });
        }

        // Filter by specific admin
        if ($request->has('admin_id') && !empty($request->admin_id)) {
            $query->where('admin_id', $request->admin_id);
        }

        // Filter by action type
        if ($request->has('action') && !empty($request->action)) {
            $query->where('action', $request->action);
        }

        // Filter by date range
        if ($request->has('start_date') && !empty($request->start_date)) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }
        if ($request->has('end_date') && !empty($request->end_date)) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        $logs = $query->paginate($request->input('per_page', 20));

        return $this->successResponse($logs);
    }

    /**
     * Get a list of unique actions and admins for filtering.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getFilters()
    {
        $actions = AdminActivityLog::select('action')->distinct()->pluck('action');
        $admins = \App\Models\User::where('role', 'Admin')
            ->select('id', 'name')
            ->get();

        return $this->success([
            'actions' => $actions,
            'admins' => $admins
        ]);
    }
}
