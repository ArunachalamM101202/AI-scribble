Absolutely! Here’s a clean, professional, and fun README.md for ScribblAI, complete with setup instructions for both frontend and backend, tech stack, and project highlights.

⸻


# 🎮 ScribblAI

> A real-time multiplayer sketch & guess game powered by generative AI.

ScribblAI turns your chaotic doodles into photorealistic images using advanced AI — and your friends must guess what you were *trying* to draw. It's fast, fun, and full of AI magic!

---

## 🚀 Features

- 🎨 Multiplayer sketch canvas with real-time guessing
- 🤖 AI image generation using OpenAI + Stable Diffusion
- 🦙 LLaVA captioning + prompt remixing
- 🏆 Scoring and winner reveal at the end
- 🌐 Works over LAN or localhost

----

## 🛠 Tech Stack

| Layer        | Technology                     |
|--------------|--------------------------------|
| Frontend     | React, Canvas, CSS             |
| Backend      | Flask (Python)                 |
| AI Models    | OpenAI GPT Image Edit, LLaVA, Stable Diffusion |
| Hosting      | Localhost / LAN                |
| Multiplayer  | Polling + State Syncing        |

---

## 🧩 Setup Instructions

### 🔧 Prerequisites

- Node.js (v18+)
- Python 3.8+
- OpenAI API key (for GPT image)
- Optional: Cloudflare Stable Diffusion setup (for advanced image gen)

---

### ⚙️ 1. Backend Setup (Flask)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate   # or venv\Scripts\activate on Windows
pip install -r requirements.txt
python app.py
```

Runs on http://localhost:5050

⸻

🎨 2. Frontend Setup (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

Runs on http://localhost:5173

If you’re using a second device on the same network, replace localhost with your IP in all fetch URLs inside React (App.jsx, etc).

⸻

🧪 Demo Flow
	1.	Join the lobby with multiple players
	2.	Start game → sketch your word (e.g. Pizza Spaceship)
	3.	Your drawing is transformed into a realistic AI image
	4.	Everyone guesses what it is — live
	5.	Points are awarded → top scorer is crowned 👑

⸻

📦 Optional Enhancements
	•	🟣 Use LLaVA to auto-caption sketch
	•	🎨 Send prompt to Stable Diffusion via Cloudflare
	•	🧠 Swap between AI pipelines on config

⸻

✨ Final Notes
	•	Built during [Your Hackathon Name]
	•	Made for fun, creativity, and showcasing human-AI collaboration
	•	Contributions, forks, and chaos welcome 😄

⸻

📜 License

MIT — do anything, just don’t blame us when your drawing of a cat becomes a fire hydrant.
