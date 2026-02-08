<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Exports\UsersExport;
use App\Exports\InstitutesExport;
use App\Exports\ApplicationsExport;
use Maatwebsite\Excel\Facades\Excel;
use Carbon\Carbon;

class ExportController extends Controller
{
    public function exportUsers(Request $request)
    {
        $fromDate = $request->input('from_date');
        $toDate = $request->input('to_date');
        $dateStr = Carbon::now()->format('Y-m-d');

        return Excel::download(new UsersExport($fromDate, $toDate), "users-{$dateStr}.xlsx");
    }

    public function exportInstitutes(Request $request)
    {
        $fromDate = $request->input('from_date');
        $toDate = $request->input('to_date');
        $dateStr = Carbon::now()->format('Y-m-d');

        return Excel::download(new InstitutesExport($fromDate, $toDate), "institutes-{$dateStr}.xlsx");
    }

    public function exportApplications(Request $request)
    {
        $fromDate = $request->input('from_date');
        $toDate = $request->input('to_date');
        $dateStr = Carbon::now()->format('Y-m-d');

        return Excel::download(new ApplicationsExport($fromDate, $toDate), "applications-{$dateStr}.xlsx");
    }
}
