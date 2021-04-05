"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;
// let favoriteStoryList; - delete

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}
// async function getFavoriteStoriesOnStart() {
//   favoriteStoryList = await StoryList.getFavoriteStories();
// } -- delete

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story, showDeleteBtn = false) {
  // console.debug("generateStoryMarkup", story);
  const hostName = story.getHostName();
  const showStar = Boolean(currentUser);
  return $(`
      <li id="${story.storyId}">
        ${showDeleteBtn ? getDeleteBtnHTML() : ""}
        ${showStar ? getStarHTML(story, currentUser) : ""}
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
  $myStoriesList.hide();
  $favoriteStoriesList.hide();
  $allStoriesList.show();
}

//
function putFavoriteStoriesOnPage() {
  console.debug("putFavoriteStoriesOnPage");

  $favoriteStoriesList.empty();
  if (currentUser.favorites.length === 0) {
    $favoriteStoriesList.append(
      "<h5>Click the star next to the story to add a favorite</h5>"
    );
  } else {
    for (let story of currentUser.favorites) {
      const $story = generateStoryMarkup(story);
      $favoriteStoriesList.append($story);
    }
  }
  $myStoriesList.hide();
  $allStoriesList.hide();
  $favoriteStoriesList.show();
}
//
function putMyStoriesOnPage() {
  console.debug("putMyStoriesOnPage");

  $myStoriesList.empty();
  if (currentUser.ownStories.length === 0) {
    $myStoriesList.append("<h5>No Stories Yet</h5>");
  } else {
    for (let story of currentUser.ownStories) {
      const $story = generateStoryMarkup(story, true);
      $myStoriesList.append($story);
    }
  }
  $allStoriesList.hide();
  $favoriteStoriesList.hide();
  $myStoriesList.show();
}

// star HTML
function getStarHTML(story, user) {
  const isFavorite = user.isFavorite(story);
  const starType = isFavorite ? "fas" : "far";
  return `
  <a href="#" class="star">
    <i class="${starType} fa-star"></i>
  </a>`;
}

// DeleteBtn HTML
function getDeleteBtnHTML() {
  return `
  <a href="#" class="trash">
    <i class="fa fa-trash" aria-hidden="true"></i>
  </a>`;
}

async function submitNewStory(evt) {
  console.debug("submitNewStory", evt);
  evt.preventDefault();

  let newStory = {
    title: $("#newStory-title").val(),
    author: $("#newStory-author").val(),
    url: $("#newStory-url").val(),
  };

  // User.signup retrieves user info from API and returns User instance
  // which we'll make the globally-available, logged-in user.
  // currentUser = await User.signup(username, password, name);
  await StoryList.addStory(currentUser, newStory);
  $newStoryForm.trigger("reset");
  getAndShowStoriesOnStart();
}

$newStoryForm.on("submit", submitNewStory);

async function toggleStoryFavorite(evt) {
  const $target = $(evt.target);
  const storyId = $(evt.target).closest("li").attr("id");
  const story = storyList.stories.find((s) => s.storyId === storyId);

  if ($target.hasClass("fas")) {
    await currentUser.removeFavorite(story);
    $target.closest("i").toggleClass("fas far");
  } else {
    await currentUser.addFavorite(story);
    $target.closest("i").toggleClass("fas far");
  }
  // await updateUIOnUserLogin();
}
$storiesLists.on("click", ".star", toggleStoryFavorite);

//----delete stories ---
async function deleteStory(evt) {
  const $target = $(evt.target);
  const storyId = $(evt.target).closest("li").attr("id");

  await storyList.removeStory(currentUser, storyId);
  await putMyStoriesOnPage();
}
$storiesLists.on("click", ".trash", deleteStory);
