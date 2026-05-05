import { getTaskStatsByProject, getUpcomingDeadlines, findUserTasks } from '../repositories/task.repository.js'
import { findMember } from '../repositories/projectMember.repository.js'
import { findProjectById, findProjectsByUserId } from '../repositories/project.repository.js'
import { findRecentActivity } from '../repositories/activityLog.repository.js'

// ─── GET DASHBOARD ────────────────────────────────────────────────────────────
export async function getDashboardController(req, res) {
    try {
        const { projectId } = req.params
        const userId = req.userId

        const project = await findProjectById(projectId)
        if (!project) {
            return res.status(404).json({
                message: 'Project not found',
                error: true,
                success: false
            })
        }

        // Access check — must be a member or Super Admin
        if (req.userRole !== 'SUPER_ADMIN') {
            const membership = await findMember({ projectId, userId })
            if (!membership) {
                return res.status(403).json({
                    message: 'You do not have access to this project',
                    error: true,
                    success: false
                })
            }
        }

        // Run all dashboard queries in parallel for performance
        const [stats, upcomingDeadlines, recentActivity] = await Promise.all([
            getTaskStatsByProject(projectId),
            getUpcomingDeadlines(projectId, 7),
            findRecentActivity(projectId, 10)
        ])

        // Completion rate — safely handle zero-task projects
        const completionRate = stats.total > 0
            ? Math.round((Number(stats.done) / Number(stats.total)) * 100)
            : 0

        return res.json({
            message: 'Dashboard data fetched successfully',
            error: false,
            success: true,
            data: {
                project: {
                    id: project.id,
                    name: project.name,
                    status: project.status
                },
                taskStats: {
                    total: Number(stats.total),
                    todo: Number(stats.todo),
                    inProgress: Number(stats.in_progress),
                    done: Number(stats.done),
                    overdue: Number(stats.overdue),
                    completionRate
                },
                priorityBreakdown: {
                    urgent: Number(stats.urgent),
                    high: Number(stats.high),
                    medium: Number(stats.medium),
                    low: Number(stats.low)
                },
                upcomingDeadlines,
                recentActivity
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

// ─── GET GLOBAL DASHBOARD ─────────────────────────────────────────────────────
export async function getGlobalDashboardController(req, res) {
    try {
        const userId = req.userId

        // Run all queries in parallel
        const [projects, tasks] = await Promise.all([
            findProjectsByUserId(userId),
            findUserTasks(userId)
        ])

        const totalProjects = projects.length
        const totalTasks = tasks.length
        
        let doneTasks = 0
        let overdueTasks = 0
        const now = new Date()

        tasks.forEach(task => {
            if (task.status === 'DONE') {
                doneTasks++
            } else if (task.deadline && new Date(task.deadline) < now) {
                overdueTasks++
            }
        })

        const completionRate = totalTasks > 0
            ? Math.round((doneTasks / totalTasks) * 100)
            : 0

        return res.json({
            message: 'Global dashboard data fetched successfully',
            error: false,
            success: true,
            data: {
                totalProjects,
                totalTasks,
                overdueTasks,
                completionRate
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
