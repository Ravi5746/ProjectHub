import { prisma } from '../config/connectDB.js'

export async function createProject({ name, description, createdBy }) {
    return prisma.project.create({
        data: { name, description, createdBy }
    })
}

export async function findProjectById(id) {
    return prisma.project.findFirst({
        where: { id: Number(id), deletedAt: null },
        include: {
            creator: { select: { id: true, name: true, email: true } }
        }
    })
}

export async function findProjectsByUserId(userId) {
    return prisma.project.findMany({
        where: {
            deletedAt: null,
            OR: [
                { createdBy: Number(userId) },
                { members: { some: { userId: Number(userId) } } }
            ]
        },
        include: {
            creator: { select: { id: true, name: true } },
            _count: { select: { tasks: { where: { deletedAt: null } }, members: true } }
        },
        orderBy: { createdAt: 'desc' }
    })
}

export async function updateProjectById(id, data) {
    if (!data || Object.keys(data).length === 0) return
    return prisma.project.update({
        where: { id: Number(id) },
        data
    })
}

export async function softDeleteProject(id) {
    return prisma.project.update({
        where: { id: Number(id) },
        data: { deletedAt: new Date() }
    })
}
