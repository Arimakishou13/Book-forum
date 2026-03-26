import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } 
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCSKcXAntIIrm-BEgfCi2dykBby2SMuY48",
  authDomain: "book-club-13.firebaseapp.com",
  projectId: "book-club-13",
  storageBucket: "book-club-13.firebasestorage.app",
  messagingSenderId: "321914571323",
  appId: "1:321914571323:web:edfc6bc0ac802e6dd06a1e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

window.login = function() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  if(!email || !password) return;

  signInWithEmailAndPassword(auth, email, password)
    .then(() => alert("Logged in 🔥"))
    .catch(() => {
      createUserWithEmailAndPassword(auth, email, password)
        .then(() => alert("Account created ✅"))
        .catch(err => alert(err.message));
    });
};
