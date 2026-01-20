<div class="card-section" id="subscription-section" style="display: none;">
    <h2 class="section-title flex justify-between items-center">
    <span>Subscription Status 💳</span>

    @if(Auth::check() && auth()->user()->institute && auth()->user()->institute->status === 'approved')
        <a href="{{ url('/pricing') }}" title="Premium Details" class="inline-flex items-center gap-1 text-yellow-500 hover:text-yellow-600 text-sm font-semibold">
            <i class="fa fa-star text-lg"></i>
            <span>View Plans</span>
        </a>
    @endif
</h2>


    
    @if($subscription)
    
        <div class="bg-white shadow rounded-lg p-6">
            <h3 class="text-xl font-semibold mb-4 text-gray-800">Current Plan Details</h3>

            <table class="min-w-full table-auto border border-gray-300 rounded-lg overflow-hidden mb-6">
                <thead class="bg-blue-600 text-white">
                    <tr>
                        <th class="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wide">Plan</th>
                        <th class="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wide">Status</th>
                        <th class="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wide">Started At</th>
                        <th class="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wide">Expires At</th>
                        <th class="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wide">Cancelled At</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    <tr>
                        <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ ucfirst($subscription->plan) ?? '-' }}</td>
                        <td class="px-6 py-4 text-sm font-semibold">
                            @if($subscription->status === 'active')
                                <span class="text-green-600">Active</span>
                            @elseif($subscription->status === 'cancelled')
                                <span class="text-red-600">Cancelled</span>
                            @else
                                <span>{{ ucfirst($subscription->status) }}</span>
                            @endif
                        </td>
                        <td class="px-6 py-4 text-sm text-gray-700">{{ $subscription->started_at ? $subscription->started_at->format('F j, Y') : '-' }}</td>
                        <td class="px-6 py-4 text-sm text-gray-700">{{ $subscription->ends_at ? $subscription->ends_at->format('F j, Y') : '-' }}</td>
                        <td class="px-6 py-4 text-sm text-gray-700">{{ $subscription->cancelled_at ? $subscription->cancelled_at->format('F j, Y') : '-' }}</td>
                    </tr>
                </tbody>
            </table>

            <div class="mb-4">
                <p class="text-gray-700">
                    <strong>Next Billing Date:</strong>
                    @if($subscription->status === 'active' && $subscription->ends_at)
                        {{ $subscription->ends_at->format('F j, Y') }}
                    @else
                        N/A
                    @endif
                </p>
            </div>

            <div class="mb-6">
                {{-- <p class="text-gray-700">
                    <strong>Payment Method:</strong>
                    
                    Credit/Debit card ending in <em>**** 1234</em>
                </p> --}}
            </div>

            <div>
                {{-- <button class="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition">
                    Cancel Subscription
                </button> --}}
            </div>
        </div>

    @else

        <div class="bg-white shadow rounded-lg p-6">
            @if(!empty($institute->is_trial_used) && $institute->is_trial_used)
                <h3 class="text-xl font-semibold mb-4 text-gray-800">Trial Status</h3>
                <p class="text-gray-700 mb-2">Your free trial has ended. To continue enjoying premium features, please choose a subscription plan.</p>
                <a href="{{ route('subscription.plans') }}" class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition">View Subscription Plans</a>
            @else
                <h3 class="text-xl font-semibold mb-4 text-gray-800">Free Trial Active</h3>
                <p class="text-gray-700 mb-2">You are currently enjoying a free trial of UniAds Premium. Make the most of it before it expires!</p>
                @if($institute->trial_ends_at)
                    <p class="text-gray-600 font-medium">Trial expires on <strong>{{ \Carbon\Carbon::parse($institute->trial_ends_at)->format('F j, Y') }}</strong>.</p>
                @endif
            @endif
        </div>

    @endif
</div>
