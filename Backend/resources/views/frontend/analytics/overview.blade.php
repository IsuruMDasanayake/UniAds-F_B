<div class="card-section" id="overview-section" style="display: none;">

    <h2 class="section-title">Overview Stats 📊</h2>

    <div class="stats-grid">
        <div class="stat-card">
            <div class="stat-icon"><i class="fas fa-eye"></i></div>
            <div class="stat-info">
                <div class="stat-number">{{ number_format($overviewStats['profile_views']) }}</div>
                <div class="stat-label">Profile Views</div>
            </div>
        </div>

        <div class="stat-card">
            <div class="stat-icon"><i class="fas fa-file-alt"></i></div>
            <div class="stat-info">
                <div class="stat-number">{{ number_format($overviewStats['post_views']) }}</div>
                <div class="stat-label">Post Views</div>
            </div>
        </div>

        <div class="stat-card">
            <div class="stat-icon"><i class="fas fa-users"></i></div>
            <div class="stat-info">
                <div class="stat-number">{{ number_format($overviewStats['followers']) }}</div>
                <div class="stat-label">Followers</div>
            </div>
        </div>

        <div class="stat-card">
            <div class="stat-icon"><i class="fas fa-file-signature"></i></div>
            <div class="stat-info">
                <div class="stat-number">{{ number_format($overviewStats['course_applications']) }}</div>
                <div class="stat-label">Course Applications</div>
            </div>
        </div>

        <div class="stat-card">
            <div class="stat-icon"><i class="fas fa-star"></i></div>
            <div class="stat-info">
                <div class="stat-number">{{ number_format($overviewStats['reviews_with_comments_count']) }}</div>
                <div class="stat-label">Reviews Received</div>
            </div>
        </div>

        <div class="stat-card">
            <div class="stat-icon"><i class="fas fa-calendar-alt"></i></div>
            <div class="stat-info">
                <div class="stat-number">{{ number_format($overviewStats['event_views']) }}</div>
                <div class="stat-label">Event Views</div>
            </div>
        </div>

        <div class="stat-card">
            <div class="stat-icon"><i class="fas fa-book-open"></i></div>
            <div class="stat-info">
                <div class="stat-number">{{ number_format($overviewStats['active_courses']) }}</div>
                <div class="stat-label">Active Courses</div>
            </div>
        </div>

        <div class="stat-card">
            <div class="stat-icon"><i class="fas fa-thumbs-up"></i></div>
            <div class="stat-info">
                <div class="stat-number">{{ $overviewStats['average_rating'] }}</div>
                <div class="stat-label">Average Rating</div>
            </div>
        </div>


    </div>

</div>
