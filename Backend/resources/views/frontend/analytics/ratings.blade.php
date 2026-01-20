<div class="card-section" id="ratings-section" style="display: none;">
    <h2 class="section-title flex justify-between items-center">
        Reviews & Ratings ⭐
        <span class="text-sm text-gray-500">Total: {{ $ratings->count() }}</span>
    </h2>

    <div class="overflow-x-auto mt-6">
        <table class="min-w-full divide-y divide-gray-200 rounded-lg shadow-sm">
            <thead class="bg-blue-600">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">User</th>
                    <th class="px-6 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider">Rating</th>
                    <th class="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Comment</th>
                    <th class="px-6 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider">Posted At</th>
                    <th class="px-6 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider">Reason</th>
                    <th class="px-6 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider">Action</th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
                @forelse($ratings as $rating)
                    <tr class="hover:bg-gray-50 transition">
                        <td class="px-6 py-4 text-sm text-gray-900">{{ $rating->user->name ?? 'Unknown User' }}</td>
                        <td class="px-6 py-4 text-center text-sm font-semibold">
                            <span class="text-yellow-500 text-xl">
                                {{ str_repeat('★', $rating->rating) }}{{ str_repeat('☆', 5 - $rating->rating) }}
                            </span>
                        </td>
                        <td class="px-6 py-4 text-sm text-gray-700">{{ $rating->comment }}</td>
                        <td class="px-6 py-4 text-center text-sm text-gray-500">{{ $rating->created_at->diffForHumans() }}</td>
                        <td class="px-6 py-4 text-center text-sm text-gray-700">
                            {{ $rating->report_reason ?? '—' }}
                        </td>
                        <td class="px-6 py-4 text-center">
                            @if($rating->is_reported)
                                <button class="bg-gray-400 text-white px-3 py-1 rounded cursor-not-allowed" disabled>Reported</button>
                            @else
                                <button class="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded report-btn" data-id="{{ $rating->id }}">Report</button>
                            @endif
                        </td>
                    </tr>
                @empty
                    <tr>
                        <td colspan="6" class="text-center text-gray-500 py-4">No reviews found for your institute.</td>
                    </tr>
                @endforelse
            </tbody>
        </table>
    </div>
</div>

<!-- Report Modal -->
<div id="reportModal" class="fixed inset-0 z-[1001] bg-black bg-opacity-50 hidden justify-center items-center">
    <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-semibold mb-4">Report Comment</h3>
        <form id="reportForm">
            <input type="hidden" name="rating_id" id="rating_id">

            <label class="block mb-2 font-medium text-sm">Select Reason</label>
            <select name="report_reason" id="report_reason" class="w-full border rounded p-2 mb-3">
                <option value="">-- Choose a reason --</option>
                <option value="False information">False information</option>
                <option value="Offensive or inappropriate language">Offensive or inappropriate language</option>
                <option value="Spam or unrelated content">Spam or unrelated content</option>
                <option value="Other">Other</option>
            </select>

            <textarea id="custom_reason" class="w-full border rounded p-2 mb-3 hidden" placeholder="Enter your reason here..."></textarea>

            <div class="flex justify-end gap-2">
                <button type="button" id="cancelBtn" class="bg-gray-300 px-3 py-1 rounded">Cancel</button>
                <button type="submit" class="bg-blue-600 text-white px-3 py-1 rounded">Submit</button>
            </div>
        </form>
    </div>
</div>
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script>
$(document).ready(function() {
    // Open modal
    $('.report-btn').on('click', function() {
        const id = $(this).data('id');
        $('#rating_id').val(id);
        $('#reportModal').removeClass('hidden').addClass('flex');
    });

    // Show custom text field if "Other" selected
    $('#report_reason').on('change', function() {
        if ($(this).val() === 'Other') {
            $('#custom_reason').removeClass('hidden');
        } else {
            $('#custom_reason').addClass('hidden');
        }
    });

    // Cancel
    $('#cancelBtn').on('click', function() {
        $('#reportModal').addClass('hidden').removeClass('flex');
    });

    // Submit report
    $('#reportForm').on('submit', function(e) {
        e.preventDefault();
        const id = $('#rating_id').val();
        let reason = $('#report_reason').val();
        if (reason === 'Other') {
            reason = $('#custom_reason').val();
        }

        $.ajax({
            url: `/ratings/${id}/report`,
            method: 'POST',
            data: {
                _token: '{{ csrf_token() }}',
                report_reason: reason
            },
            success: function(response) {
                alert('Report Submitted');
                location.reload();
            },
            error: function(xhr) {
                alert(xhr.responseJSON.message);
            }
        });
    });
});
</script>
