<div class="upcoming-events-card">
    <div class="card-header">
        <h2>Upcoming Events</h2>
        <a href="/events">See all</a>
    </div>
    <div class="event-content">
        <!-- Each event will be a separate card -->

        @if ($events->isEmpty())
            <p> &nbsp; &nbsp; &nbsp;No upcoming events found.</p>
        @else
            @foreach ($events as $event)
                <div class="event">
                    <div class="event-image-wrapper">
                        <!-- Display Event Image -->
                        <img class="event-image" src="{{ asset('storage/' . $event->event_image) }}"
                            alt="{{ $event->event_title }}">
                    </div>
                    <div class="event-details">
                        <!-- Display Event Date -->
                        <div class="event-date">
                            <span>{{ \Carbon\Carbon::parse($event->event_date)->format('F j, Y') }}</span>
                            {{ $event->institute->institute_name }}
                        </div>

                        <!-- Display Event Title -->
                        <p class="event-title">{{ $event->event_title }}</p>

                        @php
                            $hasViewed = $event->views->isNotEmpty();
                        @endphp
                        <!-- Display Event Location -->
                        <p class="event-location">{{ $event->sub_location }}</p>

                        <div class="event-card" id="event-{{ $event->id }}">
                            <div class="event-actions">
                                <button class="btn-interested {{ $hasViewed ? 'interested' : '' }}"
                                    data-event-id="{{ $event->id }}"
                                    onclick="{{ $hasViewed ? '' : 'markInterest(this)' }}"
                                    {{ $hasViewed ? 'disabled' : '' }}>
                                    {{ $hasViewed ? 'Interested' : 'Interest' }}
                                </button>
                                {{-- <button class="btn-decline" data-event-id="{{ $event->id }}"
                                    onclick="markDecline(this)">
                                    Decline
                                </button> --}}
                            </div>
                        </div>

                    </div>
                </div>
            @endforeach
        @endif

        <!-- Add more events dynamically here -->
    </div>
</div>

<script>
    function markInterest(button) {
        const eventId = button.dataset.eventId;

        fetch(`/events/${eventId}/interest`, {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': '{{ csrf_token() }}',
                    'Content-Type': 'application/json',
                }
            })
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') {
                    button.innerText = 'Interested';
                    button.disabled = true;
                    button.classList.add('interested'); // Optional for styling
                }
            });
    }

    function markDecline(button) {
        const eventId = button.dataset.eventId;

        fetch(`/events/${eventId}/decline`, {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': '{{ csrf_token() }}',
                    'Content-Type': 'application/json',
                }
            })
            .then(res => res.json())
            .then(data => {
                if (data.status === 'declined') {
                    const eventCard = document.getElementById(`event-${eventId}`);
                    if (eventCard) {
                        eventCard.style.display = 'none';
                    }
                }
            })
            .catch(err => {
                console.error('Decline error:', err);
            });
    }
</script>
