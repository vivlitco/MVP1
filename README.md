# Vivlit – Your Virtual Jar of Notes 🏺

Vivlit is a digital space to create, customize, and share "virtual jars" filled with memories, messages, and media. It's designed to bring warmth and connection through a whimsical, personal interface.

## 📂 Project Structure

The project is organized into two main directories:

*   **`client/`**: The frontend application built with **React 19**, **Vite**, and **Tailwind CSS v4**. It handles the UI, user interactions, and AI generation features.
*   **`server/`**: The backend API built with **Node.js** and **Express**. It currently serves as the foundation for future API endpoints.

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18 or higher recommended)
*   npm (comes with Node.js)

### 1. Clone the Repository
```bash
git clone https://github.com/vivlitco/MVP1.git
cd MVP1
```

### 2. Setup Frontend (Client)
The client requires an API key for Google Gemini to generate cover notes.

1.  Navigate to the client folder:
    ```bash
    cd client
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  **Environment Setup**:
    Create a `.env` file in the `client` directory and add your Gemini API Key:
    ```env
    VITE_API_KEY="your_google_gemini_api_key_here"
    ```
4.  Run the development server:
    ```bash
    npm run dev
    ```
    The app should now be running at `http://localhost:5173`.

### 3. Setup Backend (Server)
1.  Open a new terminal and navigate to the server folder:
    ```bash
    cd server
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the server:
    ```bash
    node index.js
    ```
    The server will start on port **8000** (or the port defined in your environment variables).

## 🛠️ Tech Stack
*   **Frontend**: React, TypeScript, Vite, Tailwind CSS, Google GenAI SDK
*   **Backend**: Node.js, Express
