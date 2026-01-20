<div class="card-section" id="posts-section" style="display: none;">
    <h2 class="section-title flex justify-between items-center">
        Post Analytics 📝
        <input
            type="text"
            id="postSearch"
            placeholder="Search posts..."
            class="border border-gray-300 rounded px-3 py-2 w-full md:w-1/3 text-sm"
        />
    </h2>

    <div class="overflow-x-auto mt-6">
        <table class="min-w-full divide-y divide-gray-200 rounded-lg shadow-sm">
            <thead class="bg-blue-600">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Post Title</th>
                    <th class="px-6 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider">Views</th>
                    <th class="px-6 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider">Applications</th>
                    <th class="px-6 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider">Status</th>
                    <th class="px-6 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider">Created</th>
                    <th class="px-6 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider">Action</th>
                    <th class="px-6 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider">Boost</th>
                    <th class="px-6 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider">Make Ad</th>
                </tr>
            </thead>
            <tbody id="postTableBody" class="bg-white divide-y divide-gray-200">
                @forelse($posts as $post)
                    <tr class="hover:bg-gray-50 transition post-row">
                        <td class="px-6 py-4 text-sm text-gray-900 font-medium post-title">
                            {{ $post->title }}
                        </td>
                        <td class="px-6 py-4 text-center text-sm text-gray-700">
                            {{ $post->view_count }}
                        </td>
                        <td class="px-6 py-4 text-center text-sm text-gray-700">
                            {{ $post->applications_count }}
                        </td>
                        <td class="px-6 py-4 text-center text-sm">
                            <span id="status-text-{{ $post->id }}"
                                  class="font-semibold {{ $post->status === 'active' ? 'text-green-600' : 'text-red-600' }}">
                                {{ ucfirst($post->status) }}
                            </span>
                        </td>
                        <td class="px-6 py-4 text-center text-sm text-gray-600">
                            {{ $post->created_at->format('F j, Y') }}
                        </td>
                        <td class="px-6 py-4 text-center">
                            <button
                                onclick="togglePostStatus({{ $post->id }}, this)"
                                class="text-xs font-semibold text-white px-4 py-2 rounded 
                                    {{ $post->status === 'active' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600' }}">
                                {{ $post->status === 'active' ? 'Deactivate' : 'Activate' }}
                            </button>
                        </td>
                        <td class="px-6 py-4 text-center">
                                <button onclick="openBoostModal({{ $post->id }}, '{{ addslashes($post->title) }}')" class="bg-yellow-500 hover:bg-yellow-600 text-white text-xs px-3 py-2 rounded">
                                    Boost
                                </button>
                        </td>
                        <td class="px-6 py-4 text-center">
                                <button
                                    onclick="openAdModal({{ $post->id }}, '{{ addslashes($post->title) }}')"
                                    class="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-2 rounded">
                                    Create
                                </button>
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="6" class="text-center text-gray-500 py-4">No posts found for your institute.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>
</div>

<!-- CSRF Token -->
<meta name="csrf-token" content="{{ csrf_token() }}">


<!-- Boost Modal -->
<div id="boostModal" class="fixed inset-0 z-[1001] hidden flex items-center justify-center bg-black bg-opacity-60">
  <div class="bg-white w-full max-w-md rounded-lg shadow-lg p-6 relative">
    <button class="absolute top-2 right-3 text-gray-600 hover:text-black text-xl" onclick="closeBoostModal()">&times;</button>

    <h2 class="text-2xl font-bold mb-3 text-center text-blue-700">Boost Your Course</h2>

    <p class="text-sm text-gray-600 mb-4 text-center leading-relaxed">
      {{-- Boosting your post highlights it in search and category results for better visibility.
      Boosted posts are shown at the top and prioritized by your follower count. --}}

      Boost Function is currently under development. We will notify you once it is available.
    </p>

    {{-- <h3 class="text-md font-semibold text-gray-800 mb-2 text-center">Choose Boost Duration</h3>

    <div class="grid grid-cols-2 gap-4 text-center">
      <div class="border border-blue-500 rounded-lg p-4 cursor-pointer hover:bg-blue-50"
           onclick="submitBoost(7, 490)">
        <p class="font-bold text-lg text-blue-600">7 Days</p>
        <p class="text-sm text-gray-700">LKR 490</p>
      </div>
      <div class="border border-blue-500 rounded-lg p-4 cursor-pointer hover:bg-blue-50"
           onclick="submitBoost(14, 890)">
        <p class="font-bold text-lg text-blue-600">14 Days</p>
        <p class="text-sm text-gray-700">LKR 890</p>
      </div>
      <div class="border border-blue-500 rounded-lg p-4 cursor-pointer hover:bg-blue-50"
           onclick="submitBoost(21, 1290)">
        <p class="font-bold text-lg text-blue-600">21 Days</p>
        <p class="text-sm text-gray-700">LKR 1290</p>
      </div>
      <div class="border border-blue-500 rounded-lg p-4 cursor-pointer hover:bg-blue-50"
           onclick="submitBoost(28, 1590)">
        <p class="font-bold text-lg text-blue-600">28 Days</p>
        <p class="text-sm text-gray-700">LKR 1590</p>
      </div>
    </div>

    <button onclick="closeBoostModal()" class="w-full mt-6 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded">
      Cancel
    </button> --}}
  </div>
</div>



<!-- Create Ad Modal -->
<div id="createAdModal" class="fixed inset-0 z-[1001] hidden items-center justify-center bg-black bg-opacity-60">
  <div class="bg-white w-full max-w-md rounded-lg shadow-lg p-6 relative">
    <button class="absolute top-2 right-3 text-gray-600 hover:text-black text-xl" onclick="closeAdModal()">&times;</button>

    <h2 class="text-xl font-bold mb-4 text-center text-indigo-600">Create Ad for Post</h2>

    <p class="text-sm text-gray-700 mb-6 text-center leading-relaxed">
      Ads Function is currently under development. We will notify you once it is available.
    </p>
  </div>
</div>



<!-- JavaScript -->
<script>
    // Toggle post status
    function togglePostStatus(postId, button) {
        fetch(`/posts/${postId}/toggle-status`, {
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

                // Update status text and color
                const statusSpan = document.getElementById(`status-text-${postId}`);
                statusSpan.textContent = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
                statusSpan.className = 'font-semibold ' + (newStatus === 'active' ? 'text-green-600' : 'text-red-600');

                // Update button
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

    // Real-time search
    document.getElementById('postSearch').addEventListener('keyup', function () {
        const term = this.value.toLowerCase();
        const rows = document.querySelectorAll('.post-row');

        rows.forEach(row => {
            const title = row.querySelector('.post-title').textContent.toLowerCase();
            row.style.display = title.includes(term) ? '' : 'none';
        });
    });

    // Boost modal functionality
    let selectedPostId = null;

function openBoostModal(postId, title) {
    selectedPostId = postId;
    document.getElementById('boostModal').classList.remove('hidden');
}

function closeBoostModal() {
    selectedPostId = null;
    document.getElementById('boostModal').classList.add('hidden');
}

function submitBoost(days, amount) {
    if (!selectedPostId) return;

    fetch(`/posts/${selectedPostId}/boost/initiate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
        },
        body: JSON.stringify({ days }), // amount not strictly needed here if backend uses config
    })
    .then(res => {
        if (!res.ok) {
            return res.text().then(text => { throw new Error(text || 'Unknown error'); });
        }
        return res.json();
    })
    .then(data => {
        if (data.checkout_url) {
            closeBoostModal();
            window.location.href = data.checkout_url;
        } else {
            alert('Error initiating payment.');
        }
    })
    .catch(error => {
        console.error('Boost initiation error:', error.message);
        alert('Network error: ' + error.message);
    });
}



function openAdModal(postId, title) {
        document.getElementById('createAdModal').classList.remove('hidden');
        document.getElementById('createAdModal').classList.add('flex');
    }

    function closeAdModal() {
        document.getElementById('createAdModal').classList.remove('flex');
        document.getElementById('createAdModal').classList.add('hidden');
    }


</script>
