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
use Dompdf\Dompdf;
use Dompdf\Options;
use Illuminate\Support\Facades\View;
use App\Models\PostView;
use App\Models\EventView;
use App\Models\InstituteProfileView;
use App\Models\PlatformSetting;
use App\Traits\ApiResponse;

class InstituteReportController extends Controller
{
    use ApiResponse;

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

        $includeCharts = $request->query('include_charts') === 'true';
        $detailedRecords = $request->query('detailed_records') === 'true';

        // Map report types to export classes or PDF generation
        if ($format === 'PDF') {
            return $this->generatePdfReport($user->institute, $type, $range, $startDate, $endDate, $includeCharts, $detailedRecords, $filename);
        }

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
                return $this->error('Invalid report type', 400);
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

    private function generatePdfReport($institute, $type, $range, $start, $end, $includeCharts, $detailedRecords, $filename)
    {
        $settings = PlatformSetting::getInstance();
        
        $data = [
            'instituteName' => $institute->institute_name,
            'title' => $type,
            'range' => $range,
            'includeCharts' => $includeCharts,
            'detailedRecords' => $detailedRecords,
            'logo' => $this->getLogoBase64($institute->profile_photo),
            'uniads_logo' => $this->getUniAdsLogoBase64($settings),
        ];

        // Gather statistics and choose template based on type
        switch ($type) {
            case 'Overview Summary':
                $data = array_merge($data, $this->getOverviewStats($institute->id, $start, $end));
                if ($includeCharts) $data['chart_url'] = $this->getOverviewChartUrl($data);
                $view = 'reports.overview';
                break;

            case 'Applications Report':
                $data = array_merge($data, $this->getApplicationStats($institute->id, $start, $end));
                if ($includeCharts) $data['chart_url'] = $this->getApplicationChartUrl($data);
                $view = 'reports.applications';
                break;

            case 'Posts Performance':
                $data = array_merge($data, $this->getPostStats($institute->id, $start, $end));
                if ($includeCharts) $data['chart_url'] = $this->getPostChartUrl($data);
                $view = 'reports.posts';
                break;

            case 'Events Performance':
                $data = array_merge($data, $this->getEventStats($institute->id, $start, $end));
                if ($includeCharts) $data['chart_url'] = $this->getEventChartUrl($data);
                $view = 'reports.events';
                break;

            case 'Reviews Summary':
                $data = array_merge($data, $this->getReviewStats($institute->id, $start, $end));
                if ($includeCharts) $data['chart_url'] = $this->getReviewChartUrl($data);
                $view = 'reports.reviews';
                break;

            default:
                $view = 'reports.overview';
        }

        $html = View::make($view, $data)->render();

        $options = new Options();
        $options->set('isHtml5ParserEnabled', true);
        $options->set('isRemoteEnabled', true);

        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();

        return response($dompdf->output())
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'attachment; filename="' . $filename . '.pdf"');
    }

    private function getLogoBase64($photoPath)
    {
        try {
            $path = $photoPath ? public_path('storage/' . $photoPath) : null;
            if ($path && file_exists($path)) {
                $type = pathinfo($path, PATHINFO_EXTENSION);
                $data = file_get_contents($path);
                return 'data:image/' . $type . ';base64,' . base64_encode($data);
            }
        } catch (\Exception $e) {
            return null;
        }
        return null;
    }

    private function getUniAdsLogoBase64($settings)
    {
        try {
            // Frontend logic: settings.logo_url || "/images/logo.png"
            $path = null;
            if ($settings->logo_path) {
                $path = public_path('storage/' . $settings->logo_path);
            }
            
            if (!$path || !file_exists($path)) {
                $path = public_path('images/logo.png');
            }

            if (file_exists($path)) {
                $type = pathinfo($path, PATHINFO_EXTENSION);
                $data = file_get_contents($path);
                return 'data:image/' . $type . ';base64,' . base64_encode($data);
            }
        } catch (\Exception $e) {
            return null;
        }
        return null;
    }

    private function getOverviewStats($instituteId, $start, $end)
    {
        $postViews = PostView::whereHas('post', function ($q) use ($instituteId) {
            $q->where('institute_id', $instituteId);
        })->whereBetween('viewed_at', [$start, $end])->count();

        $eventViews = EventView::whereHas('event', function ($q) use ($instituteId) {
            $q->where('institute_id', $instituteId);
        })->whereBetween('viewed_at', [$start, $end])->count();

        $profileViews = InstituteProfileView::where('institute_id', $instituteId)
            ->whereBetween('viewed_at', [$start, $end])->count();

        $applications = ApplyCase::where('institute_id', $instituteId)
            ->whereBetween('applied_at', [$start, $end])->count();

        $avgRating = Rating::where('institute_id', $instituteId)
            ->whereBetween('created_at', [$start, $end])->avg('rating') ?: 0;

        return [
            'postViews' => $postViews,
            'eventViews' => $eventViews,
            'profileViews' => $profileViews,
            'applications' => $applications,
            'avgRating' => $avgRating
        ];
    }

    private function getApplicationStats($instituteId, $start, $end)
    {
        $records = ApplyCase::where('institute_id', $instituteId)
            ->whereBetween('applied_at', [$start, $end])
            ->orderBy('applied_at', 'desc')
            ->get();

        return [
            'records' => $records,
            'totalCount' => $records->count(),
            'pendingCount' => $records->where('status', 'pending')->count(),
            'contactedCount' => $records->where('status', 'contacted')->count(),
        ];
    }

    private function getPostStats($instituteId, $start, $end)
    {
        $records = Post::where('institute_id', $instituteId)
            ->withCount([
                'views' => function($q) use ($start, $end) {
                    $q->whereBetween('viewed_at', [$start, $end]);
                },
                'likes',
                'applyCases' => function($q) use ($start, $end) {
                    $q->whereBetween('applied_at', [$start, $end]);
                }
            ])
            ->orderBy('views_count', 'desc')
            ->get();

        $totalViews = $records->sum('views_count');
        $totalPosts = $records->count();

        return [
            'records' => $records,
            'totalPosts' => $totalPosts,
            'totalViews' => $totalViews,
            'avgViewsPerPost' => $totalPosts > 0 ? round($totalViews / $totalPosts, 1) : 0,
        ];
    }

    private function getEventStats($instituteId, $start, $end)
    {
        $records = Event::where('institute_id', $instituteId)
            ->whereBetween('event_date', [$start, $end])
            ->orderBy('event_date', 'desc')
            ->get();

        return [
            'records' => $records,
            'totalEvents' => $records->count(),
            'totalViews' => $records->sum('view_count'),
            'totalInterested' => $records->sum('interested_count'),
        ];
    }

    private function getReviewStats($instituteId, $start, $end)
    {
        $records = Rating::with('user')
            ->where('institute_id', $instituteId)
            ->whereBetween('created_at', [$start, $end])
            ->orderBy('created_at', 'desc')
            ->get();

        return [
            'records' => $records,
            'totalReviews' => $records->count(),
            'avgRating' => $records->avg('rating') ?: 0,
            'reportedCount' => $records->where('is_reported', true)->count(),
        ];
    }

    private function getOverviewChartUrl($data)
    {
        $qcConfig = [
            'type' => 'bar',
            'data' => [
                'labels' => ['Profile', 'Posts', 'Events', 'Applications'],
                'datasets' => [[
                    'label' => 'Total Engagements',
                    'backgroundColor' => ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd'],
                    'data' => [$data['profileViews'], $data['postViews'], $data['eventViews'], $data['applications']]
                ]]
            ],
            'options' => ['title' => ['display' => true, 'text' => 'Engagement Breakdown']]
        ];

        return 'https://quickchart.io/chart?c=' . urlencode(json_encode($qcConfig));
    }

    private function getApplicationChartUrl($data)
    {
        $qcConfig = [
            'type' => 'pie',
            'data' => [
                'labels' => ['Pending', 'Contacted'],
                'datasets' => [[
                    'backgroundColor' => ['#f59e0b', '#059669'],
                    'data' => [$data['pendingCount'], $data['contactedCount']]
                ]]
            ],
            'options' => ['title' => ['display' => true, 'text' => 'Application Statuses']]
        ];

        return 'https://quickchart.io/chart?c=' . urlencode(json_encode($qcConfig));
    }

    private function getPostChartUrl($data)
    {
        $topPosts = $data['records']->take(5);
        $qcConfig = [
            'type' => 'horizontalBar',
            'data' => [
                'labels' => $topPosts->pluck('title')->toArray(),
                'datasets' => [[
                    'label' => 'Total Views',
                    'backgroundColor' => '#3b82f6',
                    'data' => $topPosts->pluck('views_count')->toArray()
                ]]
            ],
            'options' => ['title' => ['display' => true, 'text' => 'Top 5 Performing Courses']]
        ];

        return 'https://quickchart.io/chart?c=' . urlencode(json_encode($qcConfig));
    }

    private function getEventChartUrl($data)
    {
        $topEvents = $data['records']->take(5);
        $qcConfig = [
            'type' => 'bar',
            'data' => [
                'labels' => $topEvents->pluck('event_title')->toArray(),
                'datasets' => [
                    [
                        'label' => 'Views',
                        'backgroundColor' => '#60a5fa',
                        'data' => $topEvents->pluck('view_count')->toArray()
                    ],
                    [
                        'label' => 'Interested',
                        'backgroundColor' => '#059669',
                        'data' => $topEvents->pluck('interested_count')->toArray()
                    ]
                ]
            ],
            'options' => ['title' => ['display' => true, 'text' => 'Views vs Interest (Top 5 Events)']]
        ];

        return 'https://quickchart.io/chart?c=' . urlencode(json_encode($qcConfig));
    }

    private function getReviewChartUrl($data)
    {
        $starCounts = [0, 0, 0, 0, 0];
        foreach ($data['records'] as $review) {
            $star = (int)$review->rating;
            if ($star >= 1 && $star <= 5) $starCounts[$star - 1]++;
        }

        $qcConfig = [
            'type' => 'doughnut',
            'data' => [
                'labels' => ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
                'datasets' => [[
                    'backgroundColor' => ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e'],
                    'data' => $starCounts
                ]]
            ],
            'options' => ['title' => ['display' => true, 'text' => 'Rating Distribution']]
        ];

        return 'https://quickchart.io/chart?c=' . urlencode(json_encode($qcConfig));
    }
}
