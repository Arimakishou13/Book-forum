// Discussion list: live listener, rendering, create / like / delete.
import { db, collection, addDoc, deleteDoc, doc, updateDoc, onSnapshot, query, orderBy, limit, serverTimestamp, arrayUnion, arrayRemove } from "./firebase.js";
import { state } from "./state.js";
import { $, esc, ago, toast, displayName, authorLink } from "./utils.js";
import { requireLogin } from "./auth.js";
import { openThread } from "./threads.js";

export function render() {
  const q = $("#q").value.trim().toLowerCase();
  const list = state.posts.filter(p =>
    (state.category === "All" || p.category === state.category) &&
    (!q || (p.title + " " + p.body).toLowerCase().includes(q)));

  if (!list.length) {
    const none = !state.posts.length;
    $("#list").innerHTML = `<div class="empty">${none ? "No discussions yet. Be the first to start one." : "No discussions match your search."}${none ? '<br><button class="btn primary" id="emptyBtn">Start a discussion</button>' : ""}</div>`;
    if (none) $("#emptyBtn").onclick = startDiscussion;
    return;
  }

  $("#list").innerHTML = list.map(p => {
    const liked = state.user && (p.likes || []).includes(state.user.uid);
    const mine = state.user && state.user.uid === p.uid;
    const body = p.body.length > 200 ? p.body.slice(0, 200) + "…" : p.body;
    return `<article class="post"><span class="tag">${esc(p.category)}</span>
      <h3><button data-act="open" data-id="${p.id}">${esc(p.title)}</button></h3>
      <p class="excerpt">${esc(body)}</p>
      <div class="meta"><span class="grow">${authorLink(p.uid, p.author)} · ${ago(p.createdAt)}</span>
        <button class="btn small ${liked ? "liked" : ""}" data-act="like" data-id="${p.id}" aria-pressed="${!!liked}">♥ ${(p.likes || []).length}</button>
        <button class="btn small" data-act="open" data-id="${p.id}">${p.replyCount || 0} replies</button>
        ${mine ? `<button class="btn small del" data-act="del" data-id="${p.id}">Delete</button>` : ""}
      </div></article>`;
  }).join("");
}

function startDiscussion() {
  if (requireLogin()) return;
  $("#postDlg").showModal();
}

async function onListClick(e) {
  const b = e.target.closest("[data-act]");
  if (!b) return;
  const id = b.dataset.id, p = state.posts.find(x => x.id === id);
  if (b.dataset.act === "open") openThread(id);
  if (b.dataset.act === "like" && !requireLogin()) {
    const has = (p.likes || []).includes(state.user.uid);
    try { await updateDoc(doc(db, "posts", id), { likes: has ? arrayRemove(state.user.uid) : arrayUnion(state.user.uid) }); }
    catch (err) { toast("Couldn't update the like."); }
  }
  if (b.dataset.act === "del" && confirm("Delete this discussion?")) {
    try { await deleteDoc(doc(db, "posts", id)); toast("Deleted"); }
    catch (err) { toast("Couldn't delete."); }
  }
}

export function initPosts() {
  $("#startBtn").onclick = startDiscussion;
  $("#list").onclick = onListClick;
  $("#q").oninput = render;

  $("#postForm").onsubmit = async e => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "posts"), {
        title: $("#pTitle").value.trim(), body: $("#pBody").value.trim(), category: $("#pCat").value,
        uid: state.user.uid, author: displayName(state.user), likes: [], replyCount: 0, createdAt: serverTimestamp()
      });
      $("#postDlg").close(); $("#postForm").reset(); toast("Published");
    } catch (err) { toast("Couldn't publish. Check your Firestore rules."); }
  };

  onSnapshot(query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(50)),
    s => { state.posts = s.docs.map(d => ({ id: d.id, ...d.data() })); render(); },
    () => { $("#list").innerHTML = `<div class="empty">Couldn't load discussions. Check your connection and your Firestore rules.</div>`; });
}
