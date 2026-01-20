<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Upcoming Events</title>
  <link rel="icon" type="image/x-icon" href="{{ asset('favicon.ico') }}">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"/>
  <link rel="stylesheet" href="{{ asset('css/feed.css') }}">
  <link rel="stylesheet" href="{{ asset('css/upcoming.css') }}">
</head>
<body>
@include('frontend.navbar')

<div class="events-container">
  
  <div class="events-grid">
   @forelse ($events as $event)
      <div class="event-card">
        <img src="{{ asset('storage/' . $event->event_image) }}" alt="{{ $event->event_title }}" class="event-image">
        <h3 class="event-title">{{ $event->event_title }}</h3>
        <button class="btn-secondary" onclick="openEventModal(
  '{{ asset('storage/' . $event->event_image) }}',
  `{{ addslashes($event->event_title) }}`,
  '{{ \Carbon\Carbon::parse($event->event_date)->format('F j, Y') }}',
  '{{ $event->sub_location }}',
  `{{ addslashes(strip_tags($event->event_description)) }}`,
  {{ $event->id }}  <!-- pass event ID here -->
)">See More About This Event</button>

      </div>
    @empty
      <p>No upcoming events available.</p>
    @endforelse
  </div>
</div>




<!-- Event Modal -->
<div id="eventModal" class="event-modal">
  <div class="event-modal-content">
    <span class="event-close-btn" onclick="closeEventModal()">&times;</span>
    <img id="eventImage" class="event-image" src="" alt="Event Image">
    <h3 id="eventTitle" class="event-title"></h3>
    <p id="eventDate" class="event-date"></p>
    <p id="eventLocation" class="event-location"></p>
    <p id="eventDescription" class="event-description"></p>
  </div>
</div>

<script>
  function openEventModal(image, title, date, location, description, eventId) {
    document.getElementById('eventImage').src = image;
    document.getElementById('eventTitle').textContent = title;
    document.getElementById('eventDate').innerHTML = `<strong>Date:</strong> ${date}`;
    document.getElementById('eventLocation').innerHTML = `<strong>Location:</strong> ${location}`;
    document.getElementById('eventDescription').textContent = description;
    document.getElementById('eventModal').style.display = 'flex';

    // Send view count update to Laravel
    if (eventId) {
        fetch(`/events/${eventId}/track-view`, {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        })
        .then(response => response.json())
        .then(data => {
            if(data.status === 'success'){
                console.log('Event view tracked');
            }
        })
        .catch(error => {
            console.error('Error tracking event view:', error);
        });
    }
}


  function closeEventModal() {
    document.getElementById('eventModal').style.display = 'none';
  }

  window.addEventListener('click', function (e) {
    const modal = document.getElementById('eventModal');
    if (e.target === modal) {
      closeEventModal();
    }
  });
</script>
<script src="{{ asset('js/navbar.js') }}"></script>
</body>
</html>
