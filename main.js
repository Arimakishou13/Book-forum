// Entry point: wires the modules together.
import { initTheme, initDialogs } from "./utils.js";
import { initCategories } from "./categories.js";
import { initAuth } from "./auth.js";
import { initPosts, render } from "./posts.js";
import { initThreads, refreshThread } from "./threads.js";

initTheme();
initDialogs();
initCategories();
initThreads();
initPosts();
initAuth(() => { render(); refreshThread(); });
