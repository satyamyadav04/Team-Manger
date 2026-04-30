const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  updateMemberRole,
} = require('../controllers/projectController');
const { protect } = require('../Middleware/auth');

router.use(protect);

router.route('/')
  .get(getProjects)
  .post(
    [body('name').trim().notEmpty().withMessage('Project name is required')],
    createProject
  );

router.route('/:id')
  .get(getProject)
  .patch(updateProject)
  .delete(deleteProject);

router.post('/:id/members', addMember);
router.delete('/:id/members/:userId', removeMember);
router.patch('/:id/members/:userId', updateMemberRole);

module.exports = router;
