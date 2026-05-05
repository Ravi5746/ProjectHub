import { createBrowserRouter } from 'react-router-dom'
import App from '../App'
import AuthLayout from '../layouts/AuthLayout'
import DashboardLayout from '../layouts/DashboardLayout'
import Login from '../pages/Login'
import Register from '../pages/Register'
import VerifyEmail from '../pages/VerifyEmail'
import ForgotPassword from '../pages/ForgotPassword'
import ResetPassword from '../pages/ResetPassword'
import Dashboard from '../pages/Dashboard'
import ProjectsList from '../pages/ProjectsList'
import ProjectDetails from '../pages/ProjectDetails'
import Tasks from '../pages/Tasks'
import Profile from '../pages/Profile'
import UsersManagement from '../pages/UsersManagement'
import OtpVerification from '../pages/OtpVerification'

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {
                element: <AuthLayout />,
                children: [
                    {
                        path: "login",
                        element: <Login />
                    },
                    {
                        path: "register",
                        element: <Register />
                    },
                    {
                        path: "otp-verification",
                        element: <OtpVerification />
                    },
                    {
                        path: "verify-email",
                        element: <VerifyEmail />
                    },
                    {
                        path: "forgot-password",
                        element: <ForgotPassword />
                    },
                    {
                        path: "reset-password",
                        element: <ResetPassword />
                    }
                ]
            },
            {
                element: <DashboardLayout />,
                children: [
                    {
                        path: "dashboard",
                        element: <Dashboard />
                    },
                    {
                        path: "projects",
                        element: <ProjectsList />
                    },
                    {
                        path: "projects/:id",
                        element: <ProjectDetails />
                    },
                    {
                        path: "tasks",
                        element: <Tasks />
                    },
                    {
                        path: "users",
                        element: <UsersManagement />
                    },
                    {
                        path: "profile",
                        element: <Profile />
                    },
                    {
                        path: "",
                        element: <Dashboard />
                    }
                ]
            }
        ]
    }
])

export default router
