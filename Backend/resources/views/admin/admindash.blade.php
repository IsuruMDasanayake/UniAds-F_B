<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard</title>
    <link rel="icon" type="image/x-icon" href="{{ asset('favicon.ico') }}">
    <!-- Favicon -->

    <!-- Custom styles -->

    <link rel="stylesheet" href="{{ asset('admin/css/style.css') }}">
    <link rel="stylesheet" href="{{ asset('admin/css/admindash.css') }}">
    <link rel="stylesheet" href="{{ asset('css/feed.css') }}">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>

<body>

    <!-- ! Body -->

    <div class="page-flex">
        @include('admin.sidebar')


        <div class="main-wrapper">
            <!-- ! Main nav -->
            @include('admin.mainnavbar')

            <!-- Dashboard Stats Section -->
            <div class="dashboard-container">
                <!-- Stats Section -->
                <div class="stats-row">
                    <div class="stats-card">
                        <div class="card-icon"><i class="fas fa-users"></i></div>
                        <div class="card-content">
                            <h3>👤 Registered Users</h3>
                            <p>{{ $userCount }}</p>
                        </div>
                    </div>

                    <div class="stats-card">
                        <div class="card-icon"><i class="fas fa-building"></i></div>
                        <div class="card-content">
                            <h3>🏫 Registered Institutes</h3>
                            <p>{{ $instituteCount }}</p>
                        </div>
                    </div>

                    <div class="stats-card">
                        <div class="card-icon"><i class="fas fa-chart-line"></i></div>
                        <div class="card-content">
                            <h3>📝 Posts Count</h3>
                            <p>{{ $postCount }}</p>
                        </div>
                    </div>

                    <div class="stats-card">
                        <div class="card-icon"><i class="fas fa-eye"></i></div>
                        <div class="card-content">
                            <h3>📅 Event Count</h3>
                            <p>{{ $eventCount }}</p>
                        </div>
                    </div>

                    <!-- New Cards -->
                    <div class="stats-card">
                        <div class="card-icon"><i class="fas fa-globe"></i></div>
                        <div class="card-content">
                            <h3>🌍 Total Site Views</h3>
                            <p>{{ $siteViews }}</p>
                        </div>
                    </div>

                    <div class="stats-card">
                        <div class="card-icon"><i class="fas fa-user-friends"></i></div>
                        <div class="card-content">
                            <h3>👥 Total Followers</h3>
                            <p>{{ $followersCount }}</p>
                        </div>
                    </div>

                    <div class="stats-card">
                        <div class="card-icon"><i class="fas fa-credit-card"></i></div>
                        <div class="card-content">
                            <h3>💳 Subscriptions</h3>
                            <p>{{ $subscriptionsCount }}</p>
                        </div>
                    </div>

                    <div class="stats-card">
                        <div class="card-icon"><i class="fas fa-paper-plane"></i></div>
                        <div class="card-content">
                            <h3>📄 Course Applications</h3>
                            <p>{{ $courseApplications }}</p>
                        </div>
                    </div>

                    <div class="stats-card">
                        <div class="card-icon"><i class="fas fa-book"></i></div>
                        <div class="card-content">
                            <h3>📚 Active Courses</h3>
                            <p>{{ $activeCourses }}</p>
                        </div>
                    </div>

                    <div class="stats-card">
                        <div class="card-icon"><i class="fas fa-star"></i></div>
                        <div class="card-content">
                            <h3>⭐ Average Rating</h3>
                            <p>{{ number_format($averageRating, 1) }}/5</p>
                        </div>
                    </div>

                    <div class="stats-card">
                        <div class="card-icon"><i class="fas fa-comments"></i></div>
                        <div class="card-content">
                            <h3>💬 Reviews Received</h3>
                            <p>{{ $reviewsCount }}</p>
                        </div>
                    </div>
                </div>


                <!-- Charts Section -->


                <!-- User Count Chart -->
                <div class="chart-card">
                    <div style="flex: 1; min-width: 300px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <h4 class="chart-title">👤 Users Over Time</h4>
                            <select id="userTimeRange" onchange="loadUserChart()" style="margin-bottom: 10px;">
                                <option value="7">Last 7 Days</option>
                                <option value="30" selected>Last 30 Days</option>
                                <option value="90">Last 90 Days</option>
                            </select>
                        </div>
                        <canvas id="userChart" style="max-height: 300px;"></canvas>
                    </div>
                </div>

                <!-- Institute Count Chart -->
                <div class="chart-card">
                    <div style="flex: 1; min-width: 300px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <h4 class="chart-title">🏫 Institutes Over Time</h4>
                            <select id="instituteTimeRange" onchange="loadInstituteChart()"
                                style="margin-bottom: 10px;">
                                <option value="7">Last 7 Days</option>
                                <option value="30" selected>Last 30 Days</option>
                                <option value="90">Last 90 Days</option>
                            </select>
                        </div>
                        <canvas id="instituteChart" style="max-height: 300px;"></canvas>
                    </div>
                </div>

                <!-- Post Count Chart -->
                <div class="chart-card">
                    <div style="flex: 1; min-width: 300px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <h4 class="chart-title">📝 Posts Over Time</h4>
                            <select id="postTimeRange" onchange="loadPostChart()" style="margin-bottom: 10px;">
                                <option value="7">Last 7 Days</option>
                                <option value="30" selected>Last 30 Days</option>
                                <option value="90">Last 90 Days</option>
                            </select>
                        </div>
                        <canvas id="postChart" style="max-height: 300px;"></canvas>
                    </div>
                </div>

                <!-- Event Count Chart -->
                <div class="chart-card">
                    <div style="flex: 1; min-width: 300px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <h4 class="chart-title">📅 Events Over Time</h4>
                            <select id="eventTimeRange" onchange="loadEventChart()" style="margin-bottom: 10px;">
                                <option value="7">Last 7 Days</option>
                                <option value="30" selected>Last 30 Days</option>
                                <option value="90">Last 90 Days</option>
                            </select>
                        </div>
                        <canvas id="eventChart" style="max-height: 300px;"></canvas>
                    </div>
                </div>

                <!-- Site Views -->
                <div class="chart-card">
                    <div style="flex: 1; min-width: 300px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <h4 class="chart-title">🌍 Site Views Over Time</h4>
                            <select id="siteViewsTimeRange" onchange="loadSiteViewsChart()"
                                style="margin-bottom: 10px;">
                                <option value="7">Last 7 Days</option>
                                <option value="30" selected>Last 30 Days</option>
                                <option value="90">Last 90 Days</option>
                            </select>
                        </div>
                        <canvas id="siteViewsChart" style="max-height: 300px;"></canvas>
                    </div>
                </div>

                <!-- Followers -->
                <div class="chart-card">
                    <div style="flex: 1; min-width: 300px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <h4 class="chart-title">👥 Followers Over Time</h4>
                            <select id="followersTimeRange" onchange="loadFollowersChart()"
                                style="margin-bottom: 10px;">
                                <option value="7">Last 7 Days</option>
                                <option value="30" selected>Last 30 Days</option>
                                <option value="90">Last 90 Days</option>
                            </select>
                        </div>
                        <canvas id="followersChart" style="max-height: 300px;"></canvas>
                    </div>
                </div>

                <!-- Subscriptions -->
                <div class="chart-card">
                    <div style="flex: 1; min-width: 300px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <h4 class="chart-title">💳 Subscriptions Over Time</h4>
                            <select id="subscriptionsTimeRange" onchange="loadSubscriptionsChart()"
                                style="margin-bottom: 10px;">
                                <option value="7">Last 7 Days</option>
                                <option value="30" selected>Last 30 Days</option>
                                <option value="90">Last 90 Days</option>
                            </select>
                        </div>
                        <canvas id="subscriptionsChart" style="max-height: 300px;"></canvas>
                    </div>
                </div>

                <!-- Course Applications -->
                <div class="chart-card">
                    <div style="flex: 1; min-width: 300px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <h4 class="chart-title">📩 Course Applications</h4>
                            <select id="applicationsTimeRange" onchange="loadApplicationsChart()"
                                style="margin-bottom: 10px;">
                                <option value="7">Last 7 Days</option>
                                <option value="30" selected>Last 30 Days</option>
                                <option value="90">Last 90 Days</option>
                            </select>
                        </div>
                        <canvas id="applicationsChart" style="max-height: 300px;"></canvas>
                    </div>
                </div>

                <!-- Active Courses -->
                <div class="chart-card">
                    <div style="flex: 1; min-width: 300px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <h4 class="chart-title">📚 Active Courses Over Time</h4>
                            <select id="activeCoursesTimeRange" onchange="loadActiveCoursesChart()"
                                style="margin-bottom: 10px;">
                                <option value="7">Last 7 Days</option>
                                <option value="30" selected>Last 30 Days</option>
                                <option value="90">Last 90 Days</option>
                            </select>
                        </div>
                        <canvas id="activeCoursesChart" style="max-height: 300px;"></canvas>
                    </div>
                </div>

                <!-- Average Rating -->
                <div class="chart-card">
                    <div style="flex: 1; min-width: 300px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <h4 class="chart-title">⭐ Average Rating</h4>
                            <select id="ratingTimeRange" onchange="loadRatingChart()" style="margin-bottom: 10px;">
                                <option value="7">Last 7 Days</option>
                                <option value="30" selected>Last 30 Days</option>
                                <option value="90">Last 90 Days</option>
                            </select>
                        </div>
                        <canvas id="ratingChart" style="max-height: 300px;"></canvas>
                    </div>
                </div>

                <!-- Reviews Count -->
                <div class="chart-card">
                    <div style="flex: 1; min-width: 300px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <h4 class="chart-title">💬 Reviews Over Time</h4>
                            <select id="reviewsTimeRange" onchange="loadReviewsChart()" style="margin-bottom: 10px;">
                                <option value="7">Last 7 Days</option>
                                <option value="30" selected>Last 30 Days</option>
                                <option value="90">Last 90 Days</option>
                            </select>
                        </div>
                        <canvas id="reviewsChart" style="max-height: 300px;"></canvas>
                    </div>
                </div>

            </div>

        </div>

        <!-- Chart.js -->
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <script src="{{ asset('js/dropdown.js') }}"></script>
        <script>
            const labels = @json($labels);

            // Chart data mapping
            const metrics = {
                userChart: @json($userCounts),
                instituteChart: @json($instituteCounts),
                postChart: @json($postCounts),
                eventChart: @json($eventCounts),
                siteViewsChart: @json($siteViewsCounts),
                followersChart: @json($followersCounts),
                subscriptionsChart: @json($subscriptionsCounts),
                applicationsChart: @json($applicationsCounts),
                activeCoursesChart: @json($activeCoursesCounts),
                ratingChart: @json($ratingsCounts),
                reviewsChart: @json($reviewsCounts)
            };

            // Create charts dynamically
            Object.keys(metrics).forEach(id => {
                const ctx = document.getElementById(id).getContext('2d');
                new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: document.getElementById(id).previousElementSibling.querySelector(
                                'h4').innerText,
                            data: metrics[id],
                            borderColor: 'rgba(54, 162, 235, 1)',
                            fill: false,
                            tension: 0.3
                        }]
                    },
                    options: {
                        responsive: true,
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                });
            });

            function updateChart(chartId, data) {
                const ctx = document.getElementById(chartId).getContext('2d');
                if (window[chartId]) window[chartId].destroy(); // destroy previous chart
                window[chartId] = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: document.getElementById(chartId).previousElementSibling.querySelector('h4')
                                .innerText,
                            data: data,
                            borderColor: 'rgba(54, 162, 235, 1)',
                            fill: false,
                            tension: 0.3
                        }]
                    },
                    options: {
                        responsive: true,
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                });
            }
        </script>

    </div>
    </div>


</body>

</html>
