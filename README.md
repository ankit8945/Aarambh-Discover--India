# 🇮🇳 AARAMBH — Discover India

### **Living Heritage • Cultural Discovery • Intelligent Exploration**

**AARAMBH** is a digital platform built to make India's living heritage, sacred journeys, monuments, cultural traditions, and geo-cultural stories more accessible, interactive, and engaging.

Rather than treating heritage as something limited to static information pages, AARAMBH brings together **heritage discovery, AI assistance, interactive maps, journey planning, digital experiences, and community contribution** in one platform.

> **Explore India. Understand its heritage. Experience its stories.**

---

## 🌐 Live Demo

### 👉 [AARAMBH — Discover India](https://aarambh-discover-india.onrender.com/)

The application is deployed and accessible through the link above.

---

## ✨ What Makes AARAMBH Different?

AARAMBH is designed around the idea of **living heritage** — connecting historical places with the culture, stories, traditions, people, and journeys that continue around them.

### 🏛️ Heritage Discovery

Explore India's heritage through:

* UNESCO & ASI heritage sites
* Sacred cities and cultural trails
* Historical monuments
* Living craft clusters
* Geo-cultural information

### 🗺️ Interactive Geo-Cultural Map

A map-based experience helps users discover heritage locations geographically and understand the cultural landscape around them.

### 🤖 AI-Powered Exploration

AARAMBH integrates **Google Gemini** to provide AI-assisted interactions and heritage-related experiences.

The Gemini API is accessed securely through the backend rather than exposing the API key directly in the frontend.

### 📷 Heritage Scanner

Users can access a camera-based heritage discovery experience designed to make identifying and learning about heritage more interactive.

### 🪔 3D Darshan / E-Visits

AARAMBH provides immersive digital experiences that allow users to explore heritage and sacred destinations beyond conventional information pages.

### 🧭 Journey Planning

Users can create and manage heritage journeys through:

* Multi-stop route planning
* Saved trips
* Saved itinerary destinations
* Digital Yatra Passport
* Pilgrim certificate experience

### 🏅 Digital Yatra Passport

Users can collect digital passport stamps as they explore heritage experiences across the platform.

### 🧑‍🎨 Living Culture & Community

AARAMBH also focuses on heritage that is still alive today:

* Living craft clusters
* Artisan contribution
* Cultural stories
* Community participation

### 🌐 Multilingual Experience

The application includes support for multiple Indian languages, allowing heritage experiences to reach a wider audience.

### 🛡️ Curator Moderation

A dedicated moderation workflow is included for reviewing and managing community-oriented heritage contributions.

---

# 🛠️ Tech Stack

| Layer            | Technology        |
| ---------------- | ----------------- |
| Frontend         | React 19          |
| Build Tool       | Vite              |
| Styling          | Tailwind CSS      |
| Backend          | Node.js + Express |
| AI               | Google Gemini API |
| Maps             | Leaflet           |
| Icons            | Lucide React      |
| Animations       | Motion            |
| WebSockets       | WebSocket (`ws`)  |
| Image Processing | Sharp             |
| Deployment       | Render            |
| Version Control  | Git + GitHub      |

---

# 🏗️ Architecture

```text
                    ┌──────────────────────┐
                    │      User / Judge    │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   React + Vite UI   │
                    │   Tailwind CSS      │
                    └──────────┬───────────┘
                               │
                    API / WebSocket Requests
                               │
                               ▼
                    ┌──────────────────────┐
                    │   Node.js + Express  │
                    │      server.ts       │
                    └──────────┬───────────┘
                               │
                 ┌─────────────┴─────────────┐
                 │                           │
                 ▼                           ▼
        ┌─────────────────┐        ┌─────────────────┐
        │  Google Gemini  │        │   Application   │
        │      API        │        │    Services     │
        └─────────────────┘        └─────────────────┘
```

The frontend and backend are deployed together as a single web service.

---

# 🚀 Getting Started

## 1. Clone the repository

```ba
```
