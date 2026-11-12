import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-auth.js";
import { auth, isFirebaseConfigured } from "./firebase-config.js";

export function showToast(message, type = "info", duration = 4200) {
  const region = document.getElementById("toast-region");
  if (!region) return;
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  region.appendChild(toast);
  window.setTimeout(() => toast.remove(), duration);
}

export function setButtonLoading(button, loading, loadingText = "Working...") {
  if (!button) return;
  if (loading) {
    button.dataset.originalText = button.textContent;
    button.textContent = loadingText;
    button.disabled = true;
  } else {
    button.textContent = button.dataset.originalText || button.textContent;
    button.disabled = false;
  }
}

export function formatDate(value) {
  if (!value) return "Just now";
  let date;
  if (typeof value.toDate === "function") date = value.toDate();
  else if (value.seconds) date = new Date(value.seconds * 1000);
  else date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export function applyTheme(theme) {
  const selected = theme || "light";
  const resolved = selected === "system"
    ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    : selected;
  document.documentElement.dataset.theme = resolved;
  localStorage.setItem("study-theme", selected);
}

applyTheme(localStorage.getItem("study-theme") || "light");
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
  if (localStorage.getItem("study-theme") === "system") applyTheme("system");
});

const navToggle = document.getElementById("nav-toggle");
const siteNav = document.getElementById("site-nav");
navToggle?.addEventListener("click", () => {
  const open = siteNav?.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(Boolean(open)));
});

if (isFirebaseConfigured && auth) {
  onAuthStateChanged(auth, (user) => {
    document.querySelectorAll("[data-auth-link]").forEach((el) => el.classList.toggle("hidden", !user));
    document.querySelectorAll("[data-guest-link]").forEach((el) => el.classList.toggle("hidden", Boolean(user)));
  });
}

const logoutButton = document.getElementById("logout-button");
logoutButton?.addEventListener("click", async () => {
  if (!auth) return;
  try {
    await signOut(auth);
    window.location.assign("/login");
  } catch (error) {
    console.error(error);
    showToast("Could not log out. Try again.", "error");
  }
});
