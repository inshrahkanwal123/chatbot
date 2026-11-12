import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-auth.js";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";
import { auth, db } from "./firebase-config.js";
import { setButtonLoading, showToast } from "./common.js";

const messages = document.getElementById("messages");
const welcome = document.getElementById("welcome-message");
const form = document.getElementById("chat-form");
const input = document.getElementById("message-input");
const sendButton = document.getElementById("send-button");
const count = document.getElementById("character-count");
const modelLabel = document.getElementById("model-label");
const videoDialog = document.getElementById("video-dialog");
const videoForm = document.getElementById("video-form");
const videoProgress = document.getElementById("video-progress");
const analyseVideoButton = document.getElementById("analyse-video-button");
let currentUser = null;
let preferences = { responseStyle: "balanced", simpleLanguage: true, language: "English" };
let conversationHistory = [];
let busy = false;

function nowLabel() {
  return new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }).format(new Date());
}

function scrollToBottom() {
  messages.scrollTop = messages.scrollHeight;
}

function addMessage(role, text, options = {}) {
  welcome?.classList.add("hidden");
  const row = document.createElement("div");
  row.className = `message-row ${role}`;

  const avatar = document.createElement("div");
  avatar.className = "message-avatar";
  avatar.textContent = role === "user" ? (currentUser?.displayName?.[0] || "U").toUpperCase() : "✦";

  const bubble = document.createElement("div");
  bubble.className = "message-bubble";

  const content = document.createElement("div");
content.className = "message-content";

if (role === "assistant" && window.marked && window.DOMPurify) {
  const html = window.marked.parse(text, {
    breaks: true,
    gfm: true
  });

  content.innerHTML = window.DOMPurify.sanitize(html);
} else {
  content.textContent = text;
}

bubble.appendChild(content);

  const meta = document.createElement("div");
  meta.className = "message-meta";
  meta.textContent = options.meta || nowLabel();
  bubble.appendChild(meta);

  row.append(avatar, bubble);
  messages.appendChild(row);
  scrollToBottom();
  return { row, content, bubble };
}

function addTypingIndicator() {
  welcome?.classList.add("hidden");
  const row = document.createElement("div");
  row.className = "message-row assistant";
  row.id = "typing-indicator";
  const avatar = document.createElement("div");
  avatar.className = "message-avatar";
  avatar.textContent = "✦";
  const bubble = document.createElement("div");
  bubble.className = "message-bubble";
  const typing = document.createElement("div");
  typing.className = "typing";
  typing.innerHTML = "<span></span><span></span><span></span>";
  bubble.appendChild(typing);
  row.append(avatar, bubble);
  messages.appendChild(row);
  scrollToBottom();
  return row;
}

async function loadPreferences(uid) {
  try {
    const snapshot = await getDoc(doc(db, "users", uid, "settings", "preferences"));
    if (snapshot.exists()) preferences = { ...preferences, ...snapshot.data() };
  } catch (error) {
    console.warn("Could not load preferences", error);
  }
}

async function parseResponse(response) {
  const type = response.headers.get("content-type") || "";
  if (type.includes("application/json")) return response.json();
  return { error: `Server returned ${response.status}. Check the Flask terminal or Render logs.` };
}

async function sendQuestion(question) {
  if (!currentUser || busy) return;
  const clean = question.trim();
  if (!clean) return;

  busy = true;
  sendButton.disabled = true;
  addMessage("user", clean);
  conversationHistory.push({ role: "user", text: clean });
  const typing = addTypingIndicator();
  modelLabel.textContent = "Thinking...";

  try {
    const token = await currentUser.getIdToken();
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        message: clean,
        history: conversationHistory.slice(-10, -1),
        preferences,
      }),
    });
    const data = await parseResponse(response);
    if (!response.ok) throw new Error(data.error || "The request failed.");

    typing.remove();
    addMessage("assistant", data.answer, { meta: `${data.model || "Gemini"} • ${nowLabel()}` });
    conversationHistory.push({ role: "assistant", text: data.answer });
    modelLabel.textContent = data.model || "Ready";

    await addDoc(collection(db, "users", currentUser.uid, "chats"), {
      type: "chat",
      title: clean.length > 90 ? `${clean.slice(0, 87)}...` : clean,
      question: clean,
      answer: data.answer,
      model: data.model || "Gemini",
      createdAt: serverTimestamp(),
      createdAtClient: Date.now(),
    });
  } catch (error) {
    console.error(error);
    typing.remove();
    addMessage("assistant", `Sorry, I could not complete that request.\n\n${error.message}`);
    modelLabel.textContent = "Request failed";
    showToast(error.message, "error");
  } finally {
    busy = false;
    sendButton.disabled = false;
    input.focus();
  }
}

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const question = input.value;
  input.value = "";
  input.style.height = "auto";
  count.textContent = "0 / 6000";
  await sendQuestion(question);
});

input?.addEventListener("input", () => {
  count.textContent = `${input.value.length} / 6000`;
  input.style.height = "auto";
  input.style.height = `${Math.min(input.scrollHeight, 180)}px`;
});

input?.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    form.requestSubmit();
  }
});

document.querySelectorAll("[data-prompt]").forEach((button) => {
  button.addEventListener("click", () => {
    input.value = button.dataset.prompt || "";
    input.dispatchEvent(new Event("input"));
    input.focus();
  });
});

document.getElementById("new-chat-button")?.addEventListener("click", () => {
  conversationHistory = [];
  messages.querySelectorAll(".message-row").forEach((element) => element.remove());
  welcome?.classList.remove("hidden");
  modelLabel.textContent = "Ready";
  input.value = "";
  input.focus();
});

// Voice input with the browser Web Speech API.
const voiceButton = document.getElementById("voice-button");
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!SpeechRecognition) {
  voiceButton.disabled = true;
  voiceButton.title = "Voice recognition is not supported in this browser. Try Chrome or Edge.";
} else {
  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = true;
  recognition.continuous = false;
  let listening = false;

  voiceButton.addEventListener("click", () => {
    if (listening) recognition.stop();
    else recognition.start();
  });
  recognition.addEventListener("start", () => {
    listening = true;
    voiceButton.textContent = "⏹ Stop";
    showToast("Listening... speak your study question.", "success", 2200);
  });
  recognition.addEventListener("result", (event) => {
    input.value = Array.from(event.results).map((result) => result[0].transcript).join("");
    input.dispatchEvent(new Event("input"));
  });
  recognition.addEventListener("end", () => {
    listening = false;
    voiceButton.innerHTML = "🎙️ <span>Voice</span>";
    input.focus();
  });
  recognition.addEventListener("error", (event) => {
    showToast(`Voice input error: ${event.error}`, "error");
  });
}

function openVideoDialog() {
  if (typeof videoDialog.showModal === "function") videoDialog.showModal();
  else videoDialog.setAttribute("open", "");
}
document.getElementById("open-video-button")?.addEventListener("click", openVideoDialog);
document.getElementById("video-shortcut")?.addEventListener("click", openVideoDialog);
document.getElementById("close-video-button")?.addEventListener("click", () => videoDialog.close());

videoForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!currentUser || busy) return;
  const fileInput = document.getElementById("video-file");
  const promptInput = document.getElementById("video-prompt");
  const file = fileInput.files?.[0];
  if (!file) return showToast("Choose a video file first.", "error");
  if (file.size > 100 * 1024 * 1024) return showToast("Use a video smaller than 100 MB.", "error");

  busy = true;
  videoProgress.classList.remove("hidden");
  setButtonLoading(analyseVideoButton, true, "Analysing...");
  try {
    const token = await currentUser.getIdToken();
    const body = new FormData();
    body.append("video", file);
    body.append("prompt", promptInput.value.trim());
    const response = await fetch("/api/video", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body,
    });
    const data = await parseResponse(response);
    if (!response.ok) throw new Error(data.error || "Video analysis failed.");

    videoDialog.close();
    addMessage("user", `Analyse educational video: ${data.fileName}`);
    addMessage("assistant", data.answer, { meta: `${data.model || "Gemini"} • Video analysis` });
    conversationHistory.push({ role: "user", text: `Video: ${data.fileName}` });
    conversationHistory.push({ role: "assistant", text: data.answer });

    await addDoc(collection(db, "users", currentUser.uid, "chats"), {
      type: "video",
      title: `Video: ${data.fileName}`,
      question: promptInput.value.trim(),
      answer: data.answer,
      fileName: data.fileName,
      fileSize: data.fileSize,
      model: data.model || "Gemini",
      createdAt: serverTimestamp(),
      createdAtClient: Date.now(),
    });
    showToast("Video analysis completed and saved.", "success");
    fileInput.value = "";
  } catch (error) {
    console.error(error);
    showToast(error.message, "error", 7000);
  } finally {
    busy = false;
    videoProgress.classList.add("hidden");
    setButtonLoading(analyseVideoButton, false);
  }
});

async function loadSavedChat(uid) {
  const id = new URLSearchParams(window.location.search).get("chat");
  if (!id) return;
  try {
    const snapshot = await getDoc(doc(db, "users", uid, "chats", id));
    if (!snapshot.exists()) return showToast("Saved conversation was not found.", "error");
    const data = snapshot.data();
    const question = data.type === "video" ? `Video: ${data.fileName || data.title}` : data.question;
    addMessage("user", question || data.title || "Saved question");
    addMessage("assistant", data.answer || "No saved answer.", { meta: "Saved conversation" });
    conversationHistory = [
      { role: "user", text: question || data.title || "" },
      { role: "assistant", text: data.answer || "" },
    ];
  } catch (error) {
    console.error(error);
    showToast("Could not open the saved conversation.", "error");
  }
}

if (auth && db) {
  onAuthStateChanged(auth, async (user) => {
    if (!user) return;
    currentUser = user;
    await loadPreferences(user.uid);
    await loadSavedChat(user.uid);
    input.focus();
  });
}
