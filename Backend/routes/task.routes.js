import { Router } from 'express'
import {
    createTaskController,
    getTasksController,
    getUserTasksController,
    getTaskDetailController,
    updateTaskController,
    deleteTaskController
} from '../controllers/task.controller.js'
import auth from '../middleware/auth.js'

const taskRouter = Router()

taskRouter.post('/create', auth, createTaskController)
taskRouter.get('/list', auth, getUserTasksController)
taskRouter.get('/list/:projectId', auth, getTasksController)
taskRouter.get('/:id', auth, getTaskDetailController)
taskRouter.put('/:id', auth, updateTaskController)
taskRouter.delete('/:id', auth, deleteTaskController)

export default taskRouter
