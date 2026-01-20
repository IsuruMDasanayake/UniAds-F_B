
function toggleProfileDropdown() {
    const dropdownMenu = document.getElementById('dropdown-menu');
    dropdownMenu.classList.toggle('show');
}
// Close the dropdown if clicked outside
window.addEventListener('click', function (event) {
    const dropdown = document.getElementById('dropdown-menu');
    const profileButton = document.querySelector('.profile-btn');


    // Check if the click is outside the profile button and dropdown
    if (!dropdown.contains(event.target) && !profileButton.contains(event.target)) {
        dropdown.classList.remove('show'); // Remove the "show" class to hide the dropdown
    }
});

// Function to toggle dropdown visibility on click
function toggleProfileDropdown() {
    const dropdown = document.getElementById('dropdown-menu');
    dropdown.classList.toggle('show'); // Toggle the "show" class
}




// document.addEventListener('DOMContentLoaded', function () {
//     // Fetch notifications when the page loads
//     fetchNotifications();

//     // Add click listener to the notification bell
//     const bell = document.getElementById('notification-bell');
//     bell.addEventListener('click', function (event) {
//         const dropdown = document.getElementById('notifications-dropdown');

//         // Toggle the dropdown visibility
//         dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';

//         // Mark notifications as seen and reset the count
//         if (dropdown.style.display === 'block') {
//             markNotificationsAsSeen();
//         }

//         // Stop click from propagating to document listener
//         event.stopPropagation();
//     });

//     // Close dropdown when clicking outside
//     document.addEventListener('click', function (event) {
//         const dropdown = document.getElementById('notifications-dropdown');

//         // Hide the dropdown if visible and the click is outside of it
//         if (dropdown.style.display === 'block' && !dropdown.contains(event.target) && event.target !== bell) {
//             dropdown.style.display = 'none';
//         }
//     });
// });

// // Fetch notifications and update the count
// function fetchNotifications() {
//     fetch('/notifications')
//         .then(response => response.json())
//         .then(data => {
//             const countElement = document.getElementById('notification-count');
//             const list = document.getElementById('notifications-list');
//             const dropdown = document.getElementById('notifications-dropdown');

//             // Clear existing notifications
//             list.innerHTML = '';

//             // Add notifications to the dropdown
//             data.notifications.forEach(notification => {
//                 const listItem = document.createElement('li');
//                 listItem.textContent = `${notification.title}: ${notification.message}`;
//                 list.appendChild(listItem);
//             });

//             // Update notification count
//             if (data.notification_count > 0) {
//                 countElement.textContent = data.notification_count;
//                 countElement.style.display = 'inline'; // Show the badge
//             } else {
//                 countElement.style.display = 'none'; // Hide the badge
//             }

//             dropdown.style.display = 'none'; // Hide the dropdown initially
//         })
//         .catch(error => {
//             console.error('Error fetching notifications:', error);
//         });
// }

// // Mark notifications as seen and reset the count
// function markNotificationsAsSeen() {
//     fetch('/notifications/seen', {
//         method: 'POST',
//         headers: {
//             'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
//             'Content-Type': 'application/json',
//         },
//     })
//         .then(response => response.json())
//         .then(data => {
//             console.log(data.message);

//             // Reset the notification count
//             const countElement = document.getElementById('notification-count');
//             countElement.textContent = '';
//             countElement.style.display = 'none'; // Hide the badge
//         })
//         .catch(error => {
//             console.error('Error marking notifications as seen:', error);
//         });
// }









