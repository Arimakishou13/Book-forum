# Book's Club

A community forum for readers. Plain HTML, CSS and ES modules, with Firebase Auth and Firestore. No build step.

## Structure

```
index.html            page markup and dialogs
css/base.css          design tokens, reset, buttons
css/layout.css        header, hero, bookshelf, forum, footer
css/components.css    posts, dialogs, forms, toast
js/main.js            entry point
js/firebase-config.js project settings
js/firebase.js        Firebase init and re-exports
js/auth.js            login, register, account area
js/posts.js           discussion list, create, like, delete
js/threads.js         discussion dialog and replies
js/categories.js      categories and bookshelf
js/state.js           shared state
js/utils.js           helpers (escape, time, toast, theme)
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
