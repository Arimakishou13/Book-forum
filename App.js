import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } 
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "PUT YOUR API KEY",
  authDomain: "PUT YOUR DOMAIN",
  projectId: "PUT YOUR ID",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

window.login = function() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  signInWithEmailAndPassword(auth, email, password)
    .then(() => alert("Logged in 🔥"))
    .catch(() => {
      createUserWithEmailAndPassword(auth, email, password)
        .then(() => alert("Account created ✅"))
        .catch(err => alert(err.message));
    });
};