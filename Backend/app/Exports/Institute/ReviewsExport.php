<?php

namespace App\Exports\Institute;

use App\Models\Rating;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

class ReviewsExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize
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
        return Rating::with('user')
            ->where('institute_id', $this->instituteId)
            ->whereBetween('created_at', [$this->start, $this->end])
            ->latest()
            ->get();
    }

    public function headings(): array
    {
        return [
            'Student Name',
            'Rating',
            'Comment',
            'Date',
        ];
    }

    public function map($review): array
    {
        return [
            $review->user?->name ?? 'Anonymous',
            $review->rating . ' Stars',
            $review->comment,
            $review->created_at->format('Y-m-d'),
        ];
    }
}
