let currentPage = 1; // Tracks the current page of posts loaded
let isLoading = false;

function loadPosts(page) {
    isLoading = true;
    document.getElementById("loadingIndicator").style.display = "block";

    // AJAX request to Laravel backend
    fetch(`/load-posts?page=${page}`)
        .then((response) => response.json())
        .then((data) => {
            const postContainer = document.getElementById("postContainer");

            data.posts.forEach((post) => {
                const postCard = document.createElement("div");
                postCard.className = "post-card";
                postCard.innerHTML = `
                    <div class="post-header">
                        <img src="${post.profile_image}" alt="${post.poster_name}" class="profile-image">
                        <div class="post-info">
                            <span class="poster-name">${post.poster_name}</span>
                            <span class="post-time">${post.time_ago}</span>
                        </div>
                    </div>
                    <h4 class="post-title">${post.title}</h4>
                    <p class="post-description">${post.description}</p>
                    <img src="${post.image_url}" alt="${post.title}" class="post-image">
                    <div class="post-actions">
                        <button class="like-btn">Like</button>
                    </div>
                `;
                postContainer.appendChild(postCard);
            });

            document.getElementById("loadingIndicator").style.display = "none";
            isLoading = false;
        })
        .catch((error) => {
            console.error("Error loading posts:", error);
            document.getElementById("loadingIndicator").style.display = "none";
            isLoading = false;
        });
}

// Add scroll event listener to load more posts
document.querySelector(".middle-section").addEventListener("scroll", function () {
    const { scrollTop, scrollHeight, clientHeight } = this;
    if (scrollTop + clientHeight >= scrollHeight - 5 && !isLoading) {
        currentPage++;
        loadPosts(currentPage);
    }
});
