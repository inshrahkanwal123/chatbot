# StudyMate AI — Complete Beginner Website

A complete **AI-Based Study Chatbot** built according to the uploaded project specification. It includes:

- Home page
- Email/password sign-up and login
- AI study questions and responses
- Browser voice input
- Educational-video upload and analysis
- Searchable chat history
- User profile
- User settings
- Logout
- Flask backend
- Gemini multimodal AI
- Firebase Authentication and Firestore
- GitHub-ready source control
- Render free-tier deployment configuration

The chatbot focuses on Artificial Intelligence, Python, HTML, CSS, JavaScript, Web Development and Computer Science basics.

---

# 1. What you must install

Install these programs in this order:

1. **Google Chrome or Microsoft Edge**
2. **Python 3.13 (64-bit)**
3. **Visual Studio Code**
4. **Git**

During Python installation, select **Add Python to PATH**.

Check the installations in Command Prompt:

```bat
python --version
pip --version
git --version
code --version
```

If `python` does not work, try:

```bat
py --version
```

Recommended VS Code extensions:

- Python
- Pylance
- HTML CSS Support
- JavaScript and TypeScript Nightly, optional
- GitHub Pull Requests and Issues, optional

---

# 2. Create the required free accounts

Create accounts for:

1. Google AI Studio — Gemini API key
2. Firebase Console — authentication and database
3. GitHub — source-code repository
4. Render — free web hosting

Use one Google account for Google AI Studio and Firebase if possible.

---

# 3. Open the project in VS Code

Extract the downloaded ZIP file. Open Command Prompt inside the extracted folder and run:

```bat
code .
```

Alternatively, open VS Code, select **File > Open Folder**, then select `ai-study-chatbot`.

The folder should contain:

```text
ai-study-chatbot/
├── app.py
├── requirements.txt
├── .env.example
├── .gitignore
├── .python-version
├── render.yaml
├── firestore.rules
├── README.md
├── templates/
├── static/
└── tests/
```

---

# 4. Create and activate the Python environment

Open **Terminal > New Terminal** in VS Code.

## Windows Command Prompt

```bat
py -m venv .venv
.venv\Scripts\activate.bat
```

## Windows PowerShell

```powershell
py -m venv .venv
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1
```

When activation succeeds, the terminal line begins with `(.venv)`.

Upgrade pip and install the project packages:

```bat
python -m pip install --upgrade pip
pip install -r requirements.txt
```

Expected packages include Flask, Google GenAI SDK, Firebase Admin, python-dotenv, Gunicorn and pytest.

---

# 5. Create the `.env` configuration file

In Command Prompt:

```bat
copy .env.example .env
```

In PowerShell:

```powershell
Copy-Item .env.example .env
```

Open `.env` in VS Code. You will replace its placeholder values after completing the Gemini and Firebase steps below.

Generate a secure Flask secret:

```bat
python -c "import secrets; print(secrets.token_hex(32))"
```

Copy the output into:

```env
FLASK_SECRET_KEY=paste-the-generated-value-here
```

Never upload `.env` to GitHub.

---

# 6. Create the free Gemini API key

1. Open Google AI Studio.
2. Sign in.
3. Select **Get API key**.
4. Create an API key in a new or existing Google project.
5. Copy the key.
6. Paste it into `.env`:

```env
GEMINI_API_KEY=your-real-key
GEMINI_MODEL=gemini-3.6-flash
```

Important:

- The key stays only in Flask and Render environment variables.
- Never put it in HTML or JavaScript.
- Never commit it to GitHub.
- Free-tier quotas apply. When quota is exhausted, wait for the quota to reset.

---

# 7. Create the Firebase project

1. Open Firebase Console.
2. Select **Create a project**.
3. Enter a project name such as `studymate-ai`.
4. Google Analytics is optional; you may disable it for this university project.
5. Select **Create project**.

## Register the web application

1. On the Firebase project overview, select the **Web `</>` icon**.
2. Enter the nickname `StudyMate Web`.
3. Do not select Firebase Hosting because this project uses Render.
4. Select **Register app**.
5. Firebase displays a configuration similar to:

```javascript
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

Copy the values into `.env`:

```env
FIREBASE_API_KEY=copy-apiKey
FIREBASE_AUTH_DOMAIN=copy-authDomain
FIREBASE_PROJECT_ID=copy-projectId
FIREBASE_STORAGE_BUCKET=copy-storageBucket
FIREBASE_MESSAGING_SENDER_ID=copy-messagingSenderId
FIREBASE_APP_ID=copy-appId
```

These Firebase web values identify your application. The Gemini key and Firebase service-account private key are the sensitive secrets.

---

# 8. Enable Firebase email/password login

1. In Firebase Console, open **Build > Authentication**.
2. Select **Get started**.
3. Open the **Sign-in method** tab.
4. Select **Email/Password**.
5. Enable **Email/Password**.
6. Select **Save**.

The website can now create accounts and log users in.

---

# 9. Create the Firestore database

1. Open **Build > Firestore Database**.
2. Select **Create database**.
3. Choose **Production mode**.
4. Select a region near your users.
5. Complete database creation.

## Add the security rules

1. Open the Firestore **Rules** tab.
2. Open the local file `firestore.rules`.
3. Copy the entire file.
4. Replace the Firebase rules with it.
5. Select **Publish**.

These rules allow a logged-in user to access only documents under their own user ID:

```text
users/{their Firebase UID}/...
```

Do not leave Firestore in unrestricted test mode.

---

# 10. Create the Firebase Admin service account

The browser sends the Firebase ID token to Flask. Flask verifies it before calling Gemini. This prevents anonymous visitors from using your private AI API.

1. In Firebase Console, select the gear icon.
2. Open **Project settings**.
3. Open the **Service accounts** tab.
4. Select **Generate new private key**.
5. Confirm the download.
6. Rename the downloaded file to:

```text
firebase-service-account.json
```

7. Place it in the root project folder beside `app.py`.
8. Confirm `.env` contains:

```env
FIREBASE_SERVICE_ACCOUNT_FILE=firebase-service-account.json
```

The file is already excluded by `.gitignore`. Never upload, email or publicly share it.

---

# 11. Run the website locally

Make sure the virtual environment is active, then run:

```bat
python app.py
```

Expected terminal output includes an address similar to:

```text
Running on http://127.0.0.1:5000
```

Open this in Chrome or Edge:

```text
http://127.0.0.1:5000
```

Do not open the HTML files directly and do not use Live Server. The pages must run through Flask.

## Check server configuration

Open:

```text
http://127.0.0.1:5000/health
```

A correct result should show:

```json
{
  "status": "ok",
  "geminiConfigured": true,
  "firebaseAdminConfigured": true
}
```

If either value is false, recheck `.env`, the Gemini key or the service-account filename, then stop and restart Flask.

Stop Flask with:

```text
Ctrl + C
```

---

# 12. Test every feature locally

Use this order:

## A. Public pages

- Open the home page.
- Resize the browser to test mobile layout.
- Open login and sign-up pages.

## B. Authentication

- Create a new account.
- Confirm the user appears in Firebase Authentication.
- Log out.
- Log back in.
- Test the password-reset button.

## C. AI chatbot

Ask:

```text
Explain supervised learning in simple words and give one example.
```

Confirm:

- The user message appears.
- A loading animation appears.
- Gemini returns an answer.
- A document appears in Firestore under:

```text
users > USER_UID > chats
```

## D. Voice input

- Use Chrome or Edge.
- Select the microphone button.
- Allow microphone permission.
- Speak a question.
- Confirm speech appears in the text box.

Voice recognition depends on browser support and internet access. It may not work in every browser.

## E. Video analysis

Use a short MP4 video, preferably under 50 MB during testing.

- Select **Video**.
- Choose the file.
- Enter an analysis instruction.
- Keep the page open while processing.
- Confirm the summary and revision questions appear.
- Confirm the analysis is saved in chat history.

The website limit is 100 MB by default. Change `MAX_VIDEO_MB` only when your hosting setup can handle larger requests.

## F. History

- Open History.
- Search for a previous question.
- Filter between questions and videos.
- Reopen a saved conversation.
- Delete one item.

## G. Profile and settings

- Update the full name and study level.
- Change the theme.
- Change response style.
- Save settings.
- Refresh the page and confirm settings remain.

---

# 13. Run the automated smoke tests

With the virtual environment active:

```bat
pytest -q
```

Expected result:

```text
3 passed
```

These tests check the health endpoint, page rendering and backend authentication protection. They do not call Gemini, so they do not consume API quota.

---

# 14. Upload the project to GitHub

Create an empty GitHub repository named `ai-study-chatbot`. Do not add a README from GitHub because the project already contains one.

Run in the project folder:

```bat
git init
git add .
git status
git commit -m "Create complete AI study chatbot"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/ai-study-chatbot.git
git push -u origin main
```

Before pushing, `git status` must **not** show:

- `.env`
- `firebase-service-account.json`

If either secret appears, stop and correct `.gitignore` before committing.

---

# 15. Deploy free on Render

## Method A: Use `render.yaml`

1. Sign in to Render with GitHub.
2. Select **New > Blueprint**.
3. Connect the GitHub repository.
4. Render detects `render.yaml`.
5. Fill in every environment value marked as required.

## Method B: Create the web service manually

1. Select **New > Web Service**.
2. Connect the GitHub repository.
3. Use:

```text
Language: Python 3
Build command: pip install -r requirements.txt
Start command: gunicorn --workers 1 --threads 4 --timeout 300 app:app
Health check path: /health
Instance type: Free
```

## Add Render environment variables

In the Render service, open **Environment** and add:

```text
GEMINI_API_KEY
GEMINI_MODEL
FIREBASE_API_KEY
FIREBASE_AUTH_DOMAIN
FIREBASE_PROJECT_ID
FIREBASE_STORAGE_BUCKET
FIREBASE_MESSAGING_SENDER_ID
FIREBASE_APP_ID
FIREBASE_SERVICE_ACCOUNT_FILE
MAX_VIDEO_MB
VIDEO_PROCESSING_TIMEOUT_SECONDS
```

Recommended values:

```text
GEMINI_MODEL=gemini-3.6-flash
FIREBASE_SERVICE_ACCOUNT_FILE=/etc/secrets/firebase-service-account.json
MAX_VIDEO_MB=100
VIDEO_PROCESSING_TIMEOUT_SECONDS=240
```

Render can generate `FLASK_SECRET_KEY` automatically through `render.yaml`. For manual deployment, add a random secret value yourself.

## Add the Firebase service account as a Render secret file

1. In Render, open **Environment**.
2. Find **Secret Files**.
3. Select **Add Secret File**.
4. Filename:

```text
firebase-service-account.json
```

5. Open your local service-account JSON in a text editor.
6. Copy its complete contents into the Render secret-file contents field.
7. Save and redeploy.

Render exposes it at:

```text
/etc/secrets/firebase-service-account.json
```

## Add the Render domain to Firebase Authentication

After deployment, Render gives an address similar to:

```text
https://ai-study-chatbot.onrender.com
```

Then:

1. Open Firebase Console.
2. Open **Authentication > Settings**.
3. Find **Authorized domains**.
4. Add only the domain, for example:

```text
ai-study-chatbot.onrender.com
```

Do not include `https://` and do not include a final `/`.

Without this step, deployed Firebase login may fail with an unauthorized-domain error.

## Confirm production health

Open:

```text
https://YOUR-RENDER-DOMAIN.onrender.com/health
```

Both configuration values should be `true`.

A free Render service can sleep when inactive. The first request after inactivity can therefore be slow. This is normal for a free demonstration deployment.

---

# 16. Important security rules

1. Never put `GEMINI_API_KEY` in JavaScript.
2. Never upload `.env`.
3. Never upload `firebase-service-account.json`.
4. Never set Firestore rules to `allow read, write: if true`.
5. Use HTTPS in production. Render supplies HTTPS automatically.
6. Keep the `/api/chat` and `/api/video` Firebase token checks enabled.
7. Rotate an API key immediately if it is exposed.
8. Do not upload confidential videos to a free AI service.

---

# 17. Common errors and fixes

## `python is not recognized`

Reinstall Python and select **Add Python to PATH**, or use `py` instead of `python`.

## PowerShell refuses to activate `.venv`

Run:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1
```

## `ModuleNotFoundError`

Activate `.venv`, then run:

```bat
pip install -r requirements.txt
```

## Login page says Firebase is not configured

- Confirm all six Firebase web values exist in `.env`.
- Remove quotation marks unless the value itself requires them.
- Restart Flask after editing `.env`.

## `/health` says `firebaseAdminConfigured: false`

- Confirm `firebase-service-account.json` is beside `app.py`.
- Confirm the filename matches `.env` exactly.
- Confirm the JSON file was downloaded from the same Firebase project.
- Restart Flask.

## Firebase `auth/unauthorized-domain`

Add the exact Render domain to Firebase Authentication authorized domains.

## Firestore `Missing or insufficient permissions`

Publish the supplied `firestore.rules` and confirm the user is signed in.

## Gemini key error

Create a new key in Google AI Studio and replace `GEMINI_API_KEY`. Restart Flask or redeploy Render.

## Gemini quota error or HTTP 429

The free quota is temporarily exhausted. Wait for reset or reduce testing frequency.

## Video request times out

- Use a shorter video.
- Compress the video.
- Keep it below 50 MB for the first demonstration.
- Increase Gunicorn timeout only when needed.
- Remember that free hosting is not designed for large production video workloads.

## Microphone button disabled

Use a current version of Chrome or Edge, grant microphone permission and use `localhost` or HTTPS.

## Render deployment fails

Open **Render > Deploys > Logs** and check the first red error. Confirm:

```text
Build command: pip install -r requirements.txt
Start command: gunicorn --workers 1 --threads 4 --timeout 300 app:app
```

---

# 18. Demonstration sequence for your teacher

1. Open the home page and explain the project purpose.
2. Create a student account.
3. Ask an AI or Python question.
4. Use the microphone for a second question.
5. Upload a short educational video.
6. Show the generated summary and quiz.
7. Open history and search the previous question.
8. Update the profile.
9. Change to dark mode in settings.
10. Log out and explain that Firebase keeps user data separate.

---

# 19. Project workflow

```text
Student
  ↓
HTML/CSS/JavaScript website
  ↓
Firebase Authentication
  ↓
Firebase ID token sent through HTTPS
  ↓
Python Flask backend verifies token
  ↓
Gemini API processes question or video
  ↓
Answer returns to website
  ↓
Firestore saves user-specific history
```

This implementation follows the required project workflow while keeping the Gemini API key on the secure server side.
