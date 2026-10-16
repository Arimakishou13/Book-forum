// Single discussion dialog with live replies.
import { db, collection, addDoc, doc, updateDoc, onSnapshot, query, orderBy, limit, serverTimestamp, increment } from "./firebase.js";
import { state } from "./state.js";
import { $, esc, ago, toast, displayName } from "./utils.js";

let unsub = null;

export function openThread(id) {
  const p = state.posts.find(x => x.id === id);
  if (!p) return;
  state.currentThread = id;
  $("#threadHead").innerHTML = `<span class="tag">${esc(p.category)}</span><h2>${esc(p.title)}</h2>
    <div class="meta">${esc(p.author)} · ${ago(p.createdAt)}</div><p class="body">${esc(p.body)}</p>`;
  $("#replyForm").hidden = !state.user;
  $("#replyLogin").hidden = !!state.user;

  if (unsub) unsub();
  unsub = onSnapshot(query(collection(db, "posts", id, "replies"), orderBy("createdAt", "asc"), limit(100)),
    s => {
      $("#replies").innerHTML = s.empty
        ? `<p class="reply none">No replies yet. Add the first one.</p>`
        : s.docs.map(d => { const r = d.data();
            return `<div class="reply"><b>${esc(r.author)}</b><span class="meta">${ago(r.createdAt)}</span><p class="body">${esc(r.body)}</p></div>`; }).join("");
    },
    () => { $("#replies").innerHTML = `<p class="reply">Couldn't load replies.</p>`; });

  if (!$("#threadDlg").open) $("#threadDlg").showModal();
}

// Called when login state changes while a thread is open.
export function refreshThread() {
  if (state.currentThread) openThread(state.currentThread);
}

export function initThreads() {
  $("#threadDlg").addEventListener("close", () => {
    state.currentThread = null;
    if (unsub) { unsub(); unsub = null; }
  });

  $("#replyForm").onsubmit = async e => {
    e.preventDefault();
    const id = state.currentThread;
    try {
      await addDoc(collection(db, "posts", id, "replies"), {
        body: $("#rBody").value.trim(), uid: state.user.uid, author: displayName(state.user), createdAt: serverTimestamp()
      });
      await updateDoc(doc(db, "posts", id), { replyCount: increment(1) });
      $("#rBody").value = "";
    } catch (err) { toast("Couldn't send the reply."); }
  };
}
