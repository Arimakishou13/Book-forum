# Book's Club

A community forum for readers. Plain HTML, CSS and ES modules, with Firebase Auth and Firestore. No build step.

## Structure

All files sit in the repository root. Pages link to each other, and the scripts are ES modules that import one another by relative path.

```
index.html            forum page (entry point)
profile.html          reader profile page
friends.html          find readers, requests, friends list
base.css              design tokens, reset, buttons
layout.css            header, hero, bookshelf, forum, footer
components.css        posts, dialogs, forms, toast
pages.css             profile and friends pages
main.js               entry point of index.html
profile.js            entry point of profile.html
friends-page.js       entry point of friends.html
firebase-config.js    project settings
firebase.js           Firebase init and re-exports
auth.js               login, register, account area
profiles.js           user profile documents and search
friends.js            friend requests and friendships
posts.js              discussion list, create, like, delete
threads.js            discussion dialog and replies
categories.js         categories and bookshelf
state.js              shared state
utils.js              helpers
firestore.rules       security rules
```

## Setup

1. In Firebase Console, enable Authentication (Email/Password) and create a Firestore database.
2. Paste `firestore.rules` into Firestore, Rules, then publish.
3. Fill `messagingSenderId` and `appId` in `js/firebase-config.js`.
4. Add your site domain under Authentication, Settings, Authorized domains.
5. Restrict the API key to your domain in Google Cloud Console.

## Run locally

ES modules need a server: `python -m http.server 8000`, then open http://localhost:8000.

## Deploy

Push to GitHub and enable Pages (branch `main`, root folder).
