# 🧠 Real-Time Collaborative Whiteboard (Docker Compose App)

This project is a lightweight, self-hosted **real-time whiteboard** app—perfect for brainstorming, tutoring, planning, or just doodling with a friend.

Think **[webwhiteboard.com](https://webwhiteboard.com)** but on your own server.

---

## 🚀 Features

- ✍️ **Real-time collaboration** — Whiteboard updates instantly for all users.
- 🔧 **Simple setup** — Docker Compose handles all dependencies.
- 🖥️ **Self-hosted** — You control your data and your server.
- 🧑‍🤝‍🧑 **Multi-user ready** — Invite a friend and start drawing together.
- ⚡ **Fast and responsive** — Designed to get you from zero to whiteboard in under 5 minutes.

---

## 🛠️ Tech Stack

- **Backend**: Node.js + WebSockets
 - **Frontend**: SVG + JavaScript
- **Containerized**: Docker & Docker Compose
- **Host OS**: Linux (Debian-based)

---

## 📦 Installation (Debian/Linux)

1. **Clone the repo:**
   ```bash
   git clone https://github.com/your-username/whiteboard-app.git
   cd whiteboard-app
   ```

2. **Build and start the container:**
   ```bash
   docker compose up --build -d
   ```
   If you ever see errors about missing Node modules, rebuild the image with
   `docker compose build --no-cache` to ensure dependencies are installed
   correctly.
   The app listens on `127.0.0.1:3000` so it is only accessible from the
   host machine. Configure your own reverse proxy (e.g. Nginx) to expose it
   on your network if desired.

3. **Open your browser:**
   Navigate to `http://localhost:3000` on the host or through your reverse
   proxy.
4. **Invite a friend:**
   Share the URL. Anyone who visits can draw on the whiteboard in real time.

---

## 🛠 Development

- **Hot-reload:** The `/public` folder is mounted as a volume. Any changes to static files will refresh automatically.
- **Stopping:** Use `Ctrl+C` or `docker compose down` to stop the containers.

---

## 📜 License

This project is provided under the MIT License.
