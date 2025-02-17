const express = require('express');
const {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
} = require('../controllers/courseController');

const router = express.Router();

// POST - Create a new course
router.post('/create', createCourse);

// GET - Retrieve all courses
router.get('/courses', getCourses);

// GET - Retrieve a single course by ID
router.get('/courses/:id', getCourseById);

// PUT - Update a course by ID
router.put('/courses/:id', updateCourse);

// DELETE - Delete a course by ID
router.delete('/courses/:id', deleteCourse);

module.exports = router;
