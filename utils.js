// Small helpers: DOM shortcuts, escaping, time, toast, theme, dialog closing.
export const $ = s => document.querySelector(s);
export const $$ = s => document.querySelectorAll(s);

export const esc = s => String(s).replace(/[&<>"']/g, c =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export const displayName = u => u.displayName || u.email.split("@")[0];

export function ago(ts) {
  if (!ts) return "just now";
  const s = (Date.now() - ts.toMillis()) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return Math.floor(s / 60) + " min ago";
  if (s < 86400) return Math.floor(s / 3600) + " h ago";
  return Math.floor(s / 86400) + " d ago";
}

let toastTimer;
export function toast(text) {
  const el = $("#toast");
  el.textContent = text;
  el.classList.add("on");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("on"), 2600);
}

export function initTheme() {
  const root = document.documentElement;
  if (!$("#toast")) document.body.insertAdjacentHTML("beforeend", '<div id="toast" role="status"></div>');
  try { const t = localStorage.getItem("theme"); if (t) root.dataset.theme = t; } catch (e) {}
  $("#theme").onclick = () => {
    root.dataset.theme = root.dataset.theme === "light" ? "dark" : "light";
    try { localStorage.setItem("theme", root.dataset.theme); } catch (e) {}
  };
}

export function initDialogs() {
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-close]");
    if (b) b.closest("dialog").close();
  });
}

const AVATAR_FALLBACK = "#7a3b8f";
export const avatar = (name, color, size = 34) => {
  const c = /^#[0-9a-f]{6}$/i.test(color || "") ? color : AVATAR_FALLBACK;
  const letter = ((name || "?").trim()[0] || "?").toUpperCase();
  return `<span class="avatar" style="width:${size}px;height:${size}px;font-size:${Math.round(size * .45)}px;background:${c}" aria-hidden="true">${esc(letter)}</span>`;
};

export const authorLink = (uid, name) =>
  `<a class="authorlink" href="profile.html?uid=${encodeURIComponent(uid)}">${esc(name)}</a>`;
