import { Router } from 'express'
import { authenticate } from '../middleware/authenticate.js'
import { authorize } from '../middleware/authorize.js'
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
} from '../controllers/projectController.js'
import {
  addMember,
  removeMember,
} from '../controllers/memberController.js'

const router = Router()

router.use(authenticate)

router.post('/', authorize('ADMIN'), createProject)
router.get('/', getProjects)
router.get('/:id', getProjectById)
router.put('/:id', authorize('ADMIN'), updateProject)
router.delete('/:id', authorize('ADMIN'), deleteProject)

router.post('/:id/members', authorize('ADMIN'), addMember)
router.delete('/:id/members/:userId', authorize('ADMIN'), removeMember)

export default router
