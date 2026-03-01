
# 🌸 Memona – MemoryLane Personal

## 📌 Project Title

**Memona – MemoryLane Personal**
A premium digital memory preservation platform to capture, organize, and relive life’s special moments.

---

## 📝 Project Description

Memona is a full-stack memory storytelling application that allows users to:

* Capture memories with photos, videos, and voice reflections
* Organize them into albums
* Mark important life milestones
* Share memories publicly or privately
* Reflect on anniversaries with emotional storytelling features

The platform focuses on premium UI/UX, emotional design, and structured multimedia management.

---

## ✨ Features

### 🔐 Authentication

* Secure login & registration (Supabase Auth)
* Role-based access (User / Admin)

### 📸 Memory Management

* Create, edit, delete memories
* Upload images & videos (Cloudinary)
* Add location to memories
* Public / Private memory toggle

### 🎙 Voice Reflections

* Record voice notes using MediaRecorder API
* Upload audio to Cloudinary
* Attach voice to memories
* Elegant playback UI

### 🏆 Milestones

* Mark memories as milestones
* Anniversary tracking
* “Years Ago” calculation
* Reminder system
* Reflection modal

### 👥 Shared Memories

* Public memory sharing
* Private memory sharing (user-to-user)
* Shared-with-me page
* Access controlled via RLS

### 📁 Albums

* Create memory albums
* Organize memories into collections

### 🎨 UI/UX

* Premium Light Theme
* Gold accent design
* Responsive layout
* Clean storytelling-focused interface

---

## 🛠 Tech Stack Used

### Frontend

* React.js
* React Router
* Tailwind CSS
* Leaflet (for map – optional feature)
* Axios / Fetch API

### Backend (API Server)

* Node.js
* Express.js
* Supabase (PostgreSQL + Auth + RLS)
* Cloudinary (Media Storage)
* Multer (File handling)

### Database

* PostgreSQL (via Supabase)
* Row Level Security (RLS)
* Structured relational schema

---

## ⚙️ Installation Steps

### 1️⃣ Clone Repository

```bash
git clone https://github.com/artiverma-00/memona_frontend
cd memona_frontend
```

---

### 2️⃣ Install Dependencies

```bash
npm install
```

---

### 3️⃣ Create Environment File

Create `.env` file in root:

```env
VITE_API_BASE_URL=YOUR_BACKEND_API_URL
```

---

### 4️⃣ Run Development Server

```bash
npm run dev
```

App will run on:

```
http://localhost:5173
```

---

## 🚀 Deployment Link

🔗 Live App:
https://memona-frontend.vercel.app/

---

## 🔗 Backend API Link

🔗 Backend Base URL:
https://memona-backend.onrender.com

---


### Admin Account (demo not real data)
admin key : Memona_Admin

---

## 📸 Screenshots

### 🔹 Dashboard

<img width="1920" height="2097" alt="image" src="https://github.com/user-attachments/assets/9fff6ada-1255-483c-b9f3-2e996dbbcfa1" />


---

### 🔹 Create Memory Page

<img width="1920" height="962" alt="image" src="https://github.com/user-attachments/assets/8a5574e0-159b-423b-be2a-574a2b4b05fd" />


---

### 🔹 Milestones Page

<img width="1920" height="952" alt="image" src="https://github.com/user-attachments/assets/4b6a196a-b24f-4cfd-b49c-675a1fe2948e" />


---

### 🔹 Voice Reflection UI

<img width="1920" height="1040" alt="image" src="https://github.com/user-attachments/assets/5a45f3e7-ae33-4554-ace7-87c929c979a3" />


---

## 📂 Folder Structure (Frontend)

```
src/
 ├── components/
 ├── pages/
 ├── services/
 ├── hooks/
 ├── utils/
 ├── assets/
 ├── App.jsx
 └── main.jsx
```

---

## 🧠 Architecture Overview

* Frontend communicates with Express backend
* Backend communicates with Supabase
* Cloudinary handles all media storage
* RLS ensures secure user-based data access
* Database stores metadata only

---

## 📌 Future Improvements

* AI-generated memory recap video
* Voice-to-text transcription
* Collaborative memory albums
* Push notifications
* Dark mode support
* Map visualization enhancement
* shared memories enhancement


---

## 👩‍💻 Author

Arti Verma
Frontend Developer & UI/UX Designer
Full-Stack Developer in Progress

