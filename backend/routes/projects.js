const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, async (req, res) => {
    try {
      // Find projects where user is owner OR user is a member
      const projects = await Project.find({
        $or: [
          { owner: req.user._id },
          { 'members.user': req.user._id }
        ]
      }).populate('owner', 'name email').populate('members.user', 'name email');
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  })
  .post(protect, async (req, res) => {
    try {
      const { name, description } = req.body;
      const project = await Project.create({
        name,
        description,
        owner: req.user._id,
        members: [{ user: req.user._id, role: 'Admin' }]
      });
      res.status(201).json(project);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

router.route('/:id')
  .get(protect, async (req, res) => {
    try {
      const project = await Project.findById(req.params.id)
        .populate('owner', 'name email')
        .populate('members.user', 'name email');
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      const isMember = project.owner.equals(req.user._id) || project.members.some(m => m.user.equals(req.user._id));
      if (!isMember) {
        return res.status(403).json({ message: 'Not authorized to view this project' });
      }

      res.json(project);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  })
  .delete(protect, async (req, res) => {
    try {
      const project = await Project.findById(req.params.id);
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      // Only owner can delete project
      if (!project.owner.equals(req.user._id)) {
        return res.status(403).json({ message: 'Not authorized to delete this project' });
      }

      await project.deleteOne();
      res.json({ message: 'Project removed' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

// Add member to project
router.post('/:id/members', protect, async (req, res) => {
  try {
    const { email, role } = req.body;
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is Admin
    const memberRecord = project.members.find(m => m.user.equals(req.user._id));
    const isAdmin = project.owner.equals(req.user._id) || (memberRecord && memberRecord.role === 'Admin');

    if (!isAdmin) {
      return res.status(403).json({ message: 'Not authorized to add members' });
    }

    const User = require('../models/User');
    const userToAdd = await User.findOne({ email });

    if (!userToAdd) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (project.members.some(m => m.user.equals(userToAdd._id))) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    project.members.push({ user: userToAdd._id, role: role || 'Member' });
    await project.save();

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
