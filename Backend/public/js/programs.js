function toggleDegreeList(listId) {
    const list = document.getElementById(listId);
    const listItems = Array.from(list.children);
    const visibleItems = listItems.filter(item => item.style.display !== "none");
    const hiddenItems = listItems.filter(item => item.style.display === "none");

    const maxVisible = 3; // Show 3 more items on each click
    let currentVisible = visibleItems.length;

    // If there are hidden items, show the next set
    if (currentVisible < listItems.length) {
        // Show the next 3 items
        const itemsToShow = hiddenItems.slice(0, maxVisible);
        itemsToShow.forEach(item => item.style.display = "list-item");

        // If all items are now visible, update the button
        if (currentVisible + itemsToShow.length === listItems.length) {
            // Update button text to "View All Courses"
            const seeMoreBtn = list.nextElementSibling; // Get the next button (button after the list)
            seeMoreBtn.textContent = "View All Courses";
            
            // Add a class to change the button style
            seeMoreBtn.classList.add('view-all-btn'); 

            // Update button behavior to redirect to courses page
            seeMoreBtn.onclick = function () {
                window.location.href = '/courses'; // Replace with your courses page URL
            };
        }
    } else {
        // Redirect to the courses page after all courses are displayed
        window.location.href = "/courses"; // Replace with your courses page URL
    }
}
