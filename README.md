# ProjectHub 🚀

ProjectHub is a modern, full-stack Project Management application designed to streamline collaboration and task tracking. It features a robust Role-Based Access Control (RBAC) system, secure authentication, and real-time project insights.

## ✨ Features

- **User Authentication**: Secure Login/Register with 6-digit OTP email verification.
- **Role-Based Access Control (RBAC)**:
  - **Super Admin**: Full visibility and control across all projects.
  - **Project Admin**: Manage specific projects and assign tasks.
  - **Member**: Track assigned tasks and update progress.
- **Project Management**: Create, update, and manage projects with ease.
- **Task Tracking**: Granular task management with status updates.
- **Dashboard**: High-level overview of project status, tasks, and team activity.
- **Notifications**: Stay updated with in-app notifications.

## 🛠️ Tech Stack

### Backend
- **Core**: Node.js, Express.js
- **ORM**: Prisma
- **Database**: MariaDB / MySQL
- **Security**: JWT, BcryptJS, Helmet, Express-Rate-Limit
- **Utilities**: Nodemailer (OTP delivery), UUID

### Frontend
- **Core**: React 19, Vite
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS 4
- **Forms**: React Hook Form
- **Icons**: React Icons (Fi, Md, etc.)
- **Routing**: React Router Dom

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MySQL or MariaDB instance
- SMTP Server (for OTP emails)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Ravi5746/ProjectHub.git
   cd ProjectHub
   ```

2. **Backend Setup**:
   ```bash
   cd Backend
   npm install
   ```
   - Create a `.env` file in the `Backend` directory and add:
     ```env
     PORT=8000
     DATABASE_URL="mysql://user:password@localhost:3306/projecthub"
     JWT_SECRET="your_secret_key"
     EMAIL_USER="your-email@gmail.com"
     EMAIL_PASS="your-app-password"
     ```
   - Run migrations:
     ```bash
     npm run db:migrate
     ```
   - Start the server:
     ```bash
     npm run dev
     ```

3. **Frontend Setup**:
   ```bash
   cd ../Frontend
   npm install
   ```
   - Create a `.env` file in the `Frontend` directory if needed (e.g., for API URL).
   - Start the development server:
     ```bash
     npm run dev
     ```

## 📄 License
This project is licensed under the ISC License.

## 👨‍💻 Author
**Ravi** - [GitHub](https://github.com/Ravi5746)
