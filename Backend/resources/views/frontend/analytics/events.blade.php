<!-- CSRF Token -->
<meta name="csrf-token" content="{{ csrf_token() }}">

<div class="card-section" id="events-section" style="display: none;">
    <h2 class="section-title flex justify-between items-center">
        Event Engagement 📅
        <input
            type="text"
            id="eventSearch"
            placeholder="Search events..."
            class="border border-gray-300 rounded px-3 py-2 w-full md:w-1/3 text-sm"
        />
    </h2>

    <div class="overflow-x-auto mt-6">
        <table class="min-w-full divide-y divide-gray-200 rounded-lg shadow-sm">
            <thead class="bg-blue-600">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Event Title</th>
                    <th class="px-6 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider">Views</th>
                    <th class="px-6 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider">Interest</th>
                    <th class="px-6 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider">Status</th>
                    <th class="px-6 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider">Created</th>
                    <th class="px-6 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider">Action</th>
                    <th class="px-6 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider">Boost</th>
                    <th class="px-6 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider">Make Ad</th>
                </tr>
            </thead>
            <tbody id="eventTableBody" class="bg-white divide-y divide-gray-200">
                @forelse($events as $event)
                    <tr class="hover:bg-gray-50 transition event-row">
                        <td class="px-6 py-4 text-sm text-gray-900 font-medium event-title">
                            {{ $event->event_title }}
                        </td>
                        <td class="px-6 py-4 text-center text-sm text-gray-700">
                            {{ $event->view_count }}
                        </td>
                        <td class="px-6 py-4 text-center text-sm text-gray-700">
                            {{ $event->interested_count }}
                        </td>
                        <td class="px-6 py-4 text-center text-sm">
                            <span id="event-status-text-{{ $event->id }}"
                                  class="font-semibold {{ $event->is_active ? 'text-green-600' : 'text-red-600' }}">
                                {{ $event->is_active ? 'Active' : 'Inactive' }}
                            </span>
                        </td>
                        <td class="px-6 py-4 text-center text-sm text-gray-600">
                            {{ $event->created_at->format('F j, Y') }}
                        </td>
                        <td class="px-6 py-4 text-center">
                            <button
                                onclick="toggleEventStatus({{ $event->id }}, this)"
                                class="text-xs font-semibold text-white px-4 py-2 rounded 
                                    {{ $event->is_active ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600' }}">
                                {{ $event->is_active ? 'Deactivate' : 'Activate' }}
                            </button>
                        </td>
                        <td class="px-6 py-4 text-center">
                            <button onclick="openEventBoostModal({{ $event->id }}, '{{ addslashes($event->event_title) }}')" class="bg-yellow-500 hover:bg-yellow-600 text-white text-xs px-3 py-2 rounded">
                                Boost
                            </button>
                        </td>
                        <td class="px-6 py-4 text-center">
                            <button onclick="openEventAdModal({{ $event->id }}, '{{ addslashes($event->event_title) }}')"
                                    class="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-2 rounded">
                                Create
                            </button>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="7" class="text-center text-gray-500 py-4">No events found for your institute.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>
</div>


<!-- Boost Modal for Events -->
<div id="eventBoostModal" class="fixed inset-0 z-[1001] hidden flex items-center justify-center bg-black bg-opacity-60">
  <div class="bg-white w-full max-w-md rounded-lg shadow-lg p-6 relative">
    <button class="absolute top-2 right-3 text-gray-600 hover:text-black text-xl" onclick="closeEventBoostModal()">&times;</button>

    <h2 class="text-2xl font-bold mb-3 text-center text-blue-700">Boost Your Event</h2>

    <p class="text-sm text-gray-600 mb-4 text-center leading-relaxed">
      Boost Function is currently under development. We will notify you once it is available.
    </p>

    {{-- 
    <h3 class="text-md font-semibold text-gray-800 mb-2 text-center">Choose Boost Duration</h3>

    <div class="grid grid-cols-2 gap-4 text-center">
      <div class="border border-blue-500 rounded-lg p-4 cursor-pointer hover:bg-blue-50" onclick="submitEventBoost(7, 490)">
        <p class="font-bold text-lg text-blue-600">7 Days</p>
        <p class="text-sm text-gray-700">LKR 490</p>
      </div>
      <div class="border border-blue-500 rounded-lg p-4 cursor-pointer hover:bg-blue-50" onclick="submitEventBoost(14, 890)">
        <p class="font-bold text-lg text-blue-600">14 Days</p>
        <p class="text-sm text-gray-700">LKR 890</p>
      </div>
      <div class="border border-blue-500 rounded-lg p-4 cursor-pointer hover:bg-blue-50" onclick="submitEventBoost(21, 1290)">
        <p class="font-bold text-lg text-blue-600">21 Days</p>
        <p class="text-sm text-gray-700">LKR 1290</p>
      </div>
      <div class="border border-blue-500 rounded-lg p-4 cursor-pointer hover:bg-blue-50" onclick="submitEventBoost(28, 1590)">
        <p class="font-bold text-lg text-blue-600">28 Days</p>
        <p class="text-sm text-gray-700">LKR 1590</p>
      </div>
    </div>
    --}}
  </div>
</div>


<!-- Create Ad Modal for Event -->
<div id="eventAdModal" class="fixed inset-0 z-[1001] hidden items-center justify-center bg-black bg-opacity-60">
  <div class="bg-white w-full max-w-md rounded-lg shadow-lg p-6 relative">
    <button class="absolute top-2 right-3 text-gray-600 hover:text-black text-xl" onclick="closeEventAdModal()">&times;</button>

    <h2 class="text-xl font-bold mb-4 text-center text-indigo-600">Create Ad for Event</h2>

    <p class="text-sm text-gray-700 mb-6 text-center leading-relaxed">
      Ads Function is currently under development. We will notify you once it is available.
    </p>

    {{-- <div class="flex justify-center">
        <button onclick="closeEventAdModal()" class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded">
            Close
        </button>
    </div> --}}
  </div>
</div>



<script>
    // Toggle event status
    function toggleEventStatus(eventId, button) {
        fetch(`/events/${eventId}/toggle-status`, {
            method: 'PATCH',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                'Accept': 'application/json'
            }
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                const newStatus = data.new_status;
                const statusSpan = document.getElementById(`event-status-text-${eventId}`);
                statusSpan.textContent = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
                statusSpan.className = 'font-semibold ' + (newStatus === 'active' ? 'text-green-600' : 'text-red-600');
                button.textContent = newStatus === 'active' ? 'Deactivate' : 'Activate';
                button.className =
                    'text-xs font-semibold text-white px-4 py-2 rounded ' +
                    (newStatus === 'active' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600');
            } else {
                alert('Failed to update status.');
            }
        })
        .catch(error => {
            console.error(error);
            alert('Something went wrong.');
        });
    }

    // Real-time search for events
    document.getElementById('eventSearch').addEventListener('keyup', function () {
        const term = this.value.toLowerCase();
        const rows = document.querySelectorAll('.event-row');

        rows.forEach(row => {
            const title = row.querySelector('.event-title').textContent.toLowerCase();
            row.style.display = title.includes(term) ? '' : 'none';
        });
    });

    // Boost modal functions
    let selectedEventId = null;

    function openEventBoostModal(eventId, title) {
        selectedEventId = eventId;
        document.getElementById('eventBoostModal').classList.remove('hidden');
    }

    function closeEventBoostModal() {
        selectedEventId = null;
        document.getElementById('eventBoostModal').classList.add('hidden');
    }

    function submitEventBoost(days, amount) {
        if (!selectedEventId) return;

        fetch(`/events/${selectedEventId}/boost/initiate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
            },
            body: JSON.stringify({ days })
        })
        .then(res => res.json())
        .then(data => {
            if (data.checkout_url) {
                closeEventBoostModal();
                window.location.href = data.checkout_url;
            } else {
                alert('Error initiating payment.');
            }
        })
        .catch(error => {
            console.error('Boost error:', error.message);
            alert('Network error: ' + error.message);
        });
    }



    function openEventAdModal(eventId, title) {
        document.getElementById('eventAdModal').classList.remove('hidden');
        document.getElementById('eventAdModal').classList.add('flex');
    }

    function closeEventAdModal() {
        document.getElementById('eventAdModal').classList.remove('flex');
        document.getElementById('eventAdModal').classList.add('hidden');
    }
</script>
