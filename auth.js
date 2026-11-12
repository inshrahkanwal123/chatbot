import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-auth.js";
import { doc, serverTimestamp, setDoc } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";
import { auth, db, isFirebaseConfigured } from "./firebase-config.js";
import { setButtonLoading, showToast } from "./common.js";

const warning = document.getElementById("firebase-setup-warning");
if (!isFirebaseConfigured || !auth || !db) {
  if (warning) {
    warning.textContent = "Firebase is not configured yet. Add the Firebase web values to your .env file, restart Flask, then refresh this page.";
    warning.classList.remove("hidden");
  }
  document.querySelectorAll("form button[type='submit']").forEach((button) => button.disabled = true);
} else {
  onAuthStateChanged(auth, (user) => {
    if (user) window.location.replace("/chatbot");
  });
}

function friendlyAuthError(error) {
  const code = error?.code || "";
  const messages = {
    "auth/email-already-in-use": "This email is already registered. Log in instead.",
    "auth/invalid-email": "Enter a valid email address.",
    "auth/weak-password": "Use a stronger password with at least 6 characters.",
    "auth/invalid-credential": "Incorrect email or password.",
    "auth/user-disabled": "This account has been disabled.",
    "auth/too-many-requests": "Too many attempts. Wait a little and try again.",
    "auth/network-request-failed": "Network error. Check your internet connection.",
  };
  return messages[code] || "Authentication failed. Check your details and try again.";
}

const loginForm = document.getElementById("login-form");
loginForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!auth) return;
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;
  const button = document.getElementById("login-submit");
  setButtonLoading(button, true, "Logging in...");
  try {
    await signInWithEmailAndPassword(auth, email, password);
    const next = new URLSearchParams(window.location.search).get("next") || "/chatbot";
    window.location.assign(next.startsWith("/") ? next : "/chatbot");
  } catch (error) {
    console.error(error);
    showToast(friendlyAuthError(error), "error");
    setButtonLoading(button, false);
  }
});

const signupForm = document.getElementById("signup-form");
signupForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!auth || !db) return;
  const name = document.getElementById("signup-name").value.trim();
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value;
  const confirm = document.getElementById("signup-confirm").value;
  const button = document.getElementById("signup-submit");

  if (name.length < 2) return showToast("Enter your full name.", "error");
  if (password !== confirm) return showToast("Passwords do not match.", "error");

  setButtonLoading(button, true, "Creating account...");
  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credential.user, { displayName: name });
    await setDoc(doc(db, "users", credential.user.uid), {
      name,
      email,
      studyLevel: "Undergraduate",
      primaryInterest: "Artificial Intelligence",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true });
    await setDoc(doc(db, "users", credential.user.uid, "settings", "preferences"), {
      theme: "light",
      responseStyle: "balanced",
      simpleLanguage: true,
      language: "English",
      updatedAt: serverTimestamp(),
    }, { merge: true });
    window.location.assign("/chatbot");
  } catch (error) {
    console.error(error);
    showToast(friendlyAuthError(error), "error");
    setButtonLoading(button, false);
  }
});

const forgotButton = document.getElementById("forgot-password");
forgotButton?.addEventListener("click", async () => {
  if (!auth) return;
  const email = document.getElementById("login-email").value.trim();
  if (!email) return showToast("Enter your email address first.", "error");
  try {
    await sendPasswordResetEmail(auth, email);
    showToast("Password-reset email sent. Check your inbox.", "success");
  } catch (error) {
    console.error(error);
    showToast(friendlyAuthError(error), "error");
  }
});
