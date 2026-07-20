# ⚡ TaskFlow Pro — Enterprise Task Management

![TaskFlow Pro Banner](https://img.shields.io/badge/TaskFlow%20Pro-Enterprise%20Grade-7c3aed?style=for-the-badge&logo=react)

TaskFlow Pro is a full-stack, enterprise-grade task management platform built with the modern **MERN stack**. It features a robust feature-based architecture on the frontend (React + Redux Toolkit + Vite) and a clean MVC architecture on the backend (Node.js + Express + MongoDB).

## 🚀 Key Features

* **Advanced State Management**: Utilizes Redux Toolkit with async thunks for predictable state container and API interaction.
* **Feature-Based Architecture**: Highly scalable frontend structure separating logic by feature domains (auth, dashboard).
* **Robust Security**: JSON Web Tokens (JWT) for authentication with Axios interceptors managing token injection and 401 automatic logouts.
* **Interactive Kanban Board**: Dynamic drag-and-drop-ready task management with granular status and priority filtering.
* **Real-time Search & Debouncing**: Optimized search functionality utilizing custom `useDebounce` hooks to prevent unnecessary API calls.
* **RESTful API**: Node.js/Express backend strictly following MVC design patterns.
* **Data Integrity**: Mongoose schemas with pre-save hooks and automated indexing.

## 🛠️ Technology Stack

### **Frontend**
* React 18
* Redux Toolkit
* React Query (TanStack)
* Vite (Build Tool)
* React Router v6
* Axios
* Lucide React (Icons)
* Vanilla CSS (CSS Variables, Glassmorphism UI)

### **Backend**
* Node.js
* Express.js
* MongoDB & Mongoose
* JSON Web Token (JWT)
* bcryptjs

## 📁 Project Structure

```
taskflow-pro/
├── backend/                  # Node.js + Express + MongoDB
│   ├── config/               # DB Connection
│   ├── controllers/          # Business logic (auth, task, user)
│   ├── middleware/           # Auth guard (JWT)
│   ├── models/               # Mongoose Schemas (User, Task)
│   └── routes/               # Express routing
│
└── frontend/                 # React + Vite + Redux
    └── src/
        ├── api/              # API request definitions
        ├── components/       # Shared UI components
        ├── config/           # App configuration & permissions
        ├── features/         # Feature-based slices (auth, dashboard)
        ├── hooks/            # Custom React hooks (debounce, pagination)
        ├── layouts/          # Application layouts (Auth vs Main)
        ├── lib/              # Library configurations (Axios, React Query)
        ├── pages/            # Application routes
        ├── providers/        # Context Providers (Redux, Theme, Query)
        ├── services/         # Decoupled business logic & storage
        ├── store/            # Redux store configuration
        └── utils/            # Shared utilities & validators
```

## ⚙️ Local Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/taskflow-pro.git
   cd taskflow-pro
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   # Create a .env file with PORT=5000 and MONGO_URI, JWT_SECRET
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

4. **Open Application**
   Visit `http://localhost:3000` in your browser.

## 👨‍💻 Developed By

**Krunal varaliya**  
Full Stack Developer

---
*Built with ❤️ focusing on clean code, scalability, and modern best practices.*
