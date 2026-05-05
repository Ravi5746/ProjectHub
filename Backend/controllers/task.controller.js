import {
    createTask, findTaskById, findTasksByProject, findUserTasks, findAllTasks,
    updateTaskById, softDeleteTask
} from '../repositories/task.repository.js'
import { findMember } from '../repositories/projectMember.repository.js'
import { findProjectById } from '../repositories/project.repository.js'
import { createActivityLog } from '../repositories/activityLog.repository.js'
import { TASK_STATUS, ALLOWED_TRANSITIONS, REOPEN_ALLOWED_ROLES } from '../constants/task.constants.js'
import { ACTIONS } from '../constants/activityLog.constants.js'

// ─── HELPER: check project access ────────────────────────────────────────────
async function checkProjectAccess(projectId, userId, userRole) {
    const project = await findProjectById(projectId)
    if (!project) return { ok: false, reason: 'Project not found', status: 404 }

    if (userRole === 'SUPER_ADMIN') return { ok: true, project }

    const membership = await findMember({ projectId, userId })
    if (!membership) return { ok: false, reason: 'You do not have access to this project', status: 403 }

    return { ok: true, project, membership }
}

// ─── CREATE TASK ──────────────────────────────────────────────────────────────
export async function createTaskController(req, res) {
    try {
        const userId = req.userId
        const { projectId, title, description, priority, deadline, assigneeId } = req.body

        if (!projectId || !title) {
            return res.status(400).json({
                message: 'projectId and title are required',
                error: true,
                success: false
            })
        }

        const access = await checkProjectAccess(projectId, userId, req.userRole)
        if (!access.ok) {
            return res.status(access.status).json({ message: access.reason, error: true, success: false })
        }

        const isAdmin = req.userRole === 'SUPER_ADMIN' || (access.membership && access.membership.role === 'PROJECT_ADMIN')
        if (!isAdmin) {
            return res.status(403).json({ message: 'Only admins can create tasks in this project', error: true, success: false })
        }

        const task = await createTask({
            projectId, title, description, priority, deadline, assigneeId, createdBy: userId
        })

        await createActivityLog({
            projectId,
            userId,
            action: ACTIONS.TASK_CREATED,
            entityType: 'task',
            entityId: task.id,
            details: { title, priority }
        })

        return res.status(201).json({
            message: 'Task created successfully',
            error: false,
            success: true,
            data: task
        })

    } catch (error) {
        return res.status(500).json({ message: error.message || error, error: true, success: false })
    }
}

// ─── GET TASKS BY PROJECT ─────────────────────────────────────────────────────
export async function getTasksController(req, res) {
    try {
        const userId = req.userId
        const { projectId } = req.params
        const { status, priority, assigneeId } = req.query

        const access = await checkProjectAccess(projectId, userId, req.userRole)
        if (!access.ok) {
            return res.status(access.status).json({ message: access.reason, error: true, success: false })
        }

        let tasks = await findTasksByProject(projectId, { status, priority, assigneeId })

        const isAdmin = req.userRole === 'SUPER_ADMIN' || (access.membership && access.membership.role === 'PROJECT_ADMIN')
        if (!isAdmin) {
            tasks = tasks.filter(task => task.assigneeId === userId)
        }

        // Calculate overdue flag in-memory (not stored in DB per architecture)
        const now = new Date()
        const enriched = tasks.map(task => ({
            ...task,
            isOverdue: task.deadline && task.status !== 'DONE' && new Date(task.deadline) < now
        }))

        return res.json({
            message: 'Tasks fetched successfully',
            error: false,
            success: true,
            data: enriched
        })

    } catch (error) {
        return res.status(500).json({ message: error.message || error, error: true, success: false })
    }
}

// ─── GET TASK DETAIL ──────────────────────────────────────────────────────────
export async function getTaskDetailController(req, res) {
    try {
        const userId = req.userId
        const { id } = req.params

        const task = await findTaskById(id)
        if (!task) {
            return res.status(404).json({ message: 'Task not found', error: true, success: false })
        }

        const access = await checkProjectAccess(task.projectId, userId, req.userRole)
        if (!access.ok) {
            return res.status(access.status).json({ message: access.reason, error: true, success: false })
        }

        const now = new Date()
        const enriched = {
            ...task,
            isOverdue: task.deadline && task.status !== 'DONE' && new Date(task.deadline) < now
        }

        return res.json({
            message: 'Task fetched successfully',
            error: false,
            success: true,
            data: enriched
        })

    } catch (error) {
        return res.status(500).json({ message: error.message || error, error: true, success: false })
    }
}

// ─── UPDATE TASK ──────────────────────────────────────────────────────────────
export async function updateTaskController(req, res) {
    try {
        const userId = req.userId
        const { id } = req.params
        const { title, description, status, priority, deadline, assigneeId } = req.body

        const task = await findTaskById(id)
        if (!task) {
            return res.status(404).json({ message: 'Task not found', error: true, success: false })
        }

        const access = await checkProjectAccess(task.projectId, userId, req.userRole)
        if (!access.ok) {
            return res.status(access.status).json({ message: access.reason, error: true, success: false })
        }

        // Status transition validation
        if (status && status !== task.status) {
            const allowedTransitions = ALLOWED_TRANSITIONS[task.status] || []
            if (!allowedTransitions.includes(status)) {
                return res.status(400).json({
                    message: `Invalid status transition: ${task.status} → ${status}`,
                    error: true,
                    success: false
                })
            }

            // DONE → IN_PROGRESS only for Admin roles
            if (task.status === TASK_STATUS.DONE && !REOPEN_ALLOWED_ROLES.includes(req.userRole)) {
                const memberRole = access.membership?.role
                if (!REOPEN_ALLOWED_ROLES.includes(memberRole)) {
                    return res.status(403).json({
                        message: 'Only admins can reopen a completed task',
                        error: true,
                        success: false
                    })
                }
            }
        }

        const isAdmin = req.userRole === 'SUPER_ADMIN' || (access.membership && access.membership.role === 'PROJECT_ADMIN')

        const updates = {}
        if (status !== undefined) updates.status = status

        if (isAdmin) {
            if (title !== undefined) updates.title = title
            if (description !== undefined) updates.description = description
            if (priority !== undefined) updates.priority = priority
            if (deadline !== undefined) updates.deadline = deadline
            if (assigneeId !== undefined) updates.assigneeId = assigneeId
        } else {
            // For regular members, if they try to update fields other than status,
            // we will simply ignore them as per requirements.
            // If the only thing they sent was a non-status field, updates will be empty
            if (Object.keys(updates).length === 0 && (title || description || priority || deadline || assigneeId)) {
                return res.status(403).json({
                    message: 'Members can only update the status of a task',
                    error: true,
                    success: false
                })
            }
        }

        await updateTaskById(id, updates)

        const action = status && status !== task.status ? ACTIONS.TASK_STATUS_CHANGED : ACTIONS.TASK_UPDATED
        await createActivityLog({
            projectId: task.projectId,
            userId,
            action,
            entityType: 'task',
            entityId: Number(id),
            details: status ? { from: task.status, to: status } : updates
        })

        return res.json({
            message: 'Task updated successfully',
            error: false,
            success: true
        })

    } catch (error) {
        return res.status(500).json({ message: error.message || error, error: true, success: false })
    }
}

// ─── DELETE TASK ──────────────────────────────────────────────────────────────
export async function deleteTaskController(req, res) {
    try {
        const userId = req.userId
        const { id } = req.params

        const task = await findTaskById(id)
        if (!task) {
            return res.status(404).json({ message: 'Task not found', error: true, success: false })
        }

        const access = await checkProjectAccess(task.projectId, userId, req.userRole)
        if (!access.ok) {
            return res.status(access.status).json({ message: access.reason, error: true, success: false })
        }

        // Only creator, project admin, or super admin can delete
        const canDelete = req.userRole === 'SUPER_ADMIN' ||
            task.createdBy === userId ||
            (access.membership && access.membership.role === 'PROJECT_ADMIN')

        if (!canDelete) {
            return res.status(403).json({ message: 'Permission denied', error: true, success: false })
        }

        await softDeleteTask(id)

        await createActivityLog({
            projectId: task.projectId,
            userId,
            action: ACTIONS.TASK_DELETED,
            entityType: 'task',
            entityId: Number(id),
            details: { title: task.title }
        })

        return res.json({
            message: 'Task deleted successfully',
            error: false,
            success: true
        })

    } catch (error) {
        return res.status(500).json({ message: error.message || error, error: true, success: false })
    }
}

// ─── GET ALL TASKS FOR CURRENT USER ───────────────────────────────────────────
export async function getUserTasksController(req, res) {
    try {
        const userId = req.userId
        
        let tasks = []
        if (req.userRole === 'SUPER_ADMIN') {
            tasks = await findAllTasks()
        } else {
            tasks = await findUserTasks(userId)
        }

        const now = new Date()
        const enriched = tasks.map(task => ({
            ...task,
            isOverdue: task.deadline && task.status !== 'DONE' && new Date(task.deadline) < now
        }))

        return res.json({
            message: 'User tasks fetched successfully',
            error: false,
            success: true,
            data: enriched
        })

    } catch (error) {
        return res.status(500).json({ message: error.message || error, error: true, success: false })
    }
}
