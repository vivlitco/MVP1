# Vivlit - Project Overview

## 1. Project Description
**Vivlit** is a "Virtual Jar of Notes" application designed to let users create, customize, and share digital jars filled with memories, messages, and media. It emphasizes a warm, whimsical aesthetic ("Vivlit Bunny") and personal connection.

## 2. Key Features

### 🏺 Virtual Jars
*   **Creation**: Users can create new jars with a custom name and recipient.
*   **Content**: Jars can be filled with multiple types of notes:
    *   📝 **Text**: Written messages.
    *   🖼️ **Image**: Photo memories.
    *   🎤 **Audio**: Voice recordings (integrated AudioRecorder).
    *   📹 **Video**: Video clips.
*   **Cover Notes**: Each jar has a "cover note" - a heartfelt introductory message.
*   **AI Generation**: Users can use **Gemini AI** to auto-generate whimsical cover notes based on a prompt.

### 🤝 Sharing & Interaction
*   **Sharing**: Jars can be shared via a unique link (URL parameter `jarId`).
*   **Guest Access**: Unauthenticated users (guests) can view shared jars or start creating a jar (but must sign in to save).
*   **Memory Lane**: Tracks sent and received jars with details like Sender, Recipient, and Sent Date.

### 👤 User Management
*   **Authentication**: Supports user sign-up/login (currently implemented via local storage/mock services).
*   **Profiles**: Users have profiles with names and avatars.
*   **Dashboard**: A home view displaying all user's jars.

## 3. Technical Architecture

### Stack
*   **Framework**: React 19
*   **Build Tool**: Vite
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS (inferred from utility classes)
*   **AI**: Google Gemini API (`@google/genai` SDK)

### State Management
*   **Local State**: Heavily relies on React `useState` in `App.tsx` for routing and data flow.
*   **Persistence**: `dataService` and `authService` likely use `localStorage` to persist users and jars (based on "MVP" nature and lack of backend code visible).

### Routing
*   **Custom Router**: The app uses a state-based router (`view` and `appState` variables in `App.tsx`) rather than a library like `react-router-dom`.
    *   **Views**: `HOME`, `CREATE_JAR`, `VIEW_JAR`, `PROFILE`.
    *   **App States**: `LANDING`, `AUTH`, `APP`, `SHARED_VIEW`, `GUEST_CREATING`.

## 4. Code Structure

### 📂 Root Directory
*   `App.tsx`: The main application controller. Handles global state, routing logic, and high-level layout.
*   `types.ts`: TypeScript interfaces defining core data models (`Jar`, `Note`, `User`, `NoteType`).
*   `vite.config.ts`: Vite configuration.
*   `tsconfig.json`: TypeScript compiler configuration.

### 📂 /components
Contains all UI components:
*   **Pages/Views**:
    *   `HomePage.tsx`: Main dashboard for logged-in users.
    *   `LandingPage.tsx`: Welcome screen for visitors.
    *   `AuthPage.tsx`: Login/Signup forms.
    *   `ProfilePage.tsx`: User profile settings.
    *   `JarView.tsx`: Interface for viewing the contents of a jar.
    *   `CreateJar.tsx`: Wizard/Form for building a new jar.
*   **Widgets**:
    *   `Navbar.tsx`: Top navigation bar.
    *   `AudioRecorder.tsx`: Component for recording voice notes.
    *   `NoteModal.tsx`: Modal for adding/editing notes.
    *   `ShareModal.tsx`: UI for sharing a jar.
    *   `ConfirmationModal.tsx`: Generic confirmation dialog.
    *   `LoadingSpinner.tsx`: Visual loading indicator.
    *   `icons.tsx`: SVG icon definitions.

### 📂 /services
Business logic and API interactions:
*   `authService.ts`: Manages user sessions and authentication logic.
*   `dataService.ts`: Handles CRUD operations for Jars and Notes (likely interacting with LocalStorage).
*   `geminiService.ts`: Interface with Google's Gemini API for generating cover notes.

## 5. Current Status & Recent Changes
*   **Environment Configuration**: The project uses `import.meta.env` for Vite compatibility.
*   **Gemini SDK**: The project uses the modern `@google/genai` package. The service (`geminiService.ts`) has been updated to gracefully handle missing API keys by falling back to mock responses instead of crashing.
*   **Styling**: Tailwind CSS v4.1 is installed. The project uses the modern CSS-first configuration (`@import "tailwindcss";` in `index.css`) and `@tailwindcss/postcss`. `tailwind.config.js` has been removed as it is optional in v4.
*   **TypeScript**: Configuration (`tsconfig.json`) includes `vite/client` types.
