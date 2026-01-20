<meta name="csrf-token" content="{{ csrf_token() }}">

<header>
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <div class="header-container">
        <div class="header-wrapper">
            <div class="logoBox">
                <span>UniAds</span>
            </div>

            <form action="{{ route('search.results') }}" method="GET">
                <div class="searchBox">
                    <input type="text" name="query" placeholder="Find your dream program..." required>
                    <button type="submit" class="search-btn" aria-label="Search">
                        <i class="fa fa-search"></i>
                    </button>
                </div>
            </form>

            <div class="iconBox1">
                <a href="{{ url('/feed') }}"><i class="fa fa-home" title="Feed"></i></a>
                <a href="{{ url('/institutions') }}"><i class="fa fa-building" title="Institutes"></i></a>
                <a href="{{ url('/courses') }}"><i class="fa fa-graduation-cap" title="Courses"></i></a>
                <a href="{{ url('/events') }}"><i class="fa fa-calendar" title="Events"></i></a>
                @if (Auth::check() && auth()->user()->institute && auth()->user()->institute->status === 'approved')
                    <a href="{{ url('/pricing') }}" title="Premium Details">
                        <i class="fa fa-star" style="color: gold;"></i>
                    </a>
                @endif




                {{-- <div id="notification-bell">
                    <button>
                        <i class="fa fa-bell"></i>
                        <span id="notification-count">0</span>
                    </button>
                    <div id="notifications-dropdown">
                        <ul id="notifications-list"></ul>
                    </div>
                </div> --}}
                <!-- New Message Icon -->

            </div>


            <div class="nav-icons">
                <div class="profile-dropdown">
                    <button onclick="toggleProfileDropdown()" class="profile-btn">
                        <img src="{{ asset('storage/' . (Auth::user()->profile_picture ?? (Auth::user()->institute->profile_photo ?? 'default-avatar.png'))) }}"
                            id="profile-preview" class="profile-img">

                        @guest
                            <script>
                                window.location.href = "{{ route('login') }}";
                            </script>
                        @endguest

                        @auth
                            <span class="username">{{ Auth::user()->name }}</span>
                        @endauth

                    </button>
                    <div id="dropdown-menu" class="dropdown-content">
                        <a href="{{ route('profile.edit') }}">Profile</a>

                        @if (auth()->check() && auth()->user()->role === 'User')
                            <a href="{{ route('saved.posts') }}">Saved Posts</a>
                        @endif

                        <form action="{{ route('logout') }}" method="POST" style="display: inline;">
                            @csrf
                            <button type="submit" class="dropdown-link">Log Out</button>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    </div>



    {{-- <!-- Chat Modal -->
<!-- Chat Modal -->
<meta name="csrf-token" content="{{ csrf_token() }}">
<div id="chatModal" class="chat-modal">
    <div class="chat-modal-content">
        <!-- Header -->
        <div id="chatHeader" class="chat-header">
            Chat with <span id="selectedInstituteName">Select an Institute</span>
            <button class="close-modal" onclick="closeChatModal()">×</button>
        </div>

        <!-- Chat Container -->
        <div class="chat-container">
            <!-- Sidebar: Approved Institutes -->
            @guest
    <script>
        window.location.href = "{{ route('login') }}";
    </script>
@endguest

@auth
    @if (auth()->user()->role == 'User')
        <div class="chat-sidebar">
            <h4>Approved Institutes</h4>
            <ul id="chatSidebar">
                @foreach ($institutes as $institute)
                    <li id="institute-{{ $institute->id }}" 
                        onclick="selectInstitute({{ $institute->id }}, '{{ $institute->institute_name }}')">
                        {{ $institute->institute_name }}
                    </li>
                @endforeach
            </ul>
        </div>
    @endif
@endauth

            <!-- Chat Body -->
            <div class="chat-body">
                <div id="chatMessages" class="chat-messages">
                    <p>Select an institute to start chatting.</p>
                </div>
                <div class="chat-input">
                    <input id="chatInput" type="text" placeholder="Type a message..." />
                    <button onclick="sendMessage()">Send</button>
                </div>
            </div>
        </div>
    </div>
</div> --}}






    <script>
        let selectedInstituteId = null;
        let currentChatId = null;

        function openChatModal() {
            document.getElementById('chatModal').style.display = 'block';
        }

        function closeChatModal() {
            document.getElementById('chatModal').style.display = 'none';
        }

        function selectInstitute(instituteId, instituteName) {
            document.querySelectorAll("#chatSidebar li").forEach(li => li.classList.remove("selected"));
            document.getElementById(`institute-${instituteId}`).classList.add("selected");

            document.getElementById("chatHeader").textContent = `Chat with ${instituteName}`;
            selectedInstituteId = instituteId;

            // Get chat ID and load messages
            loadMessages();
        }

        function loadMessages() {
            if (!selectedInstituteId) return;

            const chatMessages = document.getElementById("chatMessages");
            chatMessages.innerHTML = "Loading messages...";

            fetch(`/get-messages/${selectedInstituteId}`)
                .then(response => response.json())
                .then(data => {
                    chatMessages.innerHTML = ''; // Clear existing messages
                    data.messages.forEach(message => {
                        const msgDiv = document.createElement('div');
                        msgDiv.classList.add(message.sender_id === {{ Auth::id() }} ? 'sent-message' :
                            'received-message');
                        msgDiv.textContent = message.message;
                        chatMessages.appendChild(msgDiv);
                    });
                });
        }

        function sendMessage() {
            const messageInput = document.getElementById("chatInput");
            const message = messageInput.value.trim();

            if (!message || !selectedInstituteId) {
                alert("Please select an institute and type a message.");
                return;
            }

            fetch('/send-message', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                    },
                    body: JSON.stringify({
                        receiver_id: selectedInstituteId,
                        message: message
                    })
                })
                .then(response => response.json())
                .then(data => {
                    messageInput.value = ''; // Clear input
                    loadMessages(); // Reload chat messages
                })
                .catch(error => {
                    console.error("Error sending message:", error);
                });
        }


        document.addEventListener("DOMContentLoaded", function() {
            const header = document.querySelector("header");
            let lastScrollTop = 0;
            let isMobile = window.innerWidth <= 768;

            window.addEventListener("resize", () => {
                isMobile = window.innerWidth <= 768;
            });

            window.addEventListener("scroll", function() {
                if (!isMobile) {
                    header.style.top = "0px";
                    return;
                }

                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

                if (scrollTop > lastScrollTop) {
                    // Scrolling down: hide half
                    header.style.top = "-70px"; // move up half of 140px
                } else {
                    // Scrolling up: show it again
                    header.style.top = "0px";
                }

                lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
            });
        });
    </script>




</header>
