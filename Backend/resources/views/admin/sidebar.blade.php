<!-- ! Sidebar -->
<aside class="sidebar">
    <div class="sidebar-start">
        <div class="sidebar-head">
            <a href="{{ url('/admindash') }}" class="logo-wrapper" title="Home">
                
                <div class="logo-text">
                    <span class="logo-title">UNIADS</span>
                    <span class="logo-subtitle">Dashboard</span>
                </div>

            </a>
            <button class="sidebar-toggle transparent-btn" title="Menu" type="button">
                <span class="sr-only">Toggle menu</span>
                <span class="icon menu-toggle" aria-hidden="true"></span>
            </button>
        </div>
        <div class="sidebar-body">
            <ul class="sidebar-body-menu">
                <li>
                    <a class="active" href="{{ route('admin.dashboard') }}"><span class="icon home" aria-hidden="true"></span>Dashboard</a>
                </li>
                <li>
                    <a class="show-cat-btn" href="{{ route('admin.users') }}">
                        <span class="icon user-3" aria-hidden="true"></span>Users
                        
                    </a>
                    
                    <a class="show-cat-btn" href="{{ route('admin.institutesmanage') }}">
                        <span class="icon category" aria-hidden="true"></span>Institutes
                    </a>
                    <a class="show-cat-btn" href="{{ route('admin.categories') }}">
                        <span class="icon folder" aria-hidden="true"></span>Categories
                        
                    </a>

                    <a class="show-cat-btn" href="{{ route('admin.posts') }}">
                        <span class="icon document" aria-hidden="true"></span>Posts
                    </a>

                    

                    <a class="show-cat-btn" href="{{ route('admin.events') }}">
                        <span class="icon time-circle" aria-hidden="true"></span>Events
                        
                    </a>

                    <a class="show-cat-btn" href="{{ route('admin.subscriptions') }}">
                        <span class="icon star" aria-hidden="true"></span>Subscriptions
                    </a>

                    <a class="show-cat-btn" href="{{ route('admin.ratings') }}">
                        <span class="icon star" aria-hidden="true"></span>Ratings
                    </a>
                    
                    <a class="show-cat-btn" href="{{ route('admin.privacy_policy') }}">
                        <span class="icon lock" aria-hidden="true"></span>Privacy Policy
                    </a>

                    <a class="show-cat-btn" href="{{ route('admin.terms') }}">
                        <span class="icon lock" aria-hidden="true"></span>Terms & Conditions
                    </a>

                    <a class="show-cat-btn" href="{{ route('admin.refund_policy') }}">
                        <span class="icon lock" aria-hidden="true"></span>Refund Policy
                    </a>
                    
                </li>
                {{-- <li>
                    <a class="show-cat-btn" href="##">
                        <span class="icon image" aria-hidden="true"></span>Media
                        <span class="category__btn transparent-btn" title="Open list">
                            <span class="sr-only">Open list</span>
                            <span class="icon arrow-down" aria-hidden="true"></span>
                        </span>
                    </a>
                    <ul class="cat-sub-menu">
                        <li>
                            <a href="media-01.html">Media-01</a>
                        </li>
                        <li>
                            <a href="media-02.html">Media-02</a>
                        </li>
                    </ul>
                </li>
                <li>
                    <a class="show-cat-btn" href="##">
                        <span class="icon paper" aria-hidden="true"></span>Pages
                        <span class="category__btn transparent-btn" title="Open list">
                            <span class="sr-only">Open list</span>
                            <span class="icon arrow-down" aria-hidden="true"></span>
                        </span>
                    </a>
                    <ul class="cat-sub-menu">
                        <li>
                            <a href="pages.html">All pages</a>
                        </li>
                        <li>
                            <a href="new-page.html">Add new page</a>
                        </li>
                    </ul>
                </li>
                <li>
                    <a href="comments.html">
                        <span class="icon message" aria-hidden="true"></span>
                        Comments
                    </a>
                    <span class="msg-counter">7</span>
                </li>
            </ul>
            <span class="system-menu__title">system</span>
            <ul class="sidebar-body-menu">
                
                <li>
                    <a class="show-cat-btn" href="##">
                        <span class="icon category" aria-hidden="true"></span>Extentions
                        <span class="category__btn transparent-btn" title="Open list">
                            <span class="sr-only">Open list</span>
                            <span class="icon arrow-down" aria-hidden="true"></span>
                        </span>
                    </a>
                    <ul class="cat-sub-menu">
                        <li>
                            <a href="extention-01.html">Extentions-01</a>
                        </li>
                        <li>
                            <a href="extention-02.html">Extentions-02</a>
                        </li>
                    </ul>
                </li>
                <li>
                    
                    <ul class="cat-sub-menu">
                        <li>
                            <a href="users-01.html">Users-01</a>
                        </li>
                        <li>
                            <a href="users-02.html">Users-02</a>
                        </li>
                    </ul>
                </li>
                <li>
                    <a href="##"><span class="icon setting" aria-hidden="true"></span>Settings</a>
                </li> --}}
            </ul>
        </div>
    </div>
</aside>