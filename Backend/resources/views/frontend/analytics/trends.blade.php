<div class="card-section" id="trends-section" style="display: none;">
    <h2 class="section-title">Trends Over Time 📈</h2>

    <!-- First row: Post Views & Event Views -->
    <div style="display: flex; flex-wrap: wrap; gap: 30px;">
        <!-- Post Views Chart Box -->
        <div style="flex: 1; min-width: 300px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <h4 class="chart-title">📘 Post Views Over Time</h4>
                <select id="postTimeRange" onchange="loadPostViewsChart()" style="margin-bottom: 10px;">
                    <option value="7">Last 7 Days</option>
                    <option value="30" selected>Last 30 Days</option>
                    <option value="90">Last 90 Days</option>
                </select>
            </div>
            <canvas id="postViewsChart" style="max-height: 300px;"></canvas>
        </div>

        <!-- Event Views Chart Box -->
        <div style="flex: 1; min-width: 300px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <h4 class="chart-title">📅 Event Views Over Time</h4>
                <select id="eventTimeRange" onchange="loadEventViewsChart()" style="margin-bottom: 10px;">
                    <option value="7">Last 7 Days</option>
                    <option value="30" selected>Last 30 Days</option>
                    <option value="90">Last 90 Days</option>
                </select>
            </div>
            <canvas id="eventViewsChart" style="max-height: 300px;"></canvas>
        </div>
    </div>

    <!-- Second row: Profile Views & Course Applications -->
<div style="display: flex; flex-wrap: wrap; gap: 30px; margin-top: 40px;">
    <!-- Profile Views Chart Box -->
    <div style="flex: 1; min-width: 300px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <h4 class="chart-title">👤 Profile Views Over Time</h4>
            <select id="profileTimeRange" onchange="loadProfileViewsChart()" style="margin-bottom: 10px;">
                <option value="7">Last 7 Days</option>
                <option value="30" selected>Last 30 Days</option>
                <option value="90">Last 90 Days</option>
            </select>
        </div>
        <canvas id="profileViewsChart" style="max-height: 300px;"></canvas>

        <!-- Followers Chart Nested Below -->
        <div style="margin-top: 40px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <h4 class="chart-title">🧍 Followers Over Time</h4>
                <select id="followersTimeRange" onchange="loadFollowersChart()" style="margin-bottom: 10px;">
                    <option value="7">Last 7 Days</option>
                    <option value="30" selected>Last 30 Days</option>
                    <option value="90">Last 90 Days</option>
                </select>
            </div>
            <canvas id="followersChart" style="max-height: 300px;"></canvas>
        </div>
    </div>

    <!-- Course Applications Chart Box -->
    <div style="flex: 1; min-width: 300px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <h4 class="chart-title">🎓 Course Applications Over Time</h4>
            <select id="applicationTimeRange" onchange="loadCourseApplicationsChart()" style="margin-bottom: 10px;">
                <option value="7">Last 7 Days</option>
                <option value="30" selected>Last 30 Days</option>
                <option value="90">Last 90 Days</option>
            </select>
        </div>
        <canvas id="courseApplicationsChart" style="max-height: 300px;"></canvas>
    </div>
</div>


</div>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
let postViewsChart, eventViewsChart, profileViewsChart, courseApplicationsChart, followersChart;

function loadPostViewsChart() {
    const days = document.getElementById('postTimeRange').value;
    fetch(`/analytics/post-views-trends?days=${days}`)
        .then(res => res.json())
        .then(data => {
            if (postViewsChart) postViewsChart.destroy();
            const ctx = document.getElementById('postViewsChart').getContext('2d');
            postViewsChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data.labels,
                    datasets: [{
                        label: 'Post Views',
                        data: data.counts,
                        borderColor: 'rgba(54, 162, 235, 1)',
                        fill: false,
                        tension: 0.3
                    }]
                },
                options: { responsive: true, scales: { y: { beginAtZero: true } } }
            });
        });
}

function loadEventViewsChart() {
    const days = document.getElementById('eventTimeRange').value;
    fetch(`/analytics/event-views-trends?days=${days}`)
        .then(res => res.json())
        .then(data => {
            if (eventViewsChart) eventViewsChart.destroy();
            const ctx = document.getElementById('eventViewsChart').getContext('2d');
            eventViewsChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data.labels,
                    datasets: [{
                        label: 'Event Views',
                        data: data.counts,
                        borderColor: 'rgba(255, 99, 132, 1)',
                        fill: false,
                        tension: 0.3
                    }]
                },
                options: { responsive: true, scales: { y: { beginAtZero: true } } }
            });
        });
}

function loadProfileViewsChart() {
    const days = document.getElementById('profileTimeRange').value;
    fetch(`/analytics/profile-views-trends?days=${days}`)
        .then(res => res.json())
        .then(data => {
            if (profileViewsChart) profileViewsChart.destroy();
            const ctx = document.getElementById('profileViewsChart').getContext('2d');
            profileViewsChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data.labels,
                    datasets: [{
                        label: 'Profile Views',
                        data: data.counts,
                        borderColor: 'rgba(75, 192, 192, 1)',
                        fill: false,
                        tension: 0.3
                    }]
                },
                options: { responsive: true, scales: { y: { beginAtZero: true } } }
            });
        });
}

function loadCourseApplicationsChart() {
    const days = document.getElementById('applicationTimeRange').value;
    fetch(`/analytics/course-applications-trends?days=${days}`)
        .then(res => res.json())
        .then(data => {
            if (courseApplicationsChart) courseApplicationsChart.destroy();
            const ctx = document.getElementById('courseApplicationsChart').getContext('2d');
            courseApplicationsChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data.labels,
                    datasets: [{
                        label: 'Course Applications',
                        data: data.counts,
                        borderColor: 'rgba(255, 206, 86, 1)',
                        fill: false,
                        tension: 0.3
                    }]
                },
                options: { responsive: true, scales: { y: { beginAtZero: true } } }
            });
        });
}


function loadFollowersChart() {
    const days = document.getElementById('followersTimeRange').value;

    fetch(`/analytics/followers-trends?days=${days}`)
        .then(res => res.json())
        .then(data => {
            if (followersChart) followersChart.destroy();

            const ctx = document.getElementById('followersChart').getContext('2d');
            followersChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data.labels,
                    datasets: [{
                        label: 'Followers',
                        data: data.counts,
                        borderColor: 'rgba(153, 102, 255, 1)',
                        fill: false,
                        tension: 0.3
                    }]
                },
                options: {
                    responsive: true,
                    scales: { y: { beginAtZero: true } }
                }
            });
        });
}

document.addEventListener('DOMContentLoaded', () => {
    loadPostViewsChart();
    loadEventViewsChart();
    loadProfileViewsChart();
    loadCourseApplicationsChart();
    loadFollowersChart();
});
</script>
