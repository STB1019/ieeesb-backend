const { Router } = require('express')
const projectsController = require('../controllers/projectsController')
const authMiddleware = require('../middleware/authMiddleware')
const multer = require('multer')

const router = Router()

const upload = multer({
  storage: multer.memoryStorage()
})

router.delete(
  '/projects/:id',
  authMiddleware.requireAuth,
  projectsController.deleteProject
)

router.get('/projects', projectsController.getProjects)
router.get('/projects/:id', projectsController.getProjectById)

router.post(
  '/projects',
  authMiddleware.requireAuth,
  upload.single('thumbnail'),
  projectsController.postProject
)

router.patch(
  '/projects',
  authMiddleware.requireAuth,
  upload.single('thumbnail'),
  projectsController.patchProject
)

module.exports = router
