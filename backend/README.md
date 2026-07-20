# TaskFlow Pro — Backend API

## 🚀 Overview
Full-Stack Task Management REST API built with **Node.js + Express.js + JWT Authentication**

## 📁 Project Structure
```
backend/
├── server.js           # Main Express server
├── .env                # Environment variables
├── package.json
├── data/
│   └── store.js        # In-memory data store (JSON)
├── middleware/
│   └── authMiddleware.js  # JWT verification
├── controllers/
│   ├── authController.js  # Register, Login, GetMe
│   ├── taskController.js  # CRUD for Tasks
│   └── userController.js  # Profile, Stats
└── routes/
    ├── authRoutes.js   # /api/auth/*
    ├── taskRoutes.js   # /api/tasks/*
    └── userRoutes.js   # /api/users/*
```

## 🔧 Installation & Run

```bash
cd backend
npm install
npm run dev    # Development (nodemon)
npm start      # Production
```

## 📡 API Endpoints

### Auth Routes (`/api/auth`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login & get JWT token |
| GET | `/api/auth/me` | Private 🔒 | Get current user |

### Task Routes (`/api/tasks`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/tasks` | Private 🔒 | Get all tasks (with filters) |
| POST | `/api/tasks` | Private 🔒 | Create new task |
| GET | `/api/tasks/:id` | Private 🔒 | Get single task |
| PUT | `/api/tasks/:id` | Private 🔒 | Update task |
| DELETE | `/api/tasks/:id` | Private 🔒 | Delete task |
| PATCH | `/api/tasks/:id/status` | Private 🔒 | Quick status update |

### User Routes (`/api/users`)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/users/me` | Private 🔒 | Get profile |
| PUT | `/api/users/me` | Private 🔒 | Update profile |
| GET | `/api/users/stats` | Private 🔒 | Task statistics |

## 🔐 Authentication
Send JWT token in header:
```
Authorization: Bearer <your_token>
```

## 🧪 Test API (Demo Credentials)
```json
POST /api/auth/login
{
  "email": "demo@taskflow.com",
  "password": "password"
}
```

## ☁️ Azure Deployment
1. Create Azure App Service (Node.js 20)
2. Set Environment Variables in Azure Portal
3. Deploy via GitHub Actions or Azure CLI:
```bash
az webapp up --name taskflow-pro-api --resource-group myRG --runtime "NODE:20-lts"
```

## 🛠️ Tech Stack
- **Runtime**: Node.js v20
- **Framework**: Express.js 4.18
- **Auth**: JWT + bcryptjs
- **Validation**: express-validator
- **Logging**: Morgan
- **Cloud**: Azure App Service ready
