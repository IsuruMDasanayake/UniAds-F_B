<script src="https://cdn.tailwindcss.com"></script>

<div class="min-h-screen flex items-center justify-center bg-gray-100 px-4">
    <div class="bg-white p-8 rounded-xl shadow-md text-center max-w-md w-full">
        <div class="flex justify-center mb-4">
            <svg class="w-16 h-16 text-green-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
        </div>

        <h1 class="text-2xl font-bold text-gray-800 mb-2">Boost Successful!</h1>
        <p class="text-gray-600 mb-6">
            Your post <strong>{{ $post->title }}</strong> has been successfully boosted.
            It will be prioritized in search and category results until <strong>{{ $post->boost_expires_at ? $post->boost_expires_at->format('F j, Y') : 'the expiry date' }}</strong>.
        </p>

        <a href="{{ route('analytics.dashboard', $institute->id) }}" class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow">
            Go to Dashboard
        </a>
    </div>
</div>