// User profile documents (users/{uid}): create, read, save, search, cache.
import { db, doc, getDoc, setDoc, getDocs, collection, query, orderBy, startAt, endAt, limit, serverTimestamp } from "./firebase.js";
import { displayName } from "./utils.js";

export const COLORS = ["#7a3b8f", "#2f5f9e", "#2e7d62", "#a63d5a", "#b5651d", "#5a4fb0", "#3d8a9e", "#8a5a2b"];
const cache = new Map();

// Makes sure the signed-in user has a profile document and returns it.
export async function ensureUserDoc(u) {
  const ref = doc(db, "users", u.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) { const p = { uid: u.uid, ...snap.data() }; cache.set(u.uid, p); return p; }
  const name = displayName(u);
  const data = { displayName: name, nameLower: name.toLowerCase(), bio: "", favorites: [], avatar: COLORS[0], createdAt: serverTimestamp() };
  await setDoc(ref, data);
  const p = { uid: u.uid, ...data };
  cache.set(u.uid, p);
  return p;
}

export async function getProfile(uid, fresh = false) {
  if (!fresh && cache.has(uid)) return cache.get(uid);
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  const p = { uid, ...snap.data() };
  cache.set(uid, p);
  return p;
}

export async function loadProfiles(uids) {
  await Promise.all([...new Set(uids)].map(id => getProfile(id).catch(() => null)));
}
export const cached = uid => cache.get(uid);

export async function saveProfile(uid, data) {
  if (data.displayName) data.nameLower = data.displayName.toLowerCase();
  await setDoc(doc(db, "users", uid), data, { merge: true });
  cache.delete(uid);
  return getProfile(uid, true);
}

// Prefix search on display name.
export async function searchUsers(text) {
  const q = text.trim().toLowerCase();
  if (!q) return [];
  const s = await getDocs(query(collection(db, "users"), orderBy("nameLower"), startAt(q), endAt(q + "\uf8ff"), limit(10)));
  return s.docs.map(d => ({ uid: d.id, ...d.data() }));
}
