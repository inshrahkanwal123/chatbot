import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-auth.js";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";
import { auth, db } from "./firebase-config.js";
import { formatDate, showToast } from "./common.js";

const list = document.getElementById("history-list");
const loading = document.getElementById("history-loading");
const empty = document.getElementById("history-empty");
const search = document.getElementById("history-search");
const filter = document.getElementById("history-filter");
let currentUser = null;
let allItems = [];

function buildHistoryItem(item) {
  const article = document.createElement("article");
  article.className = "history-item";
  article.dataset.id = item.id;

  const top = document.createElement("div");
  top.className = "history-item-top";

  const content = document.createElement("div");
  const title = document.createElement("h3");
  title.textContent = item.title || item.question || "Untitled study item";
  const meta = document.createElement("div");
  meta.className = "history-meta";
  const badge = document.createElement("span");
  badge.className = "badge";
  badge.textContent = item.type === "video" ? "Video analysis" : "Question";
  const date = document.createElement("span");
  date.textContent = formatDate(item.createdAt || item.createdAtClient);
  meta.append(badge, date);

  const answer = document.createElement("p");
  answer.textContent = item.answer || "No saved answer.";
  content.append(title, meta, answer);

  const actions = document.createElement("div");
  actions.className = "history-actions";
  const open = document.createElement("a");
  open.href = `/chatbot?chat=${encodeURIComponent(item.id)}`;
  open.textContent = "Open";
  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "delete";
  remove.textContent = "Delete";
  remove.addEventListener("click", () => deleteItem(item.id, article));
  actions.append(open, remove);

  top.append(content, actions);
  article.appendChild(top);
  return article;
}

function render() {
  const term = search.value.trim().toLowerCase();
  const type = filter.value;
  const visible = allItems.filter((item) => {
    const text = `${item.title || ""} ${item.question || ""} ${item.answer || ""}`.toLowerCase();
    return (type === "all" || item.type === type) && (!term || text.includes(term));
  });

  list.replaceChildren(...visible.map(buildHistoryItem));
  empty.classList.toggle("hidden", visible.length > 0);
}

async function deleteItem(id, element) {
  if (!currentUser) return;
  if (!window.confirm("Delete this saved conversation permanently?")) return;
  try {
    await deleteDoc(doc(db, "users", currentUser.uid, "chats", id));
    allItems = allItems.filter((item) => item.id !== id);
    element.remove();
    render();
    showToast("History item deleted.", "success");
  } catch (error) {
    console.error(error);
    showToast("Could not delete the history item.", "error");
  }
}

async function loadHistory(user) {
  currentUser = user;
  try {
    const chatsQuery = query(
      collection(db, "users", user.uid, "chats"),
      orderBy("createdAt", "desc"),
      limit(100),
    );
    const snapshot = await getDocs(chatsQuery);
    allItems = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
  } catch (error) {
    // Older documents can be missing createdAt; use a non-ordered fallback.
    console.warn("Ordered history query failed, trying fallback", error);
    try {
      const snapshot = await getDocs(collection(db, "users", user.uid, "chats"));
      allItems = snapshot.docs
        .map((item) => ({ id: item.id, ...item.data() }))
        .sort((a, b) => (b.createdAtClient || 0) - (a.createdAtClient || 0));
    } catch (fallbackError) {
      console.error(fallbackError);
      showToast("Could not load chat history. Check Firestore rules.", "error");
    }
  } finally {
    loading.classList.add("hidden");
    render();
  }
}

search.addEventListener("input", render);
filter.addEventListener("change", render);
if (auth && db) onAuthStateChanged(auth, (user) => user && loadHistory(user));
