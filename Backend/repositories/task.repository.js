import { prisma } from '../config/connectDB.js'

export async function createTask({ projectId, title, description, status = 'TODO', priority = 'MEDIUM', deadline, assigneeId, createdBy }) {
    return prisma.task.create({
        data: {
            projectId: Number(projectId),
            title,
            description,
            status,
            priority,
            deadline: deadline ? new Date(deadline) : null,
            assigneeId: assigneeId ? Number(assigneeId) : null,
            createdBy: Number(createdBy)
        }
    })
}

export async function findTaskById(id) {
    return prisma.task.findFirst({
        where: { id: Number(id), deletedAt: null },
        include: {
            assignee: { select: { id: true, name: true, email: true, avatar: true } },
            creator: { select: { id: true, name: true } }
        }
    })
}

export async function findAllTasks() {
    return prisma.task.findMany({
        where: { deletedAt: null },
        include: {
            assignee: { select: { id: true, name: true, email: true, avatar: true } },
            creator: { select: { id: true, name: true } },
            project: { select: { id: true, name: true } }
        },
        orderBy: { createdAt: 'desc' }
    })
}

export async function findTasksByProject(projectId, { status, priority, assigneeId } = {}) {
    return prisma.task.findMany({
        where: {
            projectId: Number(projectId),
            deletedAt: null,
            ...(status && { status }),
            ...(priority && { priority }),
            ...(assigneeId && { assigneeId: Number(assigneeId) })
        },
        include: {
            assignee: { select: { id: true, name: true, email: true, avatar: true } },
            creator: { select: { id: true, name: true } }
        },
        orderBy: { createdAt: 'desc' }
    })
}

export async function findUserTasks(userId) {
    // Find projects where user is PROJECT_ADMIN
    const adminMemberships = await prisma.projectMember.findMany({
        where: { userId: Number(userId), role: 'PROJECT_ADMIN' },
        select: { projectId: true }
    })
    const adminProjectIds = adminMemberships.map(m => m.projectId)

    return prisma.task.findMany({
        where: {
            deletedAt: null,
            OR: [
                { assigneeId: Number(userId) },
                { projectId: { in: adminProjectIds } }
            ]
        },
        include: {
            assignee: { select: { id: true, name: true, email: true, avatar: true } },
            creator: { select: { id: true, name: true } },
            project: { select: { id: true, name: true } }
        },
        orderBy: { createdAt: 'desc' }
    })
}

export async function updateTaskById(id, data) {
    if (!data || Object.keys(data).length === 0) return
    // Convert deadline string to Date if provided
    if (data.deadline) data.deadline = new Date(data.deadline)
    if (data.assigneeId) data.assigneeId = Number(data.assigneeId)
    return prisma.task.update({
        where: { id: Number(id) },
        data
    })
}

export async function softDeleteTask(id) {
    return prisma.task.update({
        where: { id: Number(id) },
        data: { deletedAt: new Date() }
    })
}

export async function getTaskStatsByProject(projectId) {
    const [total, todo, inProgress, done, overdue, priorityCounts] = await Promise.all([
        prisma.task.count({ where: { projectId: Number(projectId), deletedAt: null } }),
        prisma.task.count({ where: { projectId: Number(projectId), deletedAt: null, status: 'TODO' } }),
        prisma.task.count({ where: { projectId: Number(projectId), deletedAt: null, status: 'IN_PROGRESS' } }),
        prisma.task.count({ where: { projectId: Number(projectId), deletedAt: null, status: 'DONE' } }),
        prisma.task.count({
            where: {
                projectId: Number(projectId), deletedAt: null,
                status: { not: 'DONE' },
                deadline: { lt: new Date() }
            }
        }),
        prisma.task.groupBy({
            by: ['priority'],
            where: { projectId: Number(projectId), deletedAt: null },
            _count: true
        })
    ])

    const priorities = { LOW: 0, MEDIUM: 0, HIGH: 0, URGENT: 0 }
    for (const p of priorityCounts) priorities[p.priority] = p._count

    return { total, todo, in_progress: inProgress, done, overdue, ...priorities }
}

export async function getUpcomingDeadlines(projectId, days = 7) {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() + days)

    return prisma.task.findMany({
        where: {
            projectId: Number(projectId),
            deletedAt: null,
            status: { not: 'DONE' },
            deadline: { gte: new Date(), lte: cutoff }
        },
        include: {
            assignee: { select: { id: true, name: true, avatar: true } }
        },
        orderBy: { deadline: 'asc' },
        take: 10
    })
}
