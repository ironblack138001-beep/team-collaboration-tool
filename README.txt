Team Task Manager (Full Stack)

Description:
Team Task Manager is a full-stack web application that enables users to create projects, assign tasks, and track progress efficiently. It implements role-based access control where Admins manage projects and tasks, while Members can view and update their assigned tasks.

Tech Stack:
Frontend: React (Vite) + Tailwind CSS
Backend: Node.js + Express
Database: MongoDB
Authentication: JWT (JSON Web Token)

Key Features:
- User Authentication (Signup/Login)
- Role-Based Access Control (Admin & Member)
- Project Creation and Team Management
- Task Creation, Assignment, and Status Tracking
- Dashboard showing tasks (completed, pending, overdue)

Project Structure:
backend/
  - models
  - routes
  - middleware
  - index.js

frontend/
  - src
  - components
  - pages
  - services
  - context

Setup Instructions:

1. Clone the repository:
git clone https://github.com/Alkasingh09/team-collaboration-tool.git

2. Backend Setup:
cd backend
npm install
npm run dev

3. Frontend Setup:
cd frontend
npm install
npm run dev


Deployment:
The application is deployed using Render. The backend and frontend are both hosted on Render, and the application is fully accessible via the live URL.

Live Application URL:
https://team-collaboration-tool1.onrender.com

GitHub Repository:
https://github.com/Alkasingh09/team-collaboration-tool.git

Notes:
- Ensure MongoDB is running or use MongoDB Atlas.
- Update API base URL in frontend when deploying.
- The application follows proper separation of concerns.
