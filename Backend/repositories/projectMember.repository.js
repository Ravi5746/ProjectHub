import { prisma } from '../config/connectDB.js'

export async function addMember({ projectId, userId, role = 'MEMBER' }) {
    return prisma.projectMember.create({
        data: { projectId: Number(projectId), userId: Number(userId), role }
    })
}

export async function removeMember({ projectId, userId }) {
    const result = await prisma.projectMember.deleteMany({
        where: { projectId: Number(projectId), userId: Number(userId) }
    })
    return result.count
}

export async function findMember({ projectId, userId }) {
    return prisma.projectMember.findUnique({
        where: {
            projectId_userId: {
                projectId: Number(projectId),
                userId: Number(userId)
            }
        }
    })
}

export async function findMembersByProject(projectId) {
    return prisma.projectMember.findMany({
        where: {
            projectId: Number(projectId),
            user: { deletedAt: null }
        },
        include: {
            user: { select: { id: true, name: true, email: true, avatar: true, role: true } }
        },
        orderBy: { joinedAt: 'asc' }
    })
}

export async function updateMemberRole({ projectId, userId, role }) {
    return prisma.projectMember.update({
        where: {
            projectId_userId: {
                projectId: Number(projectId),
                userId: Number(userId)
            }
        },
        data: { role }
    })
}

export async function updateUserRolesInAllProjects(userId, role) {
    return prisma.projectMember.updateMany({
        where: { userId: Number(userId) },
        data: { role }
    })
}
