@include('frontend.profile.profile-view')

<!-- Main Content -->
<div class="main-content">
    <!-- Left Toggle Arrow -->
    <div class="left-toggle-arrow" onclick="toggleLeftSidebar()">
        <i class="material-icons">chevron_right</i>
    </div>

    <!-- Left Section: Institute Gallery -->
    @include('frontend.profile.institute-gallery')

    <!-- Center Section: Posts -->
    @include('frontend.profile.profile-posts')

    <!-- Right Toggle Arrow -->
    <div class="right-toggle-arrow" onclick="toggleRightSidebar()">
        <i class="material-icons">chevron_left</i>
    </div>

    <!-- Right Section: Events -->
    @include('frontend.profile.profile-events')
</div>
</div>



