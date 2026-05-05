import { prisma } from '../config/connectDB.js'

export async function createActivityLog({ projectId, userId, action, entityType = null, entityId = null, details = null }) {
    return prisma.activityLog.create({
        data: {
            projectId: Number(projectId),
            userId: Number(userId),
            action,
            entityType,
            entityId: entityId ? Number(entityId) : null,
            details
        }
    })
}

export async function findActivityByProject(projectId, { limit = 20, offset = 0 } = {}) {
    return prisma.activityLog.findMany({
        where: { projectId: Number(projectId) },
        include: {
            user: { select: { id: true, name: true, avatar: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
    })
}

export async function findRecentActivity(projectId, limit = 5) {
    return prisma.activityLog.findMany({
        where: { projectId: Number(projectId) },
        include: {
            user: { select: { id: true, name: true, avatar: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: limit
    })
}
