<?php

namespace App\Exports\Institute;

use App\Models\ApplyCase;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

class ApplicationsExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize
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
        return ApplyCase::where('institute_id', $this->instituteId)
            ->whereBetween('applied_at', [$this->start, $this->end])
            ->latest('applied_at')
            ->get();
    }

    public function headings(): array
    {
        return [
            'Student Name',
            'Student Email',
            'Phone',
            'Course Title',
            'Status',
            'Applied Date',
        ];
    }

    public function map($application): array
    {
        return [
            $application->student_name,
            $application->student_email,
            $application->student_phone,
            $application->course_title,
            $application->status,
            $application->applied_at,
        ];
    }
}
