import { Router } from 'express'
import { authenticate } from '../middleware/authenticate.js'
import { authorize } from '../middleware/authorize.js'
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from '../controllers/taskController.js'

const router = Router()

router.use(authenticate)

router.post('/', authorize('ADMIN'), createTask)
router.get('/', getTasks)
router.get('/:id', getTaskById)
router.put('/:id', updateTask)         // role-aware inside controller
router.delete('/:id', authorize('ADMIN'), deleteTask)

export default router
