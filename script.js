const forumLatest = "https://cdn.freecodecamp.org/curriculum/forum-latest/latest.json";
const forumTopicUrl = "https://forum.freecodecamp.org/t/"; 
const forumCategoryUrl = "https://forum.freecodecamp.org/c/";
const avatarUrl = "https://sea1.discourse-cdn.com/freecodecamp";
const postsContainer = document.getElementById("posts-container");

let allTopics = []; // Store topics globally
let allUsers = []; // Store users globally
let selectedSort = "activity"; // Default sorting
let selectedCategory = "all"; // Default category

const allCategories = {
  299: { category: "Career Advice", className: "career" },
  409: { category: "Project Feedback", className: "feedback" },
  417: { category: "freeCodeCamp Support", className: "support" },
  421: { category: "JavaScript", className: "javascript" },
  423: { category: "HTML - CSS", className: "html-css" },
  424: { category: "Python", className: "python" },
  432: { category: "You Can Do This!", className: "motivation" },
  560: { category: "Backend Development", className: "backend" },
};

const forumCategory = (id) => {
  const categoryData = allCategories[id] || { category: "General", className: "general" };
  return `<a href="${forumCategoryUrl}${categoryData.className}/${id}" class="category ${categoryData.className}" target="_blank">${categoryData.category}</a>`;
};

const timeAgo = (time) => {
  const currentTime = new Date();
  const lastPost = new Date(time);
  const timeDifference = currentTime - lastPost;

  const minutesAgo = Math.floor(timeDifference / (1000 * 60));
  const hoursAgo = Math.floor(minutesAgo / 60);
  const daysAgo = Math.floor(hoursAgo / 24);

  if (minutesAgo < 60) return `${minutesAgo}m ago`;
  if (hoursAgo < 24) return `${hoursAgo}h ago`;
  return `${daysAgo}d ago`;
};

const viewCount = (views) => (views >= 1000 ? `${Math.floor(views / 1000)}k` : views);

const avatars = (posters) => {
  const placeholderAvatar = "avatar-generations_prsz.jpg"; // Fallback avatar

  return posters.map((poster) => {
    const user = allUsers.find((user) => user.id === poster.user_id);
    let userAvatarUrl = placeholderAvatar; // Default to placeholder

    if (user?.avatar_template) {
      const avatar = user.avatar_template.replace("{size}", "30");
      userAvatarUrl = avatar.startsWith("/user_avatar/") ? avatarUrl + avatar : avatar;
    }

    return `<img src="${userAvatarUrl}" onerror="this.onerror=null; this.src='${placeholderAvatar}';" alt="${user?.name || 'User'}">`;
  }).join("");
};

// 🔹 Fetch Data from API
const fetchData = async () => {
  try {
    const res = await fetch(forumLatest);
    const data = await res.json();
    allTopics = data.topic_list.topics;
    allUsers = data.users;
    renderPosts();
  } catch (err) {
    console.error(err);
  }
};

fetchData();

// 🔹 Sort Topics
const sortTopics = (topics) => {
  return topics.sort((a, b) => {
    if (selectedSort === "replies") return b.posts_count - a.posts_count;
    if (selectedSort === "views") return b.views - a.views;
    if (selectedSort === "activity") return new Date(b.bumped_at) - new Date(a.bumped_at);
    return 0;
  });
};

// 🔹 Filter Topics
const filterTopics = () => {
  let filteredTopics = selectedCategory === "all"
    ? allTopics
    : allTopics.filter(topic => topic.category_id == selectedCategory);
  
  return sortTopics(filteredTopics);
};

// 🔹 Render Posts
const renderPosts = () => {
  const topics = filterTopics();
  
  postsContainer.innerHTML = topics.map(({ id, title, views, posts_count, slug, posters, category_id, bumped_at }) => `
    <tr>
      <td><a href="${forumTopicUrl}${slug}/${id}" target="_blank" class="post-title">${title}</a></td>
      <td><div class="avatar-container">${avatars(posters)}</div></td>
      <td>${forumCategory(category_id)}</td>
      <td>${posts_count - 1}</td>
      <td>${viewCount(views)}</td>
      <td>${timeAgo(bumped_at)}</td>
    </tr>
  `).join("");
};

// 🔹 Event Listeners for Sorting & Filtering
document.getElementById("sort-select").addEventListener("change", (event) => {
  selectedSort = event.target.value;
  renderPosts();
});

document.getElementById("category-select").addEventListener("change", (event) => {
  selectedCategory = event.target.value;
  renderPosts();
});
