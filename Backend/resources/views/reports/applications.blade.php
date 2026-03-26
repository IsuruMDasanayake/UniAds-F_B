@extends('reports.layout')

@section('content')
    <div class="section-title">Application Insights</div>
    <div class="metrics-grid">
        <div class="metric-card">
            <div class="metric-value">{{ number_format($pendingCount) }}</div>
            <div class="metric-label">Pending</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">{{ number_format($contactedCount) }}</div>
            <div class="metric-label">Contacted</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">{{ number_format($totalCount) }}</div>
            <div class="metric-label">Total Submissions</div>
        </div>
    </div>

    @if($includeCharts && isset($chart_url))
        <div class="section-title">Status Distribution</div>
        <div class="chart-container">
            <img src="{{ $chart_url }}" class="chart-img">
        </div>
    @endif

    @if($detailedRecords)
        <div class="section-title">Detailed Applications List</div>
        <table>
            <thead>
                <tr>
                    <th>Student Name</th>
                    <th>Course Applied</th>
                    <th>Date Applied</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                @forelse($records as $record)
                    <tr>
                        <td>{{ $record->student_name }}</td>
                        <td>{{ $record->course_title }}</td>
                        <td>{{ \Carbon\Carbon::parse($record->applied_at)->format('Y-m-d') }}</td>
                        <td>{{ ucfirst($record->status) }}</td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="4" style="text-align: center;">No applications found in this period.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    @endif
@endsection
