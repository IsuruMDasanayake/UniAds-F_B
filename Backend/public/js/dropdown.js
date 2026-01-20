function toggleDropdown() {
    const dropdown = document.getElementById('dropdown-menu');
    dropdown.classList.toggle('show');
}

// Close the dropdown if clicked outside
window.addEventListener('click', function (event) {
    const dropdown = document.getElementById('dropdown-menu');
    const profileButton = document.querySelector('.profile-btn');

    if (!dropdown.contains(event.target) && !profileButton.contains(event.target)) {
        dropdown.classList.remove('show');
    }
});