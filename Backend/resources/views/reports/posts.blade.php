@extends('reports.layout')

@section('content')
    <div class="section-title">Published Content Performance</div>
    <div class="metrics-grid">
        <div class="metric-card">
            <div class="metric-value">{{ number_format($totalPosts) }}</div>
            <div class="metric-label">Published Posts</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">{{ number_format($totalViews) }}</div>
            <div class="metric-label">Total Views</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">{{ $avgViewsPerPost }}</div>
            <div class="metric-label">Avg Views / Post</div>
        </div>
    </div>

    @if($includeCharts && isset($chart_url))
        <div class="section-title">Top 5 Performing Posts</div>
        <div class="chart-container">
            <img src="{{ $chart_url }}" class="chart-img">
        </div>
    @endif

    @if($detailedRecords)
        <div class="section-title">Individual Post Stats</div>
        <table>
            <thead>
                <tr>
                    <th>Title / Course Name</th>
                    <th>Views</th>
                    <th>Applications</th>
                    <th>Likes</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                @forelse($records as $post)
                    <tr>
                        <td>{{ $post->title }}</td>
                        <td style="font-weight: 700;">{{ number_format($post->views_count) }}</td>
                        <td style="font-weight: 700; color: #059669;">{{ number_format($post->apply_cases_count) }}</td>
                        <td style="color: #ef4444;">{{ number_format($post->likes_count) }}</td>
                        <td>{{ ucfirst($post->status) }}</td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="4" style="text-align: center;">No posts found.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    @endif
@endsection
