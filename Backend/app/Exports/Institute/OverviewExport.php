<?php

namespace App\Exports\Institute;

use App\Models\ApplyCase;
use App\Models\Post;
use App\Models\Event;
use App\Models\Rating;
use App\Models\InstituteProfileView;
use App\Models\PostView;
use App\Models\EventView;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

class OverviewExport implements FromCollection, WithHeadings, ShouldAutoSize
{
    protected $instituteId;
    protected $start;
    protected $end;

    public function __construct($instituteId, $start, $end)
    {
        $this->instituteId = $instituteId;
        $this->start = $start;
        $this->end = $end;
    }

    public function collection()
    {
        // Aggregate overview data
        $postViews = PostView::whereHas('post', function ($q) {
            $q->where('institute_id', $this->instituteId);
        })->whereBetween('viewed_at', [$this->start, $this->end])->count();

        $eventViews = EventView::whereHas('event', function ($q) {
            $q->where('institute_id', $this->instituteId);
        })->whereBetween('viewed_at', [$this->start, $this->end])->count();

        $profileViews = InstituteProfileView::where('institute_id', $this->instituteId)
            ->whereBetween('viewed_at', [$this->start, $this->end])->count();

        $applications = ApplyCase::where('institute_id', $this->instituteId)
            ->whereBetween('applied_at', [$this->start, $this->end])->count();

        $avgRating = Rating::where('institute_id', $this->instituteId)
            ->whereBetween('created_at', [$this->start, $this->end])->avg('rating') ?: 0;

        return collect([
            [
                'Metric' => 'Total Profile Views',
                'Value' => $profileViews
            ],
            [
                'Metric' => 'Total Post Views',
                'Value' => $postViews
            ],
            [
                'Metric' => 'Total Event Views',
                'Value' => $eventViews
            ],
            [
                'Metric' => 'Total Applications',
                'Value' => $applications
            ],
            [
                'Metric' => 'Average Rating',
                'Value' => number_format((float)$avgRating, 2, '.', '')
            ]
        ]);
    }

    public function headings(): array
    {
        return [
            'Metric',
            'Value'
        ];
    }
}
