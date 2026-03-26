@extends('reports.layout')

@section('content')
    <div class="section-title">Student Feedback Summary</div>
    <div class="metrics-grid">
        <div class="metric-card">
            <div class="metric-value">{{ number_format($avgRating, 1) }}</div>
            <div class="metric-label">Average Rating</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">{{ number_format($totalReviews) }}</div>
            <div class="metric-label">Total Reviews</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">{{ $reportedCount }}</div>
            <div class="metric-label">Reported</div>
        </div>
    </div>

    @if($includeCharts && isset($chart_url))
        <div class="section-title">Star Rating Distribution</div>
        <div class="chart-container">
            <img src="{{ $chart_url }}" class="chart-img">
        </div>
    @endif

    @if($detailedRecords)
        <div class="section-title">Recent Student Reviews</div>
        <table>
            <thead>
                <tr>
                    <th>Student Name</th>
                    <th>Rating</th>
                    <th>Comment</th>
                    <th>Date</th>
                </tr>
            </thead>
            <tbody>
                @forelse($records as $review)
                    <tr>
                        <td>{{ $review->user->name ?? 'Anonymous' }}</td>
                        <td style="color: #f59e0b; font-weight: 700;">{{ $review->rating }} / 5</td>
                        <td>{{ $review->comment }}</td>
                        <td>{{ $review->created_at->format('Y-m-d') }}</td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="4" style="text-align: center;">No reviews received in this period.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    @endif
@endsection
