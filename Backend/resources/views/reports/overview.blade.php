@extends('reports.layout')

@section('content')
    <div class="section-title">Key Performance Indicators</div>
    <div class="metrics-grid">
        <div class="metric-card">
            <div class="metric-value">{{ number_format($profileViews) }}</div>
            <div class="metric-label">Profile Views</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">{{ number_format($postViews) }}</div>
            <div class="metric-label">Post Engagements</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">{{ number_format($eventViews) }}</div>
            <div class="metric-label">Event Interest</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">{{ number_format($applications) }}</div>
            <div class="metric-label">Total Applications</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">{{ number_format($avgRating, 1) }}</div>
            <div class="metric-label">Avg. Rating</div>
        </div>
    </div>

    @if($includeCharts)
        <div class="section-title">Visual Insights</div>
        <div class="chart-container">
            <h4 style="margin-top: 0; color: #475569;">Views & Engagement Trends</h4>
            <img src="{{ $chart_url }}" class="chart-img">
            <p style="font-size: 11px; color: #94a3b8; margin-top: 10px;">
                * This chart visualization illustrates the performance trend for your profile and content over the specified period.
            </p>
        </div>
    @endif

    @if($detailedRecords)
        <div class="section-title">Detailed Metrics Breakdown</div>
        <table>
            <thead>
                <tr>
                    <th>Metric Category</th>
                    <th>Value / Total</th>
                    <th>Percentage (%)</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Institute Profile Visibility</td>
                    <td>{{ number_format($profileViews) }} Views</td>
                    <td>100%</td>
                </tr>
                <tr>
                    <td>Post Engagement</td>
                    <td>{{ number_format($postViews) }} Views/Clicks</td>
                    <td>{{ number_format(($postViews / (max(1, $profileViews + $postViews + $eventViews)) * 100), 1) }}%</td>
                </tr>
                <tr>
                    <td>Event Interest</td>
                    <td>{{ number_format($eventViews) }} Tracked Views</td>
                    <td>{{ number_format(($eventViews / (max(1, $profileViews + $postViews + $eventViews)) * 100), 1) }}%</td>
                </tr>
                <tr>
                    <td>User Conversion (Applications)</td>
                    <td>{{ number_format($applications) }} Applications</td>
                    <td>{{ number_format(($applications / (max(1, $profileViews + $postViews)) * 100), 1) }}%</td>
                </tr>
                <tr>
                    <td>Student Satisfaction</td>
                    <td>{{ number_format($avgRating, 1) }} / 5.0 Stars</td>
                    <td>{{ number_format(($avgRating / 5 * 100), 1) }}%</td>
                </tr>
            </tbody>
        </table>
    @endif
@endsection
