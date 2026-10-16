// Friend requests and friendships.
//   friendRequests/{from}_{to}  -> pending request
//   friendships/{uidA}_{uidB}   -> accepted (uids sorted)
import { db, collection, doc, setDoc, deleteDoc, onSnapshot, query, where, writeBatch, serverTimestamp } from "./firebase.js";
import { displayName } from "./utils.js";

export const pairId = (a, b) => [a, b].sort().join("_");

// Live view of everything that involves `uid`. Calls cb once all three lists loaded.
export function listenRelations(uid, cb, onError) {
  const rel = { friends: [], incoming: [], outgoing: [] };
  let loaded = 0;
  const seen = new Set();
  const watch = (key, q) => onSnapshot(q, s => {
    rel[key] = s.docs.map(d => d.data());
    if (!seen.has(key)) { seen.add(key); loaded++; }
    if (loaded === 3) cb({ ...rel });
  }, onError);
  const stops = [
    watch("friends", query(collection(db, "friendships"), where("users", "array-contains", uid))),
    watch("incoming", query(collection(db, "friendRequests"), where("to", "==", uid))),
    watch("outgoing", query(collection(db, "friendRequests"), where("from", "==", uid)))
  ];
  return () => stops.forEach(f => f());
}

export function statusFor(rel, otherUid) {
  const friend = rel.friends.find(f => f.users.includes(otherUid));
  if (friend) return { type: "friend", data: friend };
  const inc = rel.incoming.find(r => r.from === otherUid);
  if (inc) return { type: "incoming", data: inc };
  const out = rel.outgoing.find(r => r.to === otherUid);
  if (out) return { type: "outgoing", data: out };
  return { type: "none" };
}

export function relationHTML(st) {
  switch (st.type) {
    case "friend": return `<span class="chip">Friends</span><button class="btn small del" data-rel="remove">Remove</button>`;
    case "incoming": return `<button class="btn small primary" data-rel="accept">Accept</button><button class="btn small" data-rel="decline">Decline</button>`;
    case "outgoing": return `<span class="chip">Request sent</span><button class="btn small" data-rel="cancel">Cancel</button>`;
    default: return `<button class="btn small primary" data-rel="add">Add friend</button>`;
  }
}

const reqRef = (from, to) => doc(db, "friendRequests", `${from}_${to}`);

// Runs the action behind a [data-rel] button and returns a message for the toast.
export async function runRelation(kind, st, me, other) {
  if (kind === "add") {
    await setDoc(reqRef(me.uid, other.uid), {
      from: me.uid, to: other.uid, fromName: displayName(me), toName: other.displayName || "Reader", createdAt: serverTimestamp()
    });
    return "Friend request sent";
  }
  if (kind === "accept") {
    const r = st.data, [x, y] = [r.from, r.to].sort(), b = writeBatch(db);
    b.set(doc(db, "friendships", `${x}_${y}`), { users: [x, y], names: { [r.from]: r.fromName, [r.to]: r.toName }, createdAt: serverTimestamp() });
    b.delete(reqRef(r.from, r.to));
    await b.commit();
    return "You are now friends";
  }
  if (kind === "decline" || kind === "cancel") {
    await deleteDoc(reqRef(st.data.from, st.data.to));
    return kind === "decline" ? "Request declined" : "Request cancelled";
  }
  if (kind === "remove") {
    await deleteDoc(doc(db, "friendships", pairId(me.uid, other.uid)));
    return "Friend removed";
  }
}
