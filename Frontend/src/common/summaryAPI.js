const rawURL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000"
export const baseURL = (rawURL.startsWith('http') ? rawURL : `https://${rawURL}`).replace(/\/$/, "");

const SummaryAPI = {
    // Auth
    signup: {
        url: '/api/v1/auth/signup',
        method: 'post'
    },
    verify_email: {
        url: '/api/v1/auth/verify-email',
        method: 'post'
    },
    resend_verify_email: {
        url: '/api/v1/auth/resend-verify-email',
        method: 'post'
    },
    login: {
        url: '/api/v1/auth/login',
        method: 'post'
    },
    logout: {
        url: '/api/v1/auth/logout',
        method: 'get'
    },
    refresh_token: {
        url: '/api/v1/auth/refresh-token',
        method: 'post'
    },
    forgot_password: {
        url: '/api/v1/auth/forgot-password',
        method: 'put'
    },
    verify_forgot_password_otp: {
        url: '/api/v1/auth/verify-forgot-password-otp',
        method: 'put'
    },
    reset_password: {
        url: '/api/v1/auth/reset-password',
        method: 'put'
    },

    // Users
    get_user: {
        url: '/api/v1/users/me',
        method: 'get'
    },
    update_user: {
        url: '/api/v1/users/update',
        method: 'put'
    },
    list_users: {
        url: '/api/v1/users/list',
        method: 'get'
    },
    delete_user: {
        url: '/api/v1/users/:id',
        method: 'delete'
    },
    update_user_role: {
        url: '/api/v1/users/:id/role',
        method: 'put'
    },

    // Projects
    create_project: {
        url: '/api/v1/projects/create',
        method: 'post'
    },
    list_projects: {
        url: '/api/v1/projects/list',
        method: 'get'
    },
    get_project: {
        url: '/api/v1/projects/:id',
        method: 'get'
    },
    update_project: {
        url: '/api/v1/projects/:id',
        method: 'put'
    },
    delete_project: {
        url: '/api/v1/projects/:id',
        method: 'delete'
    },
    add_member: {
        url: '/api/v1/projects/:id/members',
        method: 'post'
    },
    remove_member: {
        url: '/api/v1/projects/:id/members/:userId',
        method: 'delete'
    },

    // Tasks
    create_task: {
        url: '/api/v1/tasks/create',
        method: 'post'
    },
    list_tasks: {
        url: '/api/v1/tasks/list',
        method: 'get'
    },
    list_project_tasks: {
        url: '/api/v1/tasks/list/:projectId',
        method: 'get'
    },
    get_task: {
        url: '/api/v1/tasks/:id',
        method: 'get'
    },
    update_task: {
        url: '/api/v1/tasks/:id',
        method: 'put'
    },
    delete_task: {
        url: '/api/v1/tasks/:id',
        method: 'delete'
    },

    // Dashboard
    get_dashboard: {
        url: '/api/v1/dashboard',
        method: 'get'
    },
    get_project_dashboard: {
        url: '/api/v1/dashboard/:projectId',
        method: 'get'
    }
}

export default SummaryAPI
