import {
    createProject, findProjectById, findProjectsByUserId,
    updateProjectById, softDeleteProject
} from '../repositories/project.repository.js'
import {
    addMember, removeMember, findMember, findMembersByProject
} from '../repositories/projectMember.repository.js'
import { findUserById, findUserByEmail } from '../repositories/user.repository.js'
import { createActivityLog } from '../repositories/activityLog.repository.js'
import { ACTIONS } from '../constants/activityLog.constants.js'

// ─── CREATE PROJECT ───────────────────────────────────────────────────────────
export async function createProjectController(req, res) {
    try {
        const { name, description } = req.body
        const userId = req.userId

        if (!name) {
            return res.status(400).json({
                message: 'Project name is required',
                error: true,
                success: false
            })
        }

        const project = await createProject({ name, description, createdBy: userId })

        // Creator is automatically a Project Admin member
        await addMember({ projectId: project.id, userId, role: 'PROJECT_ADMIN' })

        await createActivityLog({
            projectId: project.id,
            userId,
            action: ACTIONS.PROJECT_CREATED,
            entityType: 'project',
            entityId: project.id,
            details: { name }
        })

        return res.status(201).json({
            message: 'Project created successfully',
            error: false,
            success: true,
            data: project
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// ─── GET ALL PROJECTS FOR USER ────────────────────────────────────────────────
export async function getProjectsController(req, res) {
    try {
        const userId = req.userId
        const projects = await findProjectsByUserId(userId)

        return res.json({
            message: 'Projects fetched successfully',
            error: false,
            success: true,
            data: projects
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// ─── GET PROJECT DETAIL ───────────────────────────────────────────────────────
export async function getProjectDetailController(req, res) {
    try {
        const { id } = req.params
        const userId = req.userId

        const project = await findProjectById(id)
        if (!project) {
            return res.status(404).json({
                message: 'Project not found',
                error: true,
                success: false
            })
        }

        // Check access: must be creator or a member
        const membership = await findMember({ projectId: id, userId })
        const isSuperAdmin = req.userRole === 'SUPER_ADMIN'

        if (!membership && project.createdBy !== userId && !isSuperAdmin) {
            return res.status(403).json({
                message: 'You do not have access to this project',
                error: true,
                success: false
            })
        }

        const members = await findMembersByProject(id)

        return res.json({
            message: 'Project details fetched successfully',
            error: false,
            success: true,
            data: { ...project, members }
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// ─── UPDATE PROJECT ───────────────────────────────────────────────────────────
export async function updateProjectController(req, res) {
    try {
        const { id } = req.params
        const userId = req.userId
        const { name, description, status } = req.body

        const project = await findProjectById(id)
        if (!project) {
            return res.status(404).json({
                message: 'Project not found',
                error: true,
                success: false
            })
        }

        const membership = await findMember({ projectId: id, userId })
        const canEdit = req.userRole === 'SUPER_ADMIN' || project.createdBy === userId

        if (!canEdit) {
            return res.status(403).json({
                message: 'Permission denied',
                error: true,
                success: false
            })
        }

        const updates = {}
        if (name) updates.name = name
        if (description !== undefined) updates.description = description
        if (status) updates.status = status

        await updateProjectById(id, updates)

        await createActivityLog({
            projectId: id,
            userId,
            action: ACTIONS.PROJECT_UPDATED,
            entityType: 'project',
            entityId: Number(id),
            details: updates
        })

        return res.json({
            message: 'Project updated successfully',
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

// ─── DELETE PROJECT ───────────────────────────────────────────────────────────
export async function deleteProjectController(req, res) {
    try {
        const { id } = req.params
        const userId = req.userId

        const project = await findProjectById(id)
        if (!project) {
            return res.status(404).json({
                message: 'Project not found',
                error: true,
                success: false
            })
        }

        const canDelete = req.userRole === 'SUPER_ADMIN' || project.createdBy === userId
        if (!canDelete) {
            return res.status(403).json({
                message: 'Permission denied',
                error: true,
                success: false
            })
        }

        await softDeleteProject(id)

        return res.json({
            message: 'Project deleted successfully',
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

// ─── ADD MEMBER ───────────────────────────────────────────────────────────────
export async function addMemberController(req, res) {
    try {
        const { id } = req.params
        const { userId: targetUserId, email, role = 'MEMBER' } = req.body
        const requesterId = req.userId

        if (!targetUserId && !email) {
            return res.status(400).json({
                message: 'userId or email is required',
                error: true,
                success: false
            })
        }

        const project = await findProjectById(id)
        if (!project) {
            return res.status(404).json({ message: 'Project not found', error: true, success: false })
        }

        const membership = await findMember({ projectId: id, userId: requesterId })
        const canManage = req.userRole === 'SUPER_ADMIN' ||
            project.createdBy === requesterId ||
            (membership && membership.role === 'PROJECT_ADMIN')

        if (!canManage) {
            return res.status(403).json({ message: 'Permission denied', error: true, success: false })
        }

        let targetUser = null
        if (targetUserId) {
            targetUser = await findUserById(targetUserId)
        } else if (email) {
            targetUser = await findUserByEmail(email)
        }

        if (!targetUser) {
            return res.status(404).json({ message: 'User not found', error: true, success: false })
        }

        const finalTargetUserId = targetUser.id

        const alreadyMember = await findMember({ projectId: id, userId: finalTargetUserId })
        if (alreadyMember) {
            return res.status(400).json({ message: 'User is already a member of this project', error: true, success: false })
        }

        // Determine project-level role based on user's global role
        let finalRole = targetUser.role === 'MEMBER' ? 'MEMBER' : 'PROJECT_ADMIN'
        
        // If a specific role was requested and user has enough global permission for it
        if (role === 'PROJECT_ADMIN' && targetUser.role !== 'MEMBER') {
            finalRole = 'PROJECT_ADMIN'
        }

        const newMember = await addMember({ projectId: id, userId: finalTargetUserId, role: finalRole })

        await createActivityLog({
            projectId: id,
            userId: requesterId,
            action: ACTIONS.MEMBER_INVITED,
            entityType: 'user',
            entityId: finalTargetUserId,
            details: { name: targetUser.name, email: targetUser.email, role }
        })

        return res.status(201).json({
            message: 'Member added successfully',
            error: false,
            success: true,
            data: newMember
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

// ─── REMOVE MEMBER ────────────────────────────────────────────────────────────
export async function removeMemberController(req, res) {
    try {
        const { id, userId: targetUserId } = req.params
        const requesterId = req.userId

        const project = await findProjectById(id)
        if (!project) {
            return res.status(404).json({ message: 'Project not found', error: true, success: false })
        }

        const membership = await findMember({ projectId: id, userId: requesterId })
        const canManage = req.userRole === 'SUPER_ADMIN' ||
            project.createdBy === requesterId ||
            (membership && membership.role === 'PROJECT_ADMIN')

        if (!canManage) {
            return res.status(403).json({ message: 'Permission denied', error: true, success: false })
        }

        if (Number(targetUserId) === requesterId && project.createdBy === requesterId) {
            return res.status(400).json({
                message: 'Project creator cannot be removed',
                error: true,
                success: false
            })
        }

        const affected = await removeMember({ projectId: id, userId: targetUserId })
        if (!affected) {
            return res.status(404).json({ message: 'Member not found in this project', error: true, success: false })
        }

        await createActivityLog({
            projectId: id,
            userId: requesterId,
            action: ACTIONS.MEMBER_REMOVED,
            entityType: 'user',
            entityId: Number(targetUserId)
        })

        return res.json({
            message: 'Member removed successfully',
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
