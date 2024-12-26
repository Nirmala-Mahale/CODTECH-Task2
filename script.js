// Simulate a database with localStorage
const usersDB = JSON.parse(localStorage.getItem('users')) || [];
const postsDB = JSON.parse(localStorage.getItem('posts')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// Function to load the login page
function loadLoginPage() {
    const content = `
        <h2>Login</h2>
        <form id="login-form">
            <input type="text" id="username" class="form-control" placeholder="Username" required />
            <input type="password" id="password" class="form-control" placeholder="Password" required />
            <button type="submit" class="btn btn-primary mt-3">Login</button>
        </form>
        <p>Don't have an account? <a href="#" id="go-to-signup">Sign up here</a></p>
    `;
    document.getElementById('main-content').innerHTML = content;

    document.getElementById('login-form').addEventListener('submit', function (e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        const user = usersDB.find(u => u.username === username && u.password === password);
        if (user) {
            currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            loadPostsPage();
        } else {
            alert('Invalid credentials');
        }
    });

    document.getElementById('go-to-signup').addEventListener('click', loadSignupPage);
}

// Function to load the signup page
function loadSignupPage() {
    const content = `
        <h2>Sign Up</h2>
        <form id="signup-form">
            <input type="text" id="new-username" class="form-control" placeholder="Username" required />
            <input type="password" id="new-password" class="form-control" placeholder="Password" required />
            <button type="submit" class="btn btn-primary mt-3">Sign Up</button>
        </form>
        <p>Already have an account? <a href="#" id="go-to-login">Login here</a></p>
    `;
    document.getElementById('main-content').innerHTML = content;

    document.getElementById('signup-form').addEventListener('submit', function (e) {
        e.preventDefault();
        const username = document.getElementById('new-username').value;
        const password = document.getElementById('new-password').value;

        if (usersDB.some(user => user.username === username)) {
            alert('Username already exists');
            return;
        }

        usersDB.push({ username, password });
        localStorage.setItem('users', JSON.stringify(usersDB));
        loadLoginPage();
    });

    document.getElementById('go-to-login').addEventListener('click', loadLoginPage);
}

// Function to load posts page
function loadPostsPage() {
    if (!currentUser) return loadLoginPage();

    const content = `
        <h2>Welcome, ${currentUser.username}!</h2>
        <button class="btn btn-success" id="create-post-btn">Create New Post</button>
        <div id="posts-list"></div>
    `;
    document.getElementById('main-content').innerHTML = content;

    loadPosts();

    document.getElementById('create-post-btn').addEventListener('click', loadCreatePostPage);
    document.getElementById('logout-link').style.display = 'inline-block';
    document.getElementById('login-link').style.display = 'none';
    document.getElementById('signup-link').style.display = 'none';

    document.getElementById('logout-link').addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        currentUser = null;
        loadLoginPage();
    });
}

// Function to load posts from localStorage
function loadPosts() {
    const postsList = document.getElementById('posts-list');
    postsList.innerHTML = '';

    postsDB.forEach(post => {
        const postElement = document.createElement('div');
        postElement.classList.add('post-card');
        postElement.innerHTML = `
            <h3>${post.title}</h3>
            <p>${post.content}</p>
            <button class="btn btn-primary" onclick="loadEditPostPage('${post.id}')">Edit</button>
            <button class="btn btn-danger" onclick="deletePost('${post.id}')">Delete</button>
            <div class="comment-section" id="comments-${post.id}">
                <h5>Comments</h5>
                <div class="comment-box">
                    <textarea id="comment-content-${post.id}" placeholder="Add a comment"></textarea>
                    <button onclick="addComment('${post.id}')">Add Comment</button>
                </div>
            </div>
        `;
        postsList.appendChild(postElement);
        loadComments(post.id);
    });
}

// Function to load the create post page
function loadCreatePostPage() {
    const content = `
        <h2>Create New Post</h2>
        <form id="create-post-form">
            <input type="text" id="post-title" class="form-control" placeholder="Post Title" required />
            <textarea id="post-content" class="form-control" placeholder="Post Content" required></textarea>
            <button type="submit" class="btn btn-primary mt-3">Create Post</button>
        </form>
    `;
    document.getElementById('main-content').innerHTML = content;

    document.getElementById('create-post-form').addEventListener('submit', function (e) {
        e.preventDefault();
        const title = document.getElementById('post-title').value;
        const content = document.getElementById('post-content').value;

        const newPost = {
            id: Date.now().toString(),
            title,
            content,
            author: currentUser.username,
            comments: [],
        };

        postsDB.push(newPost);
        localStorage.setItem('posts', JSON.stringify(postsDB));
        loadPostsPage();
    });
}

// Function to load the edit post page
function loadEditPostPage(postId) {
    const post = postsDB.find(p => p.id === postId);

    const content = `
        <h2>Edit Post</h2>
        <form id="edit-post-form">
            <input type="text" id="edit-post-title" class="form-control" value="${post.title}" required />
            <textarea id="edit-post-content" class="form-control" required>${post.content}</textarea>
            <button type="submit" class="btn btn-primary mt-3">Save Changes</button>
        </form>
    `;
    document.getElementById('main-content').innerHTML = content;

    document.getElementById('edit-post-form').addEventListener('submit', function (e) {
        e.preventDefault();
        post.title = document.getElementById('edit-post-title').value;
        post.content = document.getElementById('edit-post-content').value;

        localStorage.setItem('posts', JSON.stringify(postsDB));
        loadPostsPage();
    });
}

// Function to delete a post
function deletePost(postId) {
    const index = postsDB.findIndex(post => post.id === postId);
    if (index > -1) {
        postsDB.splice(index, 1);
        localStorage.setItem('posts', JSON.stringify(postsDB));
        loadPostsPage();
    }
}

// Function to add a comment
function addComment(postId) {
    const content = document.getElementById(`comment-content-${postId}`).value;
    if (!content) return;

    const post = postsDB.find(p => p.id === postId);
    post.comments.push({ username: currentUser.username, content });

    localStorage.setItem('posts', JSON.stringify(postsDB));
    loadPosts();
}

// Function to load comments for a specific post
function loadComments(postId) {
    const post = postsDB.find(p => p.id === postId);
    const commentSection = document.getElementById(`comments-${postId}`);
    commentSection.innerHTML = '';

    post.comments.forEach(comment => {
        const commentElement = document.createElement('div');
        commentElement.classList.add('comment');
        commentElement.innerHTML = `<strong>${comment.username}</strong>: ${comment.content}`;
        commentSection.appendChild(commentElement);
    });
}

// Initialize the app
if (currentUser) {
    loadPostsPage();
} else {
    loadLoginPage();
}
