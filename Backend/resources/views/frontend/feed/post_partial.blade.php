@foreach ($posts as $post)
    @if ($post->status === 'active')
        <div class="post-card">
            <div class="post-image-wrapper">
                <img class="post-image" src="{{ asset('storage/' . $post->image) }}" alt="Post Image">
            </div>

            <div class="post-details">
                <div class="post-header">
                    <a href="{{ url('/institutions/' . $post->institute->id . '/profile') }}">
                        <img class="profile-picture"
                            src="{{ asset('storage/' . ($post->institute->profile_photo ?? 'images/profile.png')) }}"
                            alt="Profile Picture">
                    </a>
                    <div>
                        <a href="{{ url('/institutions/' . $post->institute->id . '/profile') }}"
                            class="institute-name-link">
                            <div class="post-author">{{ $post->institute->institute_name }}
                                @if (
                                    $post->institute->is_premium &&
                                        $post->institute->premium_expires_at &&
                                        now()->lessThanOrEqualTo($post->institute->premium_expires_at))
                                    <img src="{{ asset('images/verified-badge.png') }}" alt="Premium Verified"
                                        class="premium-badge" title="Premium Verified">
                                @endif
                            </div>
                        </a>
                        <div class="post-timestamp">{{ $post->created_at->format('F j, Y | g:i A') }}</div>
                    </div>
                </div>

                <div class="post-content">
                    <h3>{{ $post->title }}</h3>

                    <p>{!! nl2br(e($post->small_description)) !!}</p>
                </div>

                <div class="post-footer">
                    @php
                        $liked = auth()->check()
                            ? $post
                                ->likes()
                                ->where('user_id', auth()->id())
                                ->exists()
                            : false;
                    @endphp

                    <button class="like-button" onclick="toggleLike({{ $post->id }})"
                        id="like-button-{{ $post->id }}">
                        <span class="like-icon {{ $liked ? 'liked' : '' }}">&#10084;</span>
                        <span class="like-text">Like | <span
                                id="like-count-{{ $post->id }}">{{ $post->likes_count ?? 0 }}</span></span>
                    </button>


                    <br>

                    @php
                        $escapedDescription = str_replace(["\r", "\n"], [' ', '\n'], strip_tags($post->description));
                    @endphp

                    <button class="about-the-course"
                        onclick="openPostModal(
                            '{{ asset('storage/' . $post->image) }}',
                            '{{ addslashes($post->title) }}',
                            `{{ str_replace(["\r", "\n"], ['', "\\n"], e($post->description)) }}`,
                            '{{ $post->institute->id }}',
                            '{{ $post->institute->contact_number }}',
                            {{ $post->id }}
                        )">
                        See More
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


                    {{-- <div class="post-timestamp" id="like-count-{{ $post->id }}">
                        {{ $post->likes_count ?? 0 }} Likes
                    </div> --}}
                </div>
            </div>
        </div>
    @endif
@endforeach
