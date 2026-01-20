@if ($posts->isEmpty())
    <p>No posts available.</p>
@else
    @foreach ($posts as $post)
        @if ($post->status === 'active')
            <div class="post">
                <!-- Post Header -->
                <div class="post-header">
                    <img src="{{ $post->institute->profile_photo ? asset('storage/' . $post->institute->profile_photo) : asset('images/default-profile.png') }}"
                        alt="Profile Picture">
                    <div class="post-header-info">
                        <div class="post-header-top">
                            <h4>{{ $post->institute->institute_name }}
                                @if (
                                    $institute->is_premium &&
                                        $institute->premium_expires_at &&
                                        now()->lessThanOrEqualTo($institute->premium_expires_at))
                                    <img src="{{ asset('images/verified-badge.png') }}" alt="Premium Verified"
                                        class="premium-badge" title="Premium Verified">
                                @endif
                            </h4>
                            <!-- Edit and Delete Buttons -->
                            @if (Auth::check() && Auth::user()->id === $post->institute->user_id)
                                <div class="post-actions">
                                    <button class="btn-edit"
                                        onclick="openEditPostModal('{{ route('posts.edit', $post->id) }}')">✏️</button>


                                    <button type="button" class="btn-delete"
                                        onclick="openDeletePostModal('{{ $post->id }}', '{{ route('posts.destroy', $post->id) }}')">
                                        🗑️
                                    </button>


                                </div>
                            @endif

                        </div>
                        <span
                            style="font-size: 12px; color: gray; display: block;">{{ $post->created_at->format('F j, Y | g:i A') }}</span>
                    </div>
                </div>

                <!-- Post Body -->
                <div class="post-body">
                    <h3>{{ $post->title }}</h3>
                    <br>
                    <div class="post-description">
                        <p class="short-description">{!! nl2br(e(Str::limit($post->description, 200))) !!}</p>
                        <p class="full-description" style="display: none;">{!! nl2br(e($post->description)) !!}</p>
                        <button class="toggle-description-btn" onclick="toggleDescription(this)"
                            data-post-id="{{ $post->id }}">
                            See More...
                        </button>
                    </div><br>
                    <span style="font-size: 14px; color: gray;"><strong>Location:</strong>
                        {{ $post->location }}</span>
                    <img src="{{ $post->image ? asset('storage/' . $post->image) : asset('images/default-post.png') }}"
                        alt="Post Image" class="post-image"
                        style="margin-top: 10px; max-width: 100%; height: auto; border-radius: 8px;">
                    <!-- Action Buttons -->
                    <div class="post-action-buttons">
                        @if (Auth::check() &&
                                Auth::user()->id === $post->institute->user_id &&
                                $institute->is_premium &&
                                \Carbon\Carbon::parse($institute->premium_expires_at)->isFuture())
                            <!-- Boost Post Button for Owner -->
                            <button class="btn-boost" id="openBoostModalBtn">Boost Post</button>
                        @else
                            <!-- Like & Apply for Others -->
                            @php
                                $liked = false;
                                if (Auth::check()) {
                                    $liked = $post->likes()->where('user_id', Auth::id())->exists();
                                }
                            @endphp
                            @if (Auth::user()->role === 'User')
                                <button class="btn-like" onclick="toggleLike({{ $post->id }})"
                        id="like-button-{{ $post->id }}">
                        <span class="like-icon {{ $liked ? 'liked' : '' }}">&#10084;</span>
                        <span class="like-text">Like | <span
                                id="like-count-{{ $post->id }}">{{ $post->likes_count ?? 0 }}</span></span>
                    </button>



                                <button class="btn-apply" onclick="openApplyNowModal(this)"
                                    data-course-title="{{ $post->title }}" data-post-id="{{ $post->id }}"
                                    data-institute-id="{{ $post->institute_id }}">
                                    Apply Now
                                </button>

                                @if (auth()->check() && auth()->user()->role === 'User')
                                    <label class="ui-bookmark">
                                        <input type="checkbox" class="save-toggle" data-post-id="{{ $post->id }}"
                                            @if (auth()->user()->savedPosts->contains($post->id)) checked @endif>
                                        <div class="bookmark">
                                            <svg viewBox="0 0 32 32">
                                                <g>
                                                    <path
                                                        d="M27 4v27a1 1 0 0 1-1.625.781L16 24.281l-9.375 7.5A1 1 0 0 1 5 31V4a4 4 0 0 1 4-4h14a4 4 0 0 1 4 4z">
                                                    </path>
                                                </g>
                                            </svg>
                                        </div>
                                    </label>
                                @endif

                                {{-- <span id="like-count-{{ $post->id }}">
                                    {{ $post->likes()->count() }} Likes
                                </span> --}}
                            @endif
                        @endif
                    </div>

                </div>
            </div>
        @endif
    @endforeach
@endif


<script>
    //Post save/unsave toggle
        document.querySelectorAll('.save-toggle').forEach(el => {
            el.addEventListener('change', function() {
                const postId = this.dataset.postId;
                const csrfToken = document.querySelector('meta[name="csrf-token"]').content;

                fetch(`/posts/${postId}/save`, {
                        method: 'POST',
                        headers: {
                            'X-CSRF-TOKEN': csrfToken,
                            'Accept': 'application/json'
                        }
                    })
                    .then(res => res.json())
                    .then(data => {
                        if (data.status === 'saved') {
                            console.log(`Post ${postId} saved.`);
                        } else {
                            console.log(`Post ${postId} unsaved.`);
                        }
                    })
                    .catch(err => console.error('Error saving post:', err));
            });
        });
</script>