import { onAuthStateChanged, updateProfile } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-auth.js";
import {
  collection,
  doc,
  getCountFromServer,
  getDoc,
  serverTimestamp,
  setDoc,
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";
import { auth, db } from "./firebase-config.js";
import { formatDate, setButtonLoading, showToast } from "./common.js";

const form = document.getElementById("profile-form");
const nameInput = document.getElementById("profile-name");
const emailInput = document.getElementById("profile-email-input");
const levelInput = document.getElementById("profile-level");
const interestInput = document.getElementById("profile-interest");
const displayName = document.getElementById("profile-display-name");
const displayEmail = document.getElementById("profile-email");
const avatar = document.getElementById("profile-avatar");
const created = document.getElementById("profile-created");
const chatCount = document.getElementById("profile-chat-count");
let currentUser = null;

function refreshSummary(name, email) {
  displayName.textContent = name || "Student";
  displayEmail.textContent = email || "";
  avatar.textContent = (name?.[0] || email?.[0] || "S").toUpperCase();
}

async function loadProfile(user) {
  currentUser = user;
  nameInput.value = user.displayName || "";
  emailInput.value = user.email || "";
  refreshSummary(user.displayName, user.email);
  created.textContent = user.metadata?.creationTime
    ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(user.metadata.creationTime))
    : "Unknown";

  try {
    const profileSnapshot = await getDoc(doc(db, "users", user.uid));
    if (profileSnapshot.exists()) {
      const data = profileSnapshot.data();
      nameInput.value = data.name || user.displayName || "";
      levelInput.value = data.studyLevel || "Undergraduate";
      interestInput.value = data.primaryInterest || "Artificial Intelligence";
      refreshSummary(nameInput.value, user.email);
      if (data.createdAt) created.textContent = formatDate(data.createdAt).split(",")[0];
    }
  } catch (error) {
    console.error(error);
    showToast("Could not load all profile information.", "error");
  }

  try {
    const countSnapshot = await getCountFromServer(collection(db, "users", user.uid, "chats"));
    chatCount.textContent = String(countSnapshot.data().count);
  } catch (error) {
    console.warn("Could not count chats", error);
    chatCount.textContent = "—";
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!currentUser) return;
  const name = nameInput.value.trim();
  if (name.length < 2) return showToast("Enter a valid full name.", "error");
  const button = document.getElementById("profile-save");
  setButtonLoading(button, true, "Saving...");
  try {
    await updateProfile(currentUser, { displayName: name });
    await setDoc(doc(db, "users", currentUser.uid), {
      name,
      email: currentUser.email,
      studyLevel: levelInput.value,
      primaryInterest: interestInput.value,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    refreshSummary(name, currentUser.email);
    showToast("Profile saved.", "success");
  } catch (error) {
    console.error(error);
    showToast("Could not save your profile.", "error");
  } finally {
    setButtonLoading(button, false);
  }
});

if (auth && db) onAuthStateChanged(auth, (user) => user && loadProfile(user));
