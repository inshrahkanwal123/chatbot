import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-auth.js";
import { auth, isFirebaseConfigured } from "./firebase-config.js";
import { showToast } from "./common.js";

if (!isFirebaseConfigured || !auth) {
  showToast("Firebase is not configured. Complete the Firebase steps in README.md.", "error", 9000);
  window.setTimeout(() => window.location.assign("/login?setup=required"), 1200);
} else {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      const next = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.assign(`/login?next=${next}`);
    }
  });
}
