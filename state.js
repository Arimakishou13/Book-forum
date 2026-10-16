// Shared app state (one object, imported by every module).
export const state = {
  user: null,      // Firebase auth user
  profile: null,   // the user's Firestore profile document
  posts: [],
  category: "All",
  currentThread: null
};
