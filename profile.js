// Profile page: view any reader's profile, edit your own, manage friendship.
import { auth, updateProfile } from "./firebase.js";
import { state } from "./state.js";
import { $, esc, toast, avatar, initTheme, initDialogs } from "./utils.js";
import { initAuth, openAuth, refreshAccount } from "./auth.js";
import { COLORS, getProfile, saveProfile } from "./profiles.js";
import { listenRelations, statusFor, relationHTML, runRelation } from "./friends.js";

let viewed = null, rel = null, stopRel = null, color = COLORS[0];

function drawActions() {
  const box = $("#actions");
  if (!box || !viewed) return;
  if (viewed.uid === state.user.uid) {
    box.innerHTML = `<button class="btn primary" id="editBtn">Edit profile</button><a class="btn" href="friends.html">Find friends</a>`;
    $("#editBtn").onclick = openEdit;
  } else if (rel) {
    box.innerHTML = relationHTML(statusFor(rel, viewed.uid));
  }
}

function drawCard() {
  const v = viewed, own = v.uid === state.user.uid;
  const favs = (v.favorites || []).map(f => `<span class="chip">${esc(f)}</span>`).join("");
  $("#profile").innerHTML = `<div class="pcard">${avatar(v.displayName, v.avatar, 88)}
    <div><h1>${esc(v.displayName)}</h1>
    <p class="bio">${v.bio ? esc(v.bio) : own ? "Add a short bio so other readers know you." : "No bio yet."}</p>
    ${favs ? `<p class="muted" style="margin-bottom:6px">Favourite books</p><div class="chips">${favs}</div>` : ""}
    <div class="actions" id="actions"></div></div></div>`;
  drawActions();
}

async function load() {
  if (stopRel) { stopRel(); stopRel = null; }
  rel = null;
  const root = $("#profile");
  if (!state.user) {
    root.innerHTML = `<div class="empty">Log in to see reader profiles.<br><button class="btn primary" id="loginBtn">Log in</button></div>`;
    $("#loginBtn").onclick = () => openAuth("login");
    return;
  }
  const uid = new URLSearchParams(location.search).get("uid") || state.user.uid;
  root.innerHTML = `<p class="empty">Loading profile…</p>`;
  try { viewed = await getProfile(uid, true); }
  catch (err) { root.innerHTML = `<div class="empty">Couldn't load this profile. Check your connection and your Firestore rules.</div>`; return; }
  if (!viewed) { root.innerHTML = `<div class="empty">This profile doesn't exist.<br><a class="btn primary" href="index.html">Back to the forum</a></div>`; return; }
  drawCard();
  stopRel = listenRelations(state.user.uid, r => { rel = r; drawActions(); },
    () => toast("Couldn't load friend status."));
}

/* friend buttons */
$("#profile").onclick = async e => {
  const b = e.target.closest("[data-rel]");
  if (!b || !rel) return;
  try { toast(await runRelation(b.dataset.rel, statusFor(rel, viewed.uid), state.user, viewed)); }
  catch (err) { toast("Something went wrong. Try again."); }
};

/* edit dialog */
function drawSwatches() {
  $("#swatches").innerHTML = COLORS.map(c =>
    `<button type="button" class="swatch" style="--c:${c}" data-color="${c}" aria-label="Colour ${c}" aria-pressed="${c === color}"></button>`).join("");
}
function openEdit() {
  $("#eName").value = viewed.displayName;
  $("#eBio").value = viewed.bio || "";
  $("#eFavs").value = (viewed.favorites || []).join(", ");
  color = viewed.avatar || COLORS[0];
  drawSwatches();
  $("#editDlg").showModal();
}
$("#swatches").onclick = e => { const b = e.target.closest(".swatch"); if (b) { color = b.dataset.color; drawSwatches(); } };

$("#editForm").onsubmit = async e => {
  e.preventDefault();
  const favorites = $("#eFavs").value.split(",").map(s => s.trim().slice(0, 60)).filter(Boolean).slice(0, 5);
  const data = { displayName: $("#eName").value.trim(), bio: $("#eBio").value.trim(), favorites, avatar: color };
  try {
    await updateProfile(auth.currentUser, { displayName: data.displayName });
    viewed = await saveProfile(state.user.uid, data);
    state.profile = viewed;
    $("#editDlg").close();
    refreshAccount();
    drawCard();
    toast("Profile saved");
  } catch (err) { toast("Couldn't save your profile. Check your Firestore rules."); }
};

initTheme();
initDialogs();
initAuth(load);
