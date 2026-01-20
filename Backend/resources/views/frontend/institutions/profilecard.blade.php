<div class="institutions-container">
    <div class="institutions-grid">
        @forelse($approvedInstitutes as $institute)
            <!-- Institution Card -->
            <div class="institution-box">
                <img 
                    src="{{ $institute->profile_photo ? asset('storage/' . $institute->profile_photo) : asset('images/default-logo.png') }}" 
                    alt="{{ $institute->institute_name }} Logo" 
                    class="institution-logo"
                >
                <div class="institution-details">
                    <h3 class="institution-name">{{ $institute->institute_name }}
                        @if($institute->is_premium && $institute->premium_expires_at && now()->lessThanOrEqualTo($institute->premium_expires_at))
                            <img src="{{ asset('images/verified-badge.png') }}" alt="Premium Verified" class="premium-badge" title="Premium Verified">
                        @endif
                    </h3>
                    <p class="institution-location"><strong>Location:</strong> {{ $institute->location }}</p>
                    <p class="institution-description">
                        {{ $institute->bio ? Str::limit($institute->bio, 100) : 'No description available.' }}
                    </p>
                </div>
                <div class="card-footer">    
                    <a href="{{ route('frontend.profile.institute-edit', ['id' => $institute->id]) }}" class="view-profile-btn">See Institute Profile</a>
                </div>
            </div>
        @empty
            <p>No approved institutions available at the moment.</p>
        @endforelse
    </div>
    
</div>

<script>
    document.addEventListener("DOMContentLoaded", () => {
    const boxes = document.querySelectorAll(".institution-box");

    const observer = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("appear");
                    entry.target.style.transitionDelay = `${0.1 * index}s`; // Add delay based on order
                    observer.unobserve(entry.target); // Stop observing once it appears
                }
            });
        },
        {
            threshold: 0.1, // Trigger when 10% of the card is visible
        }
    );

    boxes.forEach((box) => observer.observe(box));
});

</script>