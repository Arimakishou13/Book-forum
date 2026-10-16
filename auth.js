// Login / register dialog, header account area, and the login guard.
import { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, onAuthStateChanged } from "./firebase.js";
import { state } from "./state.js";
import { $, esc, toast, displayName } from "./utils.js";

let mode = "login";

const ERRORS = {
  "auth/invalid-credential": "Wrong email or password.",
  "auth/email-already-in-use": "That email already has an account. Try logging in.",
  "auth/weak-password": "Use a password with at least 6 characters.",
  "auth/invalid-email": "Enter a valid email address.",
  "auth/too-many-requests": "Too many attempts. Wait a minute and try again."
};

export function openAuth(m) {
  mode = m;
  const reg = m === "register";
  $("#authTitle").textContent = reg ? "Join Book's Club" : "Welcome back";
  $("#nameRow").hidden = !reg;
  $("#authSubmit").textContent = reg ? "Create account" : "Log in";
  $("#tabLogin").setAttribute("aria-selected", String(!reg));
  $("#tabReg").setAttribute("aria-selected", String(reg));
  $("#authErr").textContent = "";
  if (!$("#authDlg").open) $("#authDlg").showModal();
}

// Returns true (and opens the login dialog) when nobody is logged in.
export function requireLogin() {
  if (state.user) return false;
  openAuth("login");
  toast("Log in to continue");
  return true;
}

function renderAccount(u) {
  $("#auth").innerHTML = u
    ? `<div class="me"><span class="avatar" aria-hidden="true">${esc(displayName(u)[0].toUpperCase())}</span><span>${esc(displayName(u))}</span><button class="btn small" id="out">Log out</button></div>`
    : `<button class="btn primary" id="inBtn">Log in</button>`;
  if (u) $("#out").onclick = () => signOut(auth).then(() => toast("Logged out"));
  else $("#inBtn").onclick = () => openAuth("login");
}

export function initAuth(onChange) {
  $("#tabLogin").onclick = () => openAuth("login");
  $("#tabReg").onclick = () => openAuth("register");
  document.addEventListener("click", e => {
    if (e.target.closest("[data-login]")) { $("#threadDlg").close(); openAuth("login"); }
  });

  $("#authForm").onsubmit = async e => {
    e.preventDefault();
    $("#authErr").textContent = "";
    const email = $("#emailIn").value.trim(), pass = $("#passIn").value;
    try {
      if (mode === "register") {
        const c = await createUserWithEmailAndPassword(auth, email, pass);
        const name = $("#nameIn").value.trim();
        if (name) await updateProfile(c.user, { displayName: name });
        toast("Account created");
      } else {
        await signInWithEmailAndPassword(auth, email, pass);
        toast("Logged in");
      }
      $("#authDlg").close();
      $("#authForm").reset();
    } catch (err) {
      $("#authErr").textContent = ERRORS[err.code] || "Something went wrong. Check your connection and try again.";
    }
  };

  onAuthStateChanged(auth, u => {
    state.user = u;
    renderAccount(u);
    onChange();
  });
}
