<?php

namespace App\Exports;

use App\Models\User;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\Exportable;

class UsersExport implements FromQuery, WithHeadings, WithMapping
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
        $query = User::query();

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
            'Role',
            'Created At',
        ];
    }

    public function map($user): array
    {
        return [
            $user->id,
            $user->name,
            $user->email,
            $user->role,
            $user->created_at->format('Y-m-d H:i:s'),
        ];
    }
}
