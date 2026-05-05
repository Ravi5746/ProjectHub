import { Router } from 'express'
import {
    createProjectController,
    getProjectsController,
    getProjectDetailController,
    updateProjectController,
    deleteProjectController,
    addMemberController,
    removeMemberController
} from '../controllers/project.controller.js'
import auth from '../middleware/auth.js'

const projectRouter = Router()

projectRouter.post('/create', auth, createProjectController)
projectRouter.get('/list', auth, getProjectsController)
projectRouter.get('/:id', auth, getProjectDetailController)
projectRouter.put('/:id', auth, updateProjectController)
projectRouter.delete('/:id', auth, deleteProjectController)
projectRouter.post('/:id/members', auth, addMemberController)
projectRouter.delete('/:id/members/:userId', auth, removeMemberController)

export default projectRouter
