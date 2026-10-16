// Categories, the clickable bookshelf, and the category dropdowns.
import { state } from "./state.js";
import { $, $$ } from "./utils.js";
import { render } from "./posts.js";

// [name, spine colour, spine height in px]
export const CATS = [
  ["Novels", "#7a3b8f", 230], ["Sci-fi", "#2f5f9e", 200], ["Self-growth", "#b5651d", 245],
  ["Classics", "#2e7d62", 190], ["Poetry", "#a63d5a", 215], ["Non-fiction", "#5a4fb0", 235]
];

function setCategory(c) {
  state.category = c;
  $("#catFilter").value = c;
  $$(".spine").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.cat === c)));
  render();
}

export function initCategories() {
  $("#shelf").innerHTML = CATS.map(([n, c, h]) =>
    `<button class="spine" style="--c:${c};--h:${h}px" aria-pressed="false" data-cat="${n}">${n}</button>`).join("");
  $("#catFilter").innerHTML = `<option>All</option>` + CATS.map(c => `<option>${c[0]}</option>`).join("");
  $("#pCat").innerHTML = CATS.map(c => `<option>${c[0]}</option>`).join("");

  $("#shelf").onclick = e => {
    const b = e.target.closest(".spine");
    if (b) setCategory(state.category === b.dataset.cat ? "All" : b.dataset.cat);
  };
  $("#catFilter").onchange = e => setCategory(e.target.value);
}
