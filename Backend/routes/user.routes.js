import { Router } from 'express'
import {
    getMeController,
    updateMeController,
    listUsersController,
    softDeleteUserController,
    updateUserRoleController
} from '../controllers/user.controller.js'
import auth from '../middleware/auth.js'
import authorize from '../middleware/authorize.js'

const userRouter = Router()

userRouter.get('/me', auth, getMeController)
userRouter.put('/update', auth, updateMeController)
userRouter.get('/list', auth, authorize('SUPER_ADMIN'), listUsersController)
userRouter.delete('/:id', auth, authorize('SUPER_ADMIN'), softDeleteUserController)
userRouter.put('/:id/role', auth, authorize('SUPER_ADMIN'), updateUserRoleController)

export default userRouter
