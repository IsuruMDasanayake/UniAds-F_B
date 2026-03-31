<?php

namespace App\Http\Controllers;

use App\Models\InstituteActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Response;
use App\Traits\ApiResponse;

class InstituteActivityLogController extends Controller
{
    use ApiResponse;
    /**
     * Get paginated activity logs for the authenticated institute.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $instituteId = $user->institute->id;

        $query = InstituteActivityLog::with('user')
            ->where('institute_id', $instituteId)
            ->orderBy('created_at', 'desc');

        // Filter by category
        if ($request->has('category') && $request->category !== 'All') {
            $query->where('category', $request->category);
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
     * Export logs to CSV for the authenticated institute.
     */
    public function exportCsv(Request $request)
    {
        $user = Auth::user();
        $instituteId = $user->institute->id;

        $query = InstituteActivityLog::with('user')
            ->where('institute_id', $instituteId)
            ->orderBy('created_at', 'desc');

        // Apply same filters as index if provided
        if ($request->has('category') && $request->category !== 'All') {
            $query->where('category', $request->category);
        }
        if ($request->has('start_date') && !empty($request->start_date)) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }
        if ($request->has('end_date') && !empty($request->end_date)) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        $logs = $query->get();

        $headers = [
            "Content-type" => "text/csv; charset=UTF-8",
            "Content-Disposition" => "attachment; filename=activity_logs_" . date('Y-m-d') . ".csv",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
            "Expires" => "0"
        ];

        $callback = function () use ($logs) {
            $file = fopen('php://output', 'w');
            // Add UTF-8 BOM for Excel
            fprintf($file, chr(0xEF) . chr(0xBB) . chr(0xBF));
            fputcsv($file, ['Action Type', 'Description', 'Category', 'Date & Time', 'User']);

            foreach ($logs as $log) {
                fputcsv($file, [
                    $log->action_type,
                    $log->description,
                    $log->category,
                    $log->created_at->format('Y-m-d H:i'),
                    $log->user->name ?? 'Admin'
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Clear logs for the authenticated institute with confirmation.
     */
    public function clearLogs()
    {
        $user = Auth::user();
        $instituteId = $user->institute->id;

        InstituteActivityLog::where('institute_id', $instituteId)->delete();

        return $this->success(null, 'Activity logs cleared successfully.');
    }
}
