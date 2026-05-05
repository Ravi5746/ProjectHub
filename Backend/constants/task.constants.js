export const TASK_STATUS = {
    TODO: 'TODO',
    IN_PROGRESS: 'IN_PROGRESS',
    DONE: 'DONE'
}

export const TASK_PRIORITY = {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    URGENT: 'URGENT'
}

// Valid status transitions — enforced in task controller
export const ALLOWED_TRANSITIONS = {
    TODO: ['IN_PROGRESS', 'DONE'],
    IN_PROGRESS: ['TODO', 'DONE'],
    DONE: ['IN_PROGRESS']  // only ADMIN / SUPER_ADMIN can do this
}

// Roles that can reopen a DONE task
export const REOPEN_ALLOWED_ROLES = ['SUPER_ADMIN', 'PROJECT_ADMIN']
