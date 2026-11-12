import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-auth.js";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  writeBatch,
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";
import { auth, db } from "./firebase-config.js";
import { applyTheme, setButtonLoading, showToast } from "./common.js";

const form = document.getElementById("settings-form");
const theme = document.getElementById("setting-theme");
const responseStyle = document.getElementById("setting-response-style");
const simpleLanguage = document.getElementById("setting-simple-language");
const language = document.getElementById("setting-language");
const clearButton = document.getElementById("clear-history-button");
let currentUser = null;

async function loadSettings(user) {
  currentUser = user;
  const localTheme = localStorage.getItem("study-theme") || "light";
  theme.value = localTheme;
  try {
    const snapshot = await getDoc(doc(db, "users", user.uid, "settings", "preferences"));
    if (snapshot.exists()) {
      const data = snapshot.data();
      theme.value = data.theme || localTheme;
      responseStyle.value = data.responseStyle || "balanced";
      simpleLanguage.checked = data.simpleLanguage !== false;
      language.value = data.language || "English";
      applyTheme(theme.value);
    }
  } catch (error) {
    console.error(error);
    showToast("Could not load saved settings.", "error");
  }
}

theme.addEventListener("change", () => applyTheme(theme.value));

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!currentUser) return;
  const button = document.getElementById("settings-save");
  setButtonLoading(button, true, "Saving...");
  try {
    await setDoc(doc(db, "users", currentUser.uid, "settings", "preferences"), {
      theme: theme.value,
      responseStyle: responseStyle.value,
      simpleLanguage: simpleLanguage.checked,
      language: language.value,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    applyTheme(theme.value);
    showToast("Settings saved.", "success");
  } catch (error) {
    console.error(error);
    showToast("Could not save settings.", "error");
  } finally {
    setButtonLoading(button, false);
  }
});

clearButton.addEventListener("click", async () => {
  if (!currentUser) return;
  if (!window.confirm("Delete every saved chat and video analysis? This cannot be undone.")) return;
  setButtonLoading(clearButton, true, "Deleting...");
  try {
    const snapshot = await getDocs(collection(db, "users", currentUser.uid, "chats"));
    const docs = snapshot.docs;
    for (let start = 0; start < docs.length; start += 450) {
      const batch = writeBatch(db);
      docs.slice(start, start + 450).forEach((item) => batch.delete(item.ref));
      await batch.commit();
    }
    showToast(`Deleted ${docs.length} saved item${docs.length === 1 ? "" : "s"}.`, "success");
  } catch (error) {
    console.error(error);
    showToast("Could not clear all history. Check Firestore rules.", "error");
  } finally {
    setButtonLoading(clearButton, false);
  }
});

if (auth && db) onAuthStateChanged(auth, (user) => user && loadSettings(user));
