const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Project = require('../models/Project');
const { protect } = require('../middleware/auth');

// Get tasks for a specific project
router.get('/project/:projectId', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const isMember = project.owner.equals(req.user._id) || project.members.some(m => m.user.equals(req.user._id));
    if (!isMember) return res.status(403).json({ message: 'Not authorized' });

    const tasks = await Task.find({ project: req.params.projectId }).populate('assignee', 'name email');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all tasks assigned to me
router.get('/my-tasks', protect, async (req, res) => {
  try {
    const tasks = await Task.find({ assignee: req.user._id }).populate('project', 'name');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { title, description, dueDate, project, assignee } = req.body;
    
    const proj = await Project.findById(project);
    if (!proj) return res.status(404).json({ message: 'Project not found' });

    const isMember = proj.owner.equals(req.user._id) || proj.members.some(m => m.user.equals(req.user._id));
    if (!isMember) return res.status(403).json({ message: 'Not authorized' });

    const task = await Task.create({
      title,
      description,
      dueDate,
      project,
      assignee,
      status: 'To Do'
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const proj = await Project.findById(task.project);
    const isMember = proj.owner.equals(req.user._id) || proj.members.some(m => m.user.equals(req.user._id));
    if (!isMember) return res.status(403).json({ message: 'Not authorized' });

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('assignee', 'name email');

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const proj = await Project.findById(task.project);
    const memberRecord = proj.members.find(m => m.user.equals(req.user._id));
    const isAdmin = proj.owner.equals(req.user._id) || (memberRecord && memberRecord.role === 'Admin');

    if (!isAdmin) return res.status(403).json({ message: 'Only Admins can delete tasks' });

    await task.deleteOne();
    res.json({ message: 'Task removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
