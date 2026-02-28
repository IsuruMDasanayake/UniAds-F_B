<?php

namespace App\Exports\Institute;

use App\Models\Event;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

class EventsExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize
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
        return Event::where('institute_id', $this->instituteId)
            ->whereBetween('created_at', [$this->start, $this->end])
            ->latest()
            ->get();
    }

    public function headings(): array
    {
        return [
            'Event Title',
            'Event Date',
            'Location',
            'Views',
            'Interested Count',
            'Status',
            'Created Date',
        ];
    }

    public function map($event): array
    {
        return [
            $event->event_title,
            $event->event_date,
            $event->main_location . ', ' . $event->sub_location,
            $event->view_count,
            $event->interested_count,
            $event->is_active ? 'Active' : 'Inactive',
            $event->created_at->format('Y-m-d'),
        ];
    }
}
