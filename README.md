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

---

## 🧠 Architecture

![Architecture Diagram](./docs/architecture.png)  
> Two AI image flows: GPT Edit & LLaVA + SD — all roads lead to chaos.

---

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
