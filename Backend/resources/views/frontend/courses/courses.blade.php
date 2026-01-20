<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Courses</title>
    <link rel="icon" type="image/x-icon" href="{{ asset('favicon.ico') }}">
    <!-- Add CSS and FontAwesome -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"rel="stylesheet">
    <link rel="stylesheet" href="{{ asset('css/style.css') }}">
    <link rel="stylesheet" href="{{ asset('css/feed.css') }}">
    <link rel="stylesheet" href="{{ asset('css/discipline.css') }}">


    <style>

    </style>
</head>

<body>
    {{-- Include the Navbar --}}
    @include('frontend.navbar')

    <main>

        {{-- Content --}}
        <div class="courses-container">
            <!-- Browse by Discipline Section -->
            <div class="section">
                <h3 class="section-title">Explore a Wide Range of Disciplines to Find Your Perfect Course</h3>

                <div class="search-wrapper">
                    <input type="text" id="categorySearch" placeholder="Find your dream program..." />
                </div>


                <!-- Iterate through grouped categories -->
                @foreach ($categories as $mainCategory => $items)
                    <div class="filter-category">
                        <h3 class="filter-title">
                            {{ $mainCategory }}
                            <!-- Arrow for collapse/expand -->
                            <span class="filter-arrow">&nbsp; &#9660;</span> {{-- Up arrow by default --}}
                        </h3>
                        <div class="grid-container show"> {{-- Expanded by default --}}
                            @foreach ($items as $category)
                                <a href="{{ route('posts.filter', ['filterType' => $mainCategory, 'filterValue' => $category->name]) }}"
                                    class="grid-card">
                                    <i class="{{ $category->icon }}"></i>
                                    <p>{{ $category->name }}</p>
                                </a>
                            @endforeach
                        </div>
                    </div>
                @endforeach

            </div>
        </div>
        </div>
    </main>
    <script src="{{ asset('js/navbar.js') }}"></script>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const filterTitles = document.querySelectorAll('.filter-title');

            filterTitles.forEach(title => {
                const arrow = title.querySelector('.filter-arrow');
                const grid = title.nextElementSibling;

                title.addEventListener('click', () => {
                    grid.classList.toggle('collapsed'); // Toggle collapsed class

                    // Rotate arrow smoothly
                    if (grid.classList.contains('collapsed')) {
                        arrow.innerHTML = '&nbsp; &#9650;'; // Down arrow
                    } else {
                        arrow.innerHTML = '&nbsp; &#9660;'; // Up arrow
                    }
                });
            });
        });



        document.addEventListener('DOMContentLoaded', function() {
            const searchInput = document.getElementById('categorySearch');
            const filterCategories = document.querySelectorAll('.filter-category');

            searchInput.addEventListener('input', function() {
                const query = this.value.toLowerCase().trim();

                filterCategories.forEach(category => {
                    const grid = category.querySelector('.grid-container');
                    const cards = grid.querySelectorAll('.grid-card');
                    let anyVisible = false;

                    cards.forEach(card => {
                        const text = card.querySelector('p').textContent.toLowerCase();
                        if (text.includes(query)) {
                            card.style.display = 'flex';
                            anyVisible = true;
                        } else {
                            card.style.display = 'none';
                        }
                    });

                    // Show or hide the main category based on any matches
                    if (anyVisible) {
                        category.style.display = 'block';
                        grid.classList.remove('collapsed'); // Expand if matches found
                        const arrow = category.querySelector('.filter-arrow');
                        arrow.innerHTML = '&nbsp; &#9660;';
                    } else {
                        category.style.display = 'none';
                    }
                });
            });
        });
    </script>
</body>

</html>
