<?php

namespace App\Exports;

use App\Models\ApplyCase;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\Exportable;

class ApplicationsExport implements FromQuery, WithHeadings, WithMapping
{
    use Exportable;

    protected $fromDate;
    protected $toDate;

    public function __construct($fromDate = null, $toDate = null)
    {
        $this->fromDate = $fromDate;
        $this->toDate = $toDate;
    }

    public function query()
    {
        $query = ApplyCase::query()->with(['user', 'institute']);

        if ($this->fromDate && $this->toDate) {
            $query->whereBetween('created_at', [$this->fromDate, $this->toDate]);
        }

        return $query;
    }

    public function headings(): array
    {
        return [
            'ID',
            'Student Name',
            'Course Title',
            'Institute Name',
            'Applied At',
        ];
    }

    public function map($application): array
    {
        return [
            $application->id,
            $application->user ? $application->user->name : 'N/A',
            $application->course_title,
            $application->institute ? $application->institute->institute_name : 'N/A',
            $application->created_at->format('Y-m-d H:i:s'),
        ];
    }
}
