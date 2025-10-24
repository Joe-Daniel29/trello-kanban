# 🚀 Trello-Like Kanban Board

A full-stack MERN application that provides a comprehensive project management solution with advanced features for task organization, team collaboration, and workflow management.

## 🌐 Live Demo

**Frontend:** [https://trello-kanban-joe.vercel.app](https://trello-kanban-joe.vercel.app)  
**Backend API:** [https://trello-kanban-backend-joe.vercel.app](https://trello-kanban-backend-joe.vercel.app)

---

## 📋 Project Overview

This Kanban board application is a modern project management tool inspired by Trello. It provides an intuitive drag-and-drop interface for organizing tasks across customizable lists and boards, with a clean and responsive user interface.

### 🎯 Key Features

#### **Core Functionality**
- **Multi-Board Management**: Create and manage multiple project boards
- **Drag & Drop Interface**: Intuitive task and list reordering with smooth animations using @dnd-kit
- **User Authentication**: Secure JWT-based authentication system
- **Responsive Design**: Works seamlessly across desktop, tablet, and mobile devices

#### **Task Management**
- **Task Creation**: Create tasks within lists with titles
- **Task Completion**: Mark tasks as complete/incomplete
- **Task Reordering**: Drag and drop tasks within lists to reorder
- **Task Movement**: Move tasks between different lists

#### **List Management**
- **List Creation**: Add custom lists to organize tasks
- **List Reordering**: Drag and drop lists to reorganize your board
- **List Archiving**: Archive lists you no longer need
- **Archive Management**: View, unarchive, or permanently delete archived lists

---

## 🛠 Development Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- Git

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/trello-kanban.git
   cd trello-kanban
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Environment Setup**
   
   Create a `.env` file in the server directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI= your_mongodb_url
   JWT_SECRET=your_jwt_secret_key_here
   <!-- CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret -->
   ```

5. **Start the development servers**

   **Terminal 1 (Backend):**
   ```bash
   cd server
   npm start
   ```

   **Terminal 2 (Frontend):**
   ```bash
   cd client
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

### Production Deployment

The application is configured for deployment on Vercel:

1. **Frontend Deployment**: Automatically deploys from the `client` directory
2. **Backend Deployment**: Automatically deploys from the `server` directory
3. **Environment Variables**: Configure production environment variables in Vercel dashboard

---

## 🏗 API Structure & Documentation

### **Base URL**
- Development: `http://localhost:5000/api`
- Production: `https://trello-kanban-backend-joe.vercel.app/api`

### **Authentication Endpoints**

#### `POST /api/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### `POST /api/auth/login`
Authenticate user and return JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### `GET /api/auth/me`
Get current user information (requires authentication).

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Response:**
```json
{
  "success": true,
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### **Board Management Endpoints**

#### `GET /api/boards`
Get all boards for the authenticated user.

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Response:**
```json
{
  "success": true,
  "boards": [
    {
      "_id": "board_id",
      "name": "Project Alpha",
      "user": "user_id",
      "lists": ["list_id_1", "list_id_2"],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### `POST /api/boards`
Create a new board.

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Request Body:**
```json
{
  "name": "New Project Board"
}
```

**Response:**
```json
{
  "success": true,
  "board": {
    "_id": "board_id",
    "name": "New Project Board",
    "user": "user_id",
    "lists": [],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### `GET /api/boards/:id`
Get a specific board with populated lists and tasks.

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Response:**
```json
{
  "success": true,
  "board": {
    "_id": "board_id",
    "name": "Project Alpha",
    "user": "user_id",
    "lists": [
      {
        "_id": "list_id",
        "title": "To Do",
        "board": "board_id",
        "position": 0,
        "tasks": [
          {
            "_id": "task_id",
            "title": "Sample Task",
            "isCompleted": false,
            "position": 0,
            "list": "list_id",
            "board": "board_id",
            "user": "user_id",
            "createdAt": "2024-01-01T00:00:00.000Z",
            "updatedAt": "2024-01-01T00:00:00.000Z"
          }
        ],
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### **List Management Endpoints**

#### `POST /api/boards/:boardId/lists`
Create a new list in a board.

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Request Body:**
```json
{
  "name": "New List",
  "position": 0
}
```

#### `PUT /api/boards/:boardId/lists/reorder`
Update the order of lists in a board.

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Request Body:**
```json
{
  "lists": [
    { "listId": "list_id_1", "position": 0 },
    { "listId": "list_id_2", "position": 1 }
  ]
}
```

### **Task Management Endpoints**

#### `POST /api/boards/:boardId/lists/:listId/tasks`
Create a new task in a list.

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Request Body:**
```json
{
  "title": "New Task"
}
```

#### `PUT /api/boards/:boardId/lists/:listId/tasks/:taskId`
Update an existing task.

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Request Body:**
```json
{
  "title": "Updated Task Title",
  "isCompleted": true
}
```

#### `PUT /api/boards/:boardId/lists/:listId/tasks/reorder`
Update the order of tasks in a list.

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Request Body:**
```json
{
  "tasks": [
    { "taskId": "task_id_1", "position": 0 },
    { "taskId": "task_id_2", "position": 1 }
  ]
}
```

### **Error Handling**

All API endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

**Common HTTP Status Codes:**
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `404`: Not Found
- `500`: Internal Server Error

---

## 🏛 Architecture & Technology Stack

### **Frontend (React + Vite)**
- **React 19**: Modern React with hooks and functional components
- **Vite**: Fast build tool and development server
- **React Router DOM**: Client-side routing
- **@dnd-kit**: Advanced drag and drop functionality
- **Axios**: HTTP client for API communication
- **CSS3**: Custom styling with responsive design

### **Backend (Node.js + Express)**
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database for data persistence
- **Mongoose**: MongoDB object modeling
- **JWT**: JSON Web Tokens for authentication
- **Socket.io**: Real-time communication infrastructure (basic setup)
- **bcryptjs**: Password hashing
- **CORS**: Cross-origin resource sharing

### **Database Schema**

#### **User Model**
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  createdAt: Date
}
```

#### **Board Model**
```javascript
{
  user: ObjectId (ref: User, required),
  name: String (required),
  lists: [ObjectId] (ref: List),
  createdAt: Date,
  updatedAt: Date
}
```

#### **List Model**
```javascript
{
  title: String (required),
  board: ObjectId (ref: Board, required),
  position: Number (default: 0),
  tasks: [ObjectId] (ref: Task),
  createdAt: Date,
  updatedAt: Date
}
```

#### **Task Model**
```javascript
{
  title: String (required),
  isCompleted: Boolean (default: false),
  position: Number (default: 0),
  list: ObjectId (ref: List, required),
  board: ObjectId (ref: Board, required),
  user: ObjectId (ref: User, required),
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🚀 Features in Detail

### **Drag & Drop Interface**
- Powered by @dnd-kit for smooth, accessible drag and drop
- Reorder tasks within lists
- Reorder lists within boards
- Move tasks between lists
- Touch-friendly interactions

### **List Archiving**
- Archive lists to declutter your board
- View all archived lists in a dedicated modal
- Unarchive lists to restore them
- Permanently delete archived lists
- Bulk delete all archived lists

### **Responsive Design**
- Mobile-first approach
- Touch-friendly drag and drop
- Adaptive layouts for all screen sizes
- Optimized performance across devices

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

