import { Router } from 'express'
import { getDashboardController, getGlobalDashboardController } from '../controllers/dashboard.controller.js'
import auth from '../middleware/auth.js'

const dashboardRouter = Router()

dashboardRouter.get('/', auth, getGlobalDashboardController)
dashboardRouter.get('/:projectId', auth, getDashboardController)

export default dashboardRouter
