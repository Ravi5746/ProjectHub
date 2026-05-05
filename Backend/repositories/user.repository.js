import { prisma } from '../config/connectDB.js'

export async function findUserByEmail(email) {
    return prisma.user.findFirst({
        where: { email, deletedAt: null }
    })
}

export async function findUserById(id) {
    return prisma.user.findFirst({
        where: { id: Number(id), deletedAt: null }
    })
}

export async function createUser({ name, email, password, role = 'MEMBER', status = 'UNVERIFIED', verifyEmailExpiry = null }) {
    return prisma.user.create({
        data: { name, email, password, role, status, verifyEmailExpiry },
        select: { id: true, name: true, email: true, role: true, status: true }
    })
}

export async function updateUserById(id, data) {
    if (!data || Object.keys(data).length === 0) return
    return prisma.user.update({
        where: { id: Number(id) },
        data
    })
}

export async function findAllUsers({ limit = 50, offset = 0 } = {}) {
    return prisma.user.findMany({
        where: { deletedAt: null },
        select: {
            id: true, name: true, email: true, role: true,
            status: true, avatar: true, mobile: true,
            lastLoginDate: true, createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
    })
}

export async function softDeleteUser(id) {
    return prisma.user.update({
        where: { id: Number(id) },
        data: { deletedAt: new Date() }
    })
}
