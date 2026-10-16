// Login / register dialog, header account area, and the login guard.
import { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, onAuthStateChanged } from "./firebase.js";
import { state } from "./state.js";
import { $, esc, toast, displayName, avatar } from "./utils.js";
import { ensureUserDoc, saveProfile } from "./profiles.js";

let mode = "login";

const AUTH_DIALOG = `
<dialog id="authDlg">
  <h2 id="authTitle">Welcome back</h2>
  <div class="tabs" role="tablist">
    <button class="btn" role="tab" id="tabLogin" aria-selected="true">Log in</button>
    <button class="btn" role="tab" id="tabReg" aria-selected="false">Create account</button>
  </div>
  <form id="authForm">
    <label class="field" id="nameRow" hidden><span>Display name</span><input id="nameIn" maxlength="30" autocomplete="nickname"></label>
    <label class="field"><span>Email</span><input id="emailIn" type="email" required autocomplete="email"></label>
    <label class="field"><span>Password (6+ characters)</span><input id="passIn" type="password" required minlength="6" autocomplete="current-password"></label>
    <p class="err" id="authErr"></p>
    <div class="row"><button type="button" class="btn" data-close>Cancel</button><button class="btn primary" id="authSubmit">Log in</button></div>
  </form>
</dialog>`;

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

export function refreshAccount() {
  const u = state.user;
  $("#auth").innerHTML = u
    ? `<div class="me"><a class="navlink" href="friends.html">Friends</a>
        <a class="navlink who" href="profile.html" aria-label="Your profile">${avatar(displayName(u), state.profile?.avatar, 32)}<span>${esc(displayName(u))}</span></a>
        <button class="btn small" id="out">Log out</button></div>`
    : `<button class="btn primary" id="inBtn">Log in</button>`;
  if (u) $("#out").onclick = () => signOut(auth).then(() => toast("Logged out"));
  else $("#inBtn").onclick = () => openAuth("login");
}

export function initAuth(onChange) {
  if (!$("#authDlg")) document.body.insertAdjacentHTML("beforeend", AUTH_DIALOG);
  $("#tabLogin").onclick = () => openAuth("login");
  $("#tabReg").onclick = () => openAuth("register");
  document.addEventListener("click", e => {
    if (e.target.closest("[data-login]")) { $("#threadDlg")?.close(); openAuth("login"); }
  });

  $("#authForm").onsubmit = async e => {
    e.preventDefault();
    $("#authErr").textContent = "";
    const email = $("#emailIn").value.trim(), pass = $("#passIn").value;
    try {
      if (mode === "register") {
        const c = await createUserWithEmailAndPassword(auth, email, pass);
        const name = $("#nameIn").value.trim();
        if (name) {
          await updateProfile(c.user, { displayName: name });
          state.profile = await saveProfile(c.user.uid, { displayName: name });
        }
        toast("Account created");
      } else {
        await signInWithEmailAndPassword(auth, email, pass);
        toast("Logged in");
      }
      $("#authDlg").close();
      $("#authForm").reset();
      refreshAccount();
    } catch (err) {
      $("#authErr").textContent = ERRORS[err.code] || "Something went wrong. Check your connection and try again.";
    }
  };

  onAuthStateChanged(auth, async u => {
    state.user = u;
    state.profile = null;
    refreshAccount();
    if (u) {
      try { state.profile = await ensureUserDoc(u); refreshAccount(); }
      catch (err) { console.warn("Profile document unavailable. Check Firestore rules.", err); }
    }
    onChange();
  });
}
