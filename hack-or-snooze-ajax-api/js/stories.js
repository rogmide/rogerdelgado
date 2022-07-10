"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;
let editStoryId = '';

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
        <span class="star">
            <i class="far fa-star"></i>
        </span>        
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
   
        <small class="story-hostname">(${hostName})</small>

        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

$('#btn-submit-story').on('click', async (e) => {
  try {
    if ($('#create-author').val() && $('#create-title').val() && $('#create-url').val()) {
      e.preventDefault();
      const newStory = await StoryList.addStory(currentUser.loginToken, $('#create-author').val(), $('#create-title').val(), $('#create-url').val());
      getAndShowStoriesOnStart();
      loadFavorites();
    }
  } catch (error) {
    alert('Enter Valid url');
  }
});


$('.stories-container').on('click', '.star', async (e) => {
  try {
    if ($(e.target).hasClass('far')) {
      $(e.target).removeClass('far');
      $(e.target).addClass('fas');
      const rep = await axios(`https://hack-or-snooze-v3.herokuapp.com/users/${currentUser.username}/favorites/${$(e.target).parent().parent().attr('id')}`,
        {
          method: 'POST',
          data: { "token": currentUser.loginToken, }
        });
      currentUser.favorites = rep.data.user.favorites;
      loadFavorites();
    } else {
      $(e.target).removeClass('fas');
      $(e.target).addClass('far');
      const rep = await axios(`https://hack-or-snooze-v3.herokuapp.com/users/${currentUser.username}/favorites/${$(e.target).parent().parent().attr('id')}`,
        {
          method: 'DELETE',
          data: { "token": currentUser.loginToken, }
        });
      currentUser.favorites = rep.data.user.favorites;
      loadFavorites();
    };
  } catch (error) {

  }
});

$('#all-user-stories-list').on('click', '.trash-can', async (e) => {
  try {
    const rep = await axios(`https://hack-or-snooze-v3.herokuapp.com/stories/${$(e.target).parents('li').attr('id')}`,
      {
        method: 'DELETE',
        data: { "token": currentUser.loginToken, }
      });
    $(e.target).parents('li').remove();
    $('#nav-my-stories').click();
  } catch (error) {

  }
});

$('#all-user-stories-list').on('click', '.edit', async (e) => {
  $('.story-form').show();
  $('#btn-submit-story').hide();
  $('#btn-submit-edit').show();
  editStoryId = $(e.target).parents('li').attr('id');
  const editStory = currentUser.ownStories.find(e => (e.storyId === editStoryId));
  $('#create-author').val(editStory.author);
  $('#create-title').val(editStory.title);
  $('#create-url').val(editStory.url);
});

$('#btn-submit-edit').on('click', () => {
  editStory(editStoryId);
});

/*
{
  "token": "YOUR_TOKEN_HERE",
  "story": {
    "author": "Not Matt Lane"
  }
}
*/
async function editStory(id) {
  try {
    if ($('#create-author').val() && $('#create-title').val() && $('#create-url').val()) {
      const rep = await axios(`https://hack-or-snooze-v3.herokuapp.com/stories/${id}`,
        {
          method: 'PATCH',
          data: { "token": currentUser.loginToken, "story": { "author": $('#create-author').val(), "title": $('#create-title').val(), "url": $('#create-url').val() } }
        });
      $('#nav-my-stories').click();
      $('#btn-submit-story').show();
      $('#btn-submit-edit').hide();
    }

  } catch (error) {

  }
}