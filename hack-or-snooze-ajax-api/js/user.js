"use strict";

// global to hold the User instance of the currently-logged-in user
let currentUser;

/******************************************************************************
 * User login/signup/login
 */

/** Handle login form submission. If login ok, sets up the user instance */

async function login(evt) {
  console.debug("login", evt);
  evt.preventDefault();

  // grab the username and password
  const username = $("#login-username").val();
  const password = $("#login-password").val();

  // User.login retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
  currentUser = await User.login(username, password);

  $loginForm.trigger("reset");
  $('#login-form').hide();
  $('#signup-form').hide();
  $('.nav-story').show();

  saveUserCredentialsInLocalStorage();
  updateUIOnUserLogin();
  loadFavorites();
}



$loginForm.on("submit", login);

/** Handle signup form submission. */

async function signup(evt) {
  if ($("#signup-name").val() && $("#signup-username").val() && $("#signup-password").val()) {
    console.debug("signup", evt);
    evt.preventDefault();

    const name = $("#signup-name").val();
    const username = $("#signup-username").val();
    const password = $("#signup-password").val();

    // User.signup retrieves user info from API and returns User instance
    // which we'll make the globally-available, logged-in user.
    try {
      currentUser = await User.signup(username, password, name);
      $('#login-form').hide();
      $('#signup-form').hide();
      $('.nav-story').show();

      saveUserCredentialsInLocalStorage();
      updateUIOnUserLogin();
    } catch (error) {
      alert('The User Already Exist');
    }

    $signupForm.trigger("reset");
  } else {
    return
  }

}

$signupForm.on("submit", signup);

/** Handle click of logout button
 *
 * Remove their credentials from localStorage and refresh page
 */

function logout(evt) {
  console.debug("logout", evt);
  localStorage.clear();
  location.reload();
}

$navLogOut.on("click", logout);

/******************************************************************************
 * Storing/recalling previously-logged-in-user with localStorage
 */

/** If there are user credentials in local storage, use those to log in
 * that user. This is meant to be called on page load, just once.
 */

async function checkForRememberedUser() {
  console.debug("checkForRememberedUser");
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  if (!token || !username) return false;

  // try to log in with these credentials (will be null if login failed)
  currentUser = await User.loginViaStoredCredentials(token, username);
}

/** Sync current user information to localStorage.
 *
 * We store the username/token in localStorage so when the page is refreshed
 * (or the user revisits the site later), they will still be logged in.
 */

function saveUserCredentialsInLocalStorage() {
  console.debug("saveUserCredentialsInLocalStorage");
  if (currentUser) {
    localStorage.setItem("token", currentUser.loginToken);
    localStorage.setItem("username", currentUser.username);
  }
}

/******************************************************************************
 * General UI stuff about users
 */

/** When a user signs up or registers, we want to set up the UI for them:
 *
 * - show the stories list
 * - update nav bar options for logged-in user
 * - generate the user profile part of the page
 */

function updateUIOnUserLogin() {
  console.debug("updateUIOnUserLogin");

  $allStoriesList.show();

  updateNavOnLogin();
}

async function loadFavorites() {
  storyList = await StoryList.getStories();
  storyList.stories.forEach(ele => {
    if (isFavorite(ele.storyId)) {
      let target = document.getElementById(ele.storyId);
      $(target).find('i').removeClass('far');
      $(target).find('i').addClass('fas');
    };
  });
  $('.story-form').hide();
  $('.user-stories-list').hide();
}

async function myStorys() {
  storyList = await StoryList.getStories();
  let item = '';
  $('.user-stories-list').empty();
  storyList.stories.forEach(ele => {
    if (isOwn(ele.username)) {
      let isFav = isFavorite(ele.storyId) ? "fas" : "far";
      item = $(`
      <li id="${ele.storyId}">
        <span class="trash-can">
          <i class="fas fa-trash-alt"></i>
        </span>
        <span class="">
            <i class="${isFav} fa-star"></i>
        </span>
        <span class="edit">
            <i class="fa-solid fa-pen-to-square"></i>
        </span>
        <a href="${ele.url}" target="a_blank" class="story-link">
          ${ele.title}
        </a>  
 
        <small class="story-hostname">(${ele.url})</small>
        <small class="story-author">by ${ele.author}</small>
        <small class="story-user">posted by ${ele.username}</small>
      </li>
    `);
      $('.user-stories-list').append(item);
    }
  });
  $('.user-stories-list').show();
  $('.story-form').hide();
}

function isFavorite(id) {
  return currentUser.favorites.find(s => (s.storyId === id));
}

function isOwn(user) {
  return currentUser.ownStories.find(s => (s.username === user));
}

$('.navbar-brand').on('click', '#nav-my-stories', (e) => {
  $('#all-stories-list').hide();
  myStorys();
});

$('.navbar-brand').on('click', '#nav-favorites', (e) => {
  $('#all-stories-list').show();
  $('.user-stories-list').hide();
  $('.story-form').hide();
  $('.stories-list li span .far').parents('li').hide();
});


$('.nav-right').on('click', '#nav-user-profile', async (e) => {
  $('#all-stories-list').hide();
  $('#edit-form').show();
});

$('.edit-user').on('click', async (e) => {
  if ($('#edit-name').val() && $('#edit-password').val()) {
    e.preventDefault();
    try {
      currentUser = await User.update(currentUser.loginToken, currentUser.username, $('#edit-name').val(), $('#edit-password').val());
      $('#edit-form').hide();
      alert('Name and Password Updated');
      start();
    } catch (error) {
      console.log(error);
      alert('');
    }
  }
});

