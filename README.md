# AARAMBH - Indian Heritage Guide

A beautiful, interactive web application exploring India's rich cultural heritage, featuring an AI-powered guide, virtual darshans, and interactive 3D elements.

## Running Locally

To run this project on your local machine, follow these steps:

### 1. Install Dependencies
Make sure you have Node.js installed. Open your terminal in the project directory and run:
```bash
npm install
```

### 2. Set Up Environment Variables
Create a file named `.env` in the root of your project directory (the same level as `package.json`).
Add your Google Gemini API key to it:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```
*(You can get a Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey))*

### 3. Start the Development Server
Run the following command to start the full-stack server (Vite + Express backend):
```bash
npm run dev
```

The application will start, and you can view it in your browser at `http://localhost:3000`.

## Building for Production
To build the application for production:
```bash
npm run build
npm start
```
