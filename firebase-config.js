import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { initializeAppCheck, ReCaptchaV3Provider } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-check.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCsKcXAntIIrm-BEgfc12dykBby2SmUY48",
  authDomain: "book-club-13.firebaseapp.com",
  projectId: "book-club-13",
  storageBucket: "book-club-13.appspot.com",
  messagingSenderId: "1000248881",
  appId: "1:1000248881:web:7531778995a97576f3f009" 
};

const app = initializeApp(firebaseConfig);

const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider('6LfMO5ksAAAAAGM6VoEZUFbtxdSEjYwW6Mr2NE1T'),
  isTokenAutoRefreshEnabled: true
});

const auth = getAuth(app);

export { app, auth, appCheck };
