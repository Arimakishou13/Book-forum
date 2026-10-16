// Friends page: search readers, handle requests, list friends.
import { state } from "./state.js";
import { $, esc, toast, avatar, initTheme, initDialogs } from "./utils.js";
import { initAuth, openAuth } from "./auth.js";
import { loadProfiles, cached, searchUsers } from "./profiles.js";
import { listenRelations, statusFor, relationHTML, runRelation } from "./friends.js";

let rel = null, stopRel = null, results = null;

const person = (uid, name, color, extra) =>
  `<div class="person" data-uid="${esc(uid)}" data-name="${esc(name)}">${avatar(name, color, 40)}
   <a href="profile.html?uid=${encodeURIComponent(uid)}">${esc(name)}</a>${extra}</div>`;
const empty = text => `<p class="muted">${text}</p>`;
const nameOf = (uid, fallback) => cached(uid)?.displayName || fallback || "Reader";

async function draw() {
  if (!rel) return;
  const me = state.user.uid;
  const friendIds = rel.friends.map(f => f.users.find(u => u !== me));
  await loadProfiles([...friendIds, ...rel.incoming.map(r => r.from), ...rel.outgoing.map(r => r.to)]);

  $("#incoming").innerHTML = rel.incoming.length
    ? rel.incoming.map(r => person(r.from, nameOf(r.from, r.fromName), cached(r.from)?.avatar, relationHTML({ type: "incoming" }))).join("")
    : empty("No pending requests.");
  $("#outgoing").innerHTML = rel.outgoing.length
    ? rel.outgoing.map(r => person(r.to, nameOf(r.to, r.toName), cached(r.to)?.avatar, relationHTML({ type: "outgoing" }))).join("")
    : empty("You haven't sent any requests.");
  $("#friends").innerHTML = rel.friends.length
    ? rel.friends.map((f, i) => { const id = friendIds[i]; return person(id, nameOf(id, f.names?.[id]), cached(id)?.avatar, relationHTML({ type: "friend" })); }).join("")
    : empty("No friends yet. Search for a reader above and send a request.");

  if (results) {
    const list = results.filter(u => u.uid !== me);
    $("#results").innerHTML = list.length
      ? list.map(u => person(u.uid, u.displayName, u.avatar, relationHTML(statusFor(rel, u.uid)))).join("")
      : empty("No readers found with that name.");
  }
}

function load() {
  if (stopRel) { stopRel(); stopRel = null; }
  rel = null; results = null;
  const gate = $("#gate"), content = $("#content");
  if (!state.user) {
    content.hidden = true;
    gate.innerHTML = `<div class="empty">Log in to find readers and manage friends.<br><button class="btn primary" id="loginBtn">Log in</button></div>`;
    $("#loginBtn").onclick = () => openAuth("login");
    return;
  }
  gate.innerHTML = "";
  content.hidden = false;
  stopRel = listenRelations(state.user.uid, r => { rel = r; draw(); },
    () => { gate.innerHTML = `<div class="empty">Couldn't load your friends. Check your connection and your Firestore rules.</div>`; });
}

$("#searchForm").onsubmit = async e => {
  e.preventDefault();
  const text = $("#searchIn").value;
  if (!text.trim()) { results = null; $("#results").innerHTML = ""; return; }
  try { results = await searchUsers(text); draw(); }
  catch (err) { toast("Search failed. Check your Firestore rules."); }
};

$("#friendsPage").onclick = async e => {
  const b = e.target.closest("[data-rel]");
  if (!b || !rel) return;
  const row = b.closest(".person");
  const other = { uid: row.dataset.uid, displayName: row.dataset.name };
  try { toast(await runRelation(b.dataset.rel, statusFor(rel, other.uid), state.user, other)); }
  catch (err) { toast("Something went wrong. Try again."); }
};

initTheme();
initDialogs();
initAuth(load);
