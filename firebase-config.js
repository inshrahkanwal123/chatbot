import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

let publicConfig = { configured: false, config: {} };

try {
  const response = await fetch("/api/config", { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`Configuration request failed (${response.status})`);
  publicConfig = await response.json();
} catch (error) {
  console.error("Could not load Firebase configuration:", error);
}

let firebaseApp = null;
let auth = null;
let db = null;

if (publicConfig.configured) {
  firebaseApp = initializeApp(publicConfig.config);
  auth = getAuth(firebaseApp);
  db = getFirestore(firebaseApp);
}

export const isFirebaseConfigured = Boolean(publicConfig.configured);
export const firebaseConfig = publicConfig.config;
export { firebaseApp, auth, db };
