import bcryptjs from 'bcryptjs'
import { findUserById, findAllUsers, updateUserById, softDeleteUser } from '../repositories/user.repository.js'
import { updateUserRolesInAllProjects } from '../repositories/projectMember.repository.js'

// ─── GET CURRENT USER ─────────────────────────────────────────────────────────
export async function getMeController(req, res) {
    try {
        const userId = req.userId
        const user = await findUserById(userId)

        if (!user) {
            return res.status(404).json({
                message: 'User not found',
                error: true,
                success: false
            })
        }

        // Strip sensitive fields before sending
        const { password, refreshToken, forgotPasswordOtp, forgotPasswordExpiry, verifyEmailToken, verifyEmailExpiry, ...safeUser } = user

        return res.json({
            message: 'User details fetched successfully',
            error: false,
            success: true,
            data: safeUser
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// ─── UPDATE CURRENT USER ──────────────────────────────────────────────────────
export async function updateMeController(req, res) {
    try {
        const userId = req.userId
        const { name, mobile } = req.body

        const updates = {}
        if (name) updates.name = name
        if (mobile) updates.mobile = mobile

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                message: 'No valid fields provided to update',
                error: true,
                success: false
            })
        }

        const updatedUser = await updateUserById(userId, updates)

        return res.json({
            message: 'Profile updated successfully',
            error: false,
            success: true,
            data: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                mobile: updatedUser.mobile,
                role: updatedUser.role,
                status: updatedUser.status,
                avatar: updatedUser.avatar
            }
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// ─── LIST ALL USERS (Super Admin only) ───────────────────────────────────────
export async function listUsersController(req, res) {
    try {
        const limit = parseInt(req.query.limit) || 50
        const offset = parseInt(req.query.offset) || 0

        const users = await findAllUsers({ limit, offset })

        return res.json({
            message: 'Users fetched successfully',
            error: false,
            success: true,
            data: users
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// ─── SOFT DELETE USER (Super Admin only) ─────────────────────────────────────
export async function softDeleteUserController(req, res) {
    try {
        const { id } = req.params

        if (Number(id) === req.userId) {
            return res.status(400).json({
                message: 'You cannot delete your own account',
                error: true,
                success: false
            })
        }

        const user = await findUserById(id)
        if (!user) {
            return res.status(404).json({
                message: 'User not found',
                error: true,
                success: false
            })
        }

        await softDeleteUser(id)

        return res.json({
            message: 'User deleted successfully',
            error: false,
            success: true
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}
// ─── UPDATE USER ROLE (Super Admin only) ─────────────────────────────────────
export async function updateUserRoleController(req, res) {
    try {
        const { id } = req.params
        const { role } = req.body

        if (!['MEMBER', 'PROJECT_ADMIN', 'SUPER_ADMIN'].includes(role)) {
            return res.status(400).json({
                message: 'Invalid role provided',
                error: true,
                success: false
            })
        }

        if (Number(id) === req.userId) {
            return res.status(400).json({
                message: 'You cannot change your own role',
                error: true,
                success: false
            })
        }

        const user = await findUserById(id)
        if (!user) {
            return res.status(404).json({
                message: 'User not found',
                error: true,
                success: false
            })
        }

        await updateUserById(id, { role })

        // Update role in all projects for this user as well
        // ProjectMember role enum only has MEMBER and PROJECT_ADMIN
        let projectRole = role
        if (role === 'SUPER_ADMIN') {
            projectRole = 'PROJECT_ADMIN' // Show Super Admins as Project Admins in projects
        }
        await updateUserRolesInAllProjects(id, projectRole)

        return res.json({
            message: 'User role updated successfully',
            error: false,
            success: true
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}
