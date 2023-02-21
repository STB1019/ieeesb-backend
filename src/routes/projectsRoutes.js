const { Router } = require('express')
const projectsController = require('../controllers/projectsController')
const requireAuth = require('../middlewares/authMiddleware')
const multer = require('multer')

const router = Router()

const upload = multer({
  storage: multer.memoryStorage()
})

router.delete('/projects/:id', requireAuth, projectsController.deleteProject)

router.get('/projects', requireAuth, projectsController.getProjects)
router.get('/projects/:id', requireAuth, projectsController.getProjectById)

router.post(
  '/projects',
  requireAuth,
  upload.single('thumbnail'),
  projectsController.postProject
)

router.patch(
  '/projects',
  requireAuth,
  upload.single('thumbnail'),
  projectsController.patchProject
)

module.exports = router
