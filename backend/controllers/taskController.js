const { validationResult } = require('express-validator');
const Project = require('../models/Project');
const Task = require('../models/Task');

const isProjectMember = (project, userId) =>
  project.owner.toString() === userId.toString() ||
  project.members.some((member) => member.user.toString() === userId.toString());

const isProjectAdmin = (project, userId) =>
  project.owner.toString() === userId.toString() ||
  project.members.some(
    (member) => member.user.toString() === userId.toString() && member.role === 'admin'
  );

const ensureProjectAccess = async (projectId, userId) => {
  const project = await Project.findById(projectId).populate('members.user', 'name email avatar');
  if (!project) {
    return { error: { status: 404, message: 'Project not found.' } };
  }

  if (!isProjectMember(project, userId)) {
    return { error: { status: 403, message: 'Access denied.' } };
  }

  return { project };
};

const ensureTaskAccess = async (taskId, userId) => {
  const task = await Task.findById(taskId)
    .populate('assignee', 'name email avatar')
    .populate('createdBy', 'name email avatar')
    .populate('project', 'name color owner members');

  if (!task) {
    return { error: { status: 404, message: 'Task not found.' } };
  }

  const project = await Project.findById(task.project._id);
  if (!project) {
    return { error: { status: 404, message: 'Project not found.' } };
  }

  if (!isProjectMember(project, userId)) {
    return { error: { status: 403, message: 'Access denied.' } };
  }

  return { task, project };
};

const populateTask = (query) =>
  query
    .populate('assignee', 'name email avatar')
    .populate('createdBy', 'name email avatar')
    .populate('project', 'name color');

exports.getProjectTasks = async (req, res, next) => {
  try {
    const access = await ensureProjectAccess(req.params.projectId, req.user._id);
    if (access.error) {
      return res.status(access.error.status).json({ success: false, message: access.error.message });
    }

    const tasks = await populateTask(
      Task.find({ project: req.params.projectId }).sort({ createdAt: -1 })
    );

    res.json({ success: true, data: tasks });
  } catch (error) {
    next(error);
  }
};

exports.getMyTasks = async (req, res, next) => {
  try {
    const tasks = await populateTask(
      Task.find({ assignee: req.user._id }).sort({ dueDate: 1, createdAt: -1 })
    );

    res.json({ success: true, data: tasks });
  } catch (error) {
    next(error);
  }
};

exports.getDashboardStats = async (req, res, next) => {
  try {
    const projects = await Project.find({
      $or: [{ owner: req.user._id }, { 'members.user': req.user._id }],
    }).select('_id');

    const projectIds = projects.map((project) => project._id);
    const tasks = await populateTask(
      Task.find({ project: { $in: projectIds } }).sort({ updatedAt: -1, createdAt: -1 })
    );

    const stats = tasks.reduce(
      (acc, task) => {
        acc.total += 1;
        if (task.status === 'todo') acc.todo += 1;
        if (task.status === 'in-progress') acc.inProgress += 1;
        if (task.status === 'review') acc.review += 1;
        if (task.status === 'done') acc.done += 1;
        if (task.isOverdue) acc.overdue += 1;
        return acc;
      },
      { total: 0, todo: 0, inProgress: 0, review: 0, done: 0, overdue: 0 }
    );

    res.json({
      success: true,
      data: {
        stats,
        projects: projects.length,
        recentTasks: tasks.slice(0, 8),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.createTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const access = await ensureProjectAccess(req.params.projectId, req.user._id);
    if (access.error) {
      return res.status(access.error.status).json({ success: false, message: access.error.message });
    }

    const { title, description, assignee, status, priority, dueDate, tags = [] } = req.body;

    if (assignee) {
      const assigneeIsMember =
        access.project.owner.toString() === assignee ||
        access.project.members.some((member) => member.user._id.toString() === assignee);
      if (!assigneeIsMember) {
        return res.status(400).json({ success: false, message: 'Assignee must be a project member.' });
      }
    }

    const task = await Task.create({
      title,
      description,
      project: req.params.projectId,
      assignee: assignee || null,
      createdBy: req.user._id,
      status,
      priority,
      dueDate: dueDate || null,
      tags: Array.isArray(tags)
        ? tags.filter(Boolean)
        : String(tags)
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean),
    });

    const populatedTask = await populateTask(Task.findById(task._id));
    res.status(201).json({ success: true, data: populatedTask });
  } catch (error) {
    next(error);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    const access = await ensureTaskAccess(req.params.id, req.user._id);
    if (access.error) {
      return res.status(access.error.status).json({ success: false, message: access.error.message });
    }

    const { task, project } = access;
    const userId = req.user._id.toString();
    const admin = isProjectAdmin(project, req.user._id);
    const isCreator = task.createdBy?._id?.toString() === userId || task.createdBy?.toString?.() === userId;
    const isAssignee = task.assignee?._id?.toString() === userId || task.assignee?.toString?.() === userId;

    if (!admin && !isCreator && !isAssignee) {
      return res.status(403).json({ success: false, message: 'You do not have permission to update this task.' });
    }

    const allowedFields = admin || isCreator
      ? ['title', 'description', 'assignee', 'status', 'priority', 'dueDate', 'tags']
      : ['status'];

    if (req.body.assignee) {
      const assigneeId = req.body.assignee.toString();
      const assigneeIsMember =
        project.owner.toString() === assigneeId ||
        project.members.some((member) => member.user.toString() === assigneeId);
      if (!assigneeIsMember) {
        return res.status(400).json({ success: false, message: 'Assignee must be a project member.' });
      }
    }

    allowedFields.forEach((field) => {
      if (req.body[field] === undefined) {
        return;
      }

      if (field === 'tags') {
        task.tags = Array.isArray(req.body.tags)
          ? req.body.tags.filter(Boolean)
          : String(req.body.tags)
              .split(',')
              .map((tag) => tag.trim())
              .filter(Boolean);
        return;
      }

      task[field] = req.body[field];
    });

    await task.save();
    const populatedTask = await populateTask(Task.findById(task._id));
    res.json({ success: true, data: populatedTask });
  } catch (error) {
    next(error);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const access = await ensureTaskAccess(req.params.id, req.user._id);
    if (access.error) {
      return res.status(access.error.status).json({ success: false, message: access.error.message });
    }

    const { task, project } = access;
    const userId = req.user._id.toString();
    const admin = isProjectAdmin(project, req.user._id);
    const isCreator = task.createdBy?._id?.toString() === userId || task.createdBy?.toString?.() === userId;

    if (!admin && !isCreator) {
      return res.status(403).json({ success: false, message: 'You do not have permission to delete this task.' });
    }

    await task.deleteOne();
    res.json({ success: true, message: 'Task deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

exports.addComment = async (req, res, next) => {
  try {
    const access = await ensureTaskAccess(req.params.id, req.user._id);
    if (access.error) {
      return res.status(access.error.status).json({ success: false, message: access.error.message });
    }

    const text = String(req.body.text || '').trim();
    if (!text) {
      return res.status(400).json({ success: false, message: 'Comment text is required.' });
    }

    access.task.comments.push({ user: req.user._id, text });
    await access.task.save();
    const populatedTask = await populateTask(Task.findById(access.task._id));

    res.status(201).json({ success: true, data: populatedTask });
  } catch (error) {
    next(error);
  }
};
