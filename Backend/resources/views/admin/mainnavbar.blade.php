
<nav class="main-nav--bg">
    <div class="container main-nav">
      <div class="main-nav-start">
        <div class="search-wrapper">
          <i data-feather="search" aria-hidden="true"></i>
          <input type="text" placeholder="Enter keywords ..." required>
        </div>
      </div>
      <div class="main-nav-end">
        
        <div class="notification-wrapper">
          <button class="gray-circle-btn dropdown-btn" title="To messages" type="button">
            <span class="sr-only">To messages</span>
            <span class="icon notification active" aria-hidden="true"></span>
          </button>
          
        </div>
        <div class="nav-icons">
          <div class="profile-dropdown">
              <button onclick="toggleDropdown()" class="profile-btn">
                  <img src="{{ asset('storage/' . (Auth::user()->profile_picture ?? 'default-avatar.png')) }}" alt="Profile Picture" id="profile-preview" class="profile-img">
                  <span class="username">{{ Auth::user()->name }}</span>
              </button>
              <div id="dropdown-menu" class="dropdown-content">
                  <a href="{{ route('profile.edit') }}">Profile Management</a>
                  <form action="{{ route('logout') }}" method="POST" style="display: inline;">
                      @csrf
                      <button type="submit" class="dropdown-link">Log Out</button>
                  </form>
              </div>
          </div>
      </div>
      
      </div>
    </div>
  </nav>

  <script>
    

  </script>