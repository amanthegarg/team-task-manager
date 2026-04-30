import { Router } from 'express'
import { authenticate } from '../middleware/authenticate.js'
import { authorize } from '../middleware/authorize.js'
import { getUsers } from '../controllers/userController.js'

const router = Router()

router.use(authenticate)
router.get('/', authorize('ADMIN'), getUsers)

export default router
