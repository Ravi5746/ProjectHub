// authorize(...allowedRoles) — flexible RBAC middleware
// Usage: authorize('SUPER_ADMIN') or authorize('SUPER_ADMIN', 'PROJECT_ADMIN')
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        try {
            const userRole = req.userRole

            if (!userRole || !allowedRoles.includes(userRole)) {
                return res.status(403).json({
                    message: 'Permission denied',
                    error: true,
                    success: false
                })
            }

            next()

        } catch (error) {
            return res.status(500).json({
                message: 'Authorization error',
                error: true,
                success: false
            })
        }
    }
}

export default authorize
