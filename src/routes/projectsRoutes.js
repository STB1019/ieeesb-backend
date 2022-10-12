const { Router } = require('express')
const projectsController = require('../controllers/projectsController')
const multer = require('multer')

const router = Router()

const upload = multer({
  storage: multer.memoryStorage()
})

router.delete('/projects/:id', projectsController.deleteProject)

router.get('/projects', projectsController.getProjects)
router.get('/projects/:id', projectsController.getProjectById)

router.post(
  '/projects',
  upload.single('thumbnail'),
  projectsController.postProject
)

router.patch(
  '/projects',
  upload.single('thumbnail'),
  projectsController.patchProject
)

module.exports = router
