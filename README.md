# Nova Helpdesk — AI College Information System

Nova Helpdesk is a full-stack, responsive web application designed for colleges and universities. It features:
- **Admin Console**: Allows administrators to update college profiles, timetables, fee schedules, exam schedules, services, and campus map locations.
- **Student Portal**: Provides students with quick access links, a clickable campus map pointing out departments and office routes, and an interactive **Helpdesk AI** chatbot.
- **Node.js/Express Backend Proxy**: Bypasses browser CORS restrictions by handling LLM requests securely on the server.
- **Persistent Storage**: Saves data inputs from the Admin Console locally to a lightweight JSON database file (`data/college_data.json`).

---

## Getting Started

### 1. Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (version 18 or above recommended).

### 2. Installation
Clone or copy the files into a directory, open your terminal/command prompt in the directory, and run:
```bash
npm install
```

### 3. Configuration (AI Features)
Create a `.env` file in the root directory (a template is available in `.env.example`).
```env
PORT=3000

# Specify either a Gemini API Key or an Anthropic API Key to activate AI features
GEMINI_API_KEY=your_gemini_api_key_here
# ANTHROPIC_API_KEY=your_anthropic_api_key_here
```
> **Note**: If no API key is specified, the application will automatically fall back to a local **Rule-based Keyword Search Matcher** in the backend. The app is fully functional out of the box even without API keys!

### 4. Running the Application
To launch the server locally:
```bash
npm start
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## Project Structure
- `server.js` - Express backend server containing routes for handling JSON data persistence and AI chatbot proxy.
- `public/` - Static assets including `index.html` (the client portal and dashboard code).
- `data/` - Lightweight database directory containing `college_data.json`.
- `.env` - Environment configurations (git-ignored for security).
- `.gitignore` - Prevents temporary files, node modules, and credentials from leaking to GitHub.

---

## How to Upload to GitHub

1. Open your terminal in the root folder of this project (`nova-helpdesk`).
2. Initialize git:
   ```bash
   git init
   ```
3. Stage all files (this will automatically ignore files specified in `.gitignore`):
   ```bash
   git add .
   ```
4. Commit the files:
   ```bash
   git commit -m "Initial commit of full-stack Nova Helpdesk"
   ```
5. Create a new, blank repository on [GitHub](https://github.com/new). Do not check any boxes for README, .gitignore, or license (we already have them!).
6. Copy the git command sequences shown under "or push an existing repository from the command line":
   ```bash
   git remote add origin https://github.com/yourusername/your-repo-name.git
   git branch -M main
   git push -u origin main
   ```
