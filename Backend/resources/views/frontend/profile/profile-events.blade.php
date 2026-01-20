<div class="right-section">
    <h3>Events</h3><br>
    @if ($events->isEmpty())
        <p>No events at the moment.</p>
    @else
        @foreach ($events as $event)
            <div class="event-card">
                <!-- Event Image -->
                <div class="event-image-wrapper">
                    <img src="{{ $event->event_image ? asset('storage/' . $event->event_image) : asset('images/default-event.png') }}"
                        alt="Event Image" class="event-image">
                </div>

                <!-- Event Details -->
                <div class="event-details">
                    <h3 class="event-title">{{ $event->event_title }}</h3>
                    <p class="event-date"><strong>Date:</strong> {{ $event->event_date->format('F d, Y') }}</p>
                    <p class="event-location"><strong>Location:</strong> {{ $event->main_location }}</p>
                    <p class="event-sub-location">{{ $event->sub_location }}</p>

                    <!-- Action Buttons -->
                    @if (Auth::check() && Auth::user()->id === $event->institute->user_id)
                        <div class="event-actions">
                            <!-- Edit Event Button -->

                            <button class="edit-event-btn"
                                onclick="openEditEventModal('{{ route('events.edit', $event->id) }}')">✏️</button>

                            <!-- Delete Event Button -->
                            <button class="delete-event-btn"
                                onclick="openDeleteEventModal({{ $event->id }}, '{{ route('events.destroy', $event->id) }}')">
                                🗑️
                            </button>
                        </div>
                    @endif
                </div>
            </div>
        @endforeach
    @endif
    <!-- Pagination Links -->
    <div class="pagination-links">
        {{ $events->links('vendor.pagination.custom') }}
    </div>
</div>



<!-- Edit Event Modal -->
<div id="editEventModal" class="modal">
    <div class="modal-overlay" onclick="closeEditEventModal()"></div>
    <div class="modal-content">
        <span class="close-btn" onclick="closeEditEventModal()">×</span>
        <h3 class="modal-title">Edit Event</h3>

        <form id="editEventForm" method="POST" action="/events/{id}" enctype="multipart/form-data">
            @csrf
            @method('PUT')

            <div class="form-group">
                <label for="edit-event-title">Title:</label>
                <input type="text" id="edit-event-title" name="event_title" required>
            </div>
            <div class="form-group">
                <label for="edit-event-description">Description:</label>
                <textarea id="edit-event-description" name="event_description" required></textarea>
            </div>
            <div class="form-group">
                <label for="edit-event-date">Date:</label>
                <input type="date" id="edit-event-date" name="event_date" required>
            </div>
            <div class="form-group">
                <label for="edit-event-sub-location">Location:</label>
                <input type="text" id="edit-event-sub-location" name="sub_location">
            </div>
            <div class="form-group">
                <label for="edit-event-main-location">Sub Location:</label>
                <input type="text" id="edit-event-main-location" name="main_location">
            </div>

            <div class="form-group">
                <label for="edit-event-image">Event Image (Max 2MB):</label>
                <input type="file" id="edit-event-image" name="event_image">
                <img id="edit-event-image-preview" style="display:none;" alt="Preview" width="200" />
            </div>

            <div class="modal-actions">
                <button type="submit" class="btn btn-primary">Update Event</button>
                <button type="button" class="btn btn-cancel" onclick="closeEditEventModal()">Cancel</button>
            </div>
        </form>
    </div>
</div>







{{-- delete confirm model --}}
<div id="deleteEventModal" class="delete-modal">
    <div class="modal-overlay" onclick="closeDeleteEventModal()"></div>
    <div class="delete-modal-content">
        <span class="delete-close-btn" onclick="closeDeleteEventModal()"></span>
        <h3>Confirm Deletion</h3>
        <p>Are you sure you want to delete this event?</p>

        <div class="delete-modal-actions">
            <button type="button" class="delete-btn" id="confirmDeleteEventBtn">Delete</button>
            <button type="button" class="cancel-btn" onclick="closeDeleteEventModal()">Cancel</button>
        </div>
    </div>
</div>





<script>
    // Open the Edit Event Modal and load event data
    // Open the Edit Event Modal and load event data
    function openEditEventModal(editUrl) {
        fetch(editUrl)
            .then(response => response.json())
            .then(event => {
                // Fill form fields with event data
                document.getElementById('edit-event-title').value = event.event_title;
                document.getElementById('edit-event-description').value = event.event_description;
                document.getElementById('edit-event-date').value = event.event_date;
                document.getElementById('edit-event-sub-location').value = event.sub_location;
                document.getElementById('edit-event-main-location').value = event.main_location;

                // Show the current image preview (if available)
                if (event.event_image) {
                    const preview = document.getElementById('edit-event-image-preview');
                    preview.src = `/storage/${event.event_image}`;
                    preview.style.display = 'block';
                } else {
                    document.getElementById('edit-event-image-preview').style.display = 'none';
                }

                // Set the form action URL for updating the event
                document.getElementById('editEventForm').action = `/events/${event.id}`;

                // Show the modal
                document.getElementById('editEventModal').style.display = 'flex';
            })
            .catch(error => console.error('Error loading event:', error));
    }

    // Close the Edit Event Modal
    function closeEditEventModal() {
        document.getElementById('editEventModal').style.display = 'none';
    }





    // Handle event image preview when a new image is selected
    document.getElementById('edit-event-image').addEventListener('change', function(event) {
        const file = event.target.files[0];
        const preview = document.getElementById('edit-event-image-preview');

        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                preview.src = e.target.result;
                preview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        } else {
            preview.style.display = 'none';
        }
    });





    // Function to open the delete modal
    function openDeleteEventModal(eventId, deleteUrl) {
        const confirmDeleteBtn = document.getElementById('confirmDeleteEventBtn');

        // Attach the delete action
        confirmDeleteBtn.onclick = function() {
            handleEventDeletion(eventId, deleteUrl);
        };

        // Show the modal
        document.getElementById('deleteEventModal').style.display = 'flex';
    }

    // Function to close the delete modal
    function closeDeleteEventModal() {
        document.getElementById('deleteEventModal').style.display = 'none';
    }

    // Function to handle event deletion
    function handleEventDeletion(eventId, deleteUrl) {
        fetch(deleteUrl, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                },
                body: JSON.stringify({
                    id: eventId
                })
            })
            .then(response => response.json().then(data => ({
                status: response.status,
                data
            })))
            .then(({
                status,
                data
            }) => {
                if (status >= 200 && status < 300) {

                    location.reload(); // Refresh to update the UI
                } else {
                    console.error('Error Response:', data);
                    alert('Failed to delete the event. Please try again.');
                }
            })
            .catch(error => {
                console.error('Fetch Error:', error);
                alert('An error occurred while deleting the event.');
            })
            .finally(() => {
                closeDeleteEventModal();
            });
    }
</script>
