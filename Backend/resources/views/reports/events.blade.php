@extends('reports.layout')

@section('content')
    <div class="section-title">Event Engagement Overview</div>
    <div class="metrics-grid">
        <div class="metric-card">
            <div class="metric-value">{{ number_format($totalEvents) }}</div>
            <div class="metric-label">Total Events</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">{{ number_format($totalViews) }}</div>
            <div class="metric-label">Views</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">{{ number_format($totalInterested) }}</div>
            <div class="metric-label">Interested</div>
        </div>
    </div>

    @if($includeCharts && isset($chart_url))
        <div class="section-title">Views vs Interest Comparison</div>
        <div class="chart-container">
            <img src="{{ $chart_url }}" class="chart-img">
        </div>
    @endif

    @if($detailedRecords)
        <div class="section-title">Event-by-Event Performance</div>
        <table>
            <thead>
                <tr>
                    <th>Event Title</th>
                    <th>Event Date</th>
                    <th>Views</th>
                    <th>Interested</th>
                    <th>Declined</th>
                </tr>
            </thead>
            <tbody>
                @forelse($records as $event)
                    <tr>
                        <td>{{ $event->event_title }}</td>
                        <td>{{ \Carbon\Carbon::parse($event->event_date)->format('Y-m-d') }}</td>
                        <td style="font-weight: 700;">{{ number_format($event->view_count) }}</td>
                        <td style="color: #059669; font-weight: 700;">{{ number_format($event->interested_count) }}</td>
                        <td style="color: #dc2626;">{{ number_format($event->decline_count) }}</td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="5" style="text-align: center;">No events recorded in this period.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    @endif
@endsection
