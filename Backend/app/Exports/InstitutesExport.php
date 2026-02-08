<?php

namespace App\Exports;

use App\Models\Institute;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\Exportable;

class InstitutesExport implements FromQuery, WithHeadings, WithMapping
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
        $query = Institute::query();

        if ($this->fromDate && $this->toDate) {
            $query->whereBetween('created_at', [$this->fromDate, $this->toDate]);
        }

        return $query;
    }

    public function headings(): array
    {
        return [
            'ID',
            'Name',
            'Email',
            'Contact Number',
            'Status',
            'Trial Status',
            'Premium',
            'Followers Count',
            'Created At',
        ];
    }

    public function map($institute): array
    {
        return [
            $institute->id,
            $institute->institute_name,
            $institute->email,
            $institute->contact_number,
            $institute->status,
            $institute->trial_status,
            $institute->is_premium ? 'Yes' : 'No',
            $institute->followers_count,
            $institute->created_at->format('Y-m-d H:i:s'),
        ];
    }
}
