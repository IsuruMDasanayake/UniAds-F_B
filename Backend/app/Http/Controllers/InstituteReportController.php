<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ApplyCase;
use App\Models\Post;
use App\Models\Event;
use App\Models\Rating;
use App\Models\Institute;
use App\Services\InstituteActivityLogger;
use Maatwebsite\Excel\Facades\Excel;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class InstituteReportController extends Controller
{
    /**
     * Download analytics reports for institutes.
     */
    public function download(Request $request)
    {
        $user = Auth::user();
        $instituteId = $user->institute->id;
        $type = $request->query('type');
        $range = $request->query('range');
        $format = $request->query('format', 'CSV');

        // Parse Date Range
        $dates = $this->parseDateRange($range, $request);
        $startDate = $dates['start'];
        $endDate = $dates['end'];

        $filename = strtolower(str_replace(' ', '_', $type)) . '_' . Carbon::now()->format('YmdHi');

        // Log the activity
        InstituteActivityLogger::log(
            'Report Downloaded',
            "Downloaded {$type} report ({$format}) for range: {$range}",
            'General'
        );

        // Map report types to export classes
        switch ($type) {
            case 'Overview Summary':
                return $this->exportOverview($instituteId, $startDate, $endDate, $format, $filename);
            case 'Applications Report':
                return $this->exportApplications($instituteId, $startDate, $endDate, $format, $filename);
            case 'Posts Performance':
                return $this->exportPosts($instituteId, $startDate, $endDate, $format, $filename);
            case 'Events Performance':
                return $this->exportEvents($instituteId, $startDate, $endDate, $format, $filename);
            case 'Reviews Summary':
                return $this->exportReviews($instituteId, $startDate, $endDate, $format, $filename);
            default:
                return response()->json(['message' => 'Invalid report type'], 400);
        }
    }

    private function parseDateRange($range, $request)
    {
        $end = Carbon::now();
        $start = Carbon::now();

        switch ($range) {
            case 'Last 7 days':
                $start = Carbon::now()->subDays(7);
                break;
            case 'Last 30 days':
                $start = Carbon::now()->subDays(30);
                break;
            case 'Last 90 days':
                $start = Carbon::now()->subDays(90);
                break;
            case 'Custom range':
                $start = Carbon::parse($request->query('start_date'))->startOfDay();
                $end = Carbon::parse($request->query('end_date'))->endOfDay();
                break;
            default:
                $start = Carbon::now()->subDays(30);
        }

        return ['start' => $start, 'end' => $end];
    }

    private function exportOverview($instituteId, $start, $end, $format, $filename)
    {
        // For simplicity and since users often prefer simple CSVs first, 
        // we'll implement these as specialized export classes using Maatwebsite\Excel
        $export = new \App\Exports\Institute\OverviewExport($instituteId, $start, $end);
        return Excel::download($export, "{$filename}." . strtolower($format));
    }

    private function exportApplications($instituteId, $start, $end, $format, $filename)
    {
        $export = new \App\Exports\Institute\ApplicationsExport($instituteId, $start, $end);
        return Excel::download($export, "{$filename}." . strtolower($format));
    }

    private function exportPosts($instituteId, $start, $end, $format, $filename)
    {
        $export = new \App\Exports\Institute\PostsExport($instituteId, $start, $end);
        return Excel::download($export, "{$filename}." . strtolower($format));
    }

    private function exportEvents($instituteId, $start, $end, $format, $filename)
    {
        $export = new \App\Exports\Institute\EventsExport($instituteId, $start, $end);
        return Excel::download($export, "{$filename}." . strtolower($format));
    }

    private function exportReviews($instituteId, $start, $end, $format, $filename)
    {
        $export = new \App\Exports\Institute\ReviewsExport($instituteId, $start, $end);
        return Excel::download($export, "{$filename}." . strtolower($format));
    }
}
