const fs = require("fs");
const path = require("path");
const multer = require("multer");
const Course = require("../models/courseModel");

// Function to ensure directories exist
const ensureDirectoryExists = (directory) => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { courseName } = req.body;
    let modules = [];

    console.log("Request Body in Destination:", req.body); // Debugging statement

    if (req.body.modules) {
      try {
        modules = JSON.parse(req.body.modules);
      } catch (err) {
        console.error("Error parsing modules:", err);
        return cb(new Error("Invalid modules data"));
      }
    }

    if (file.fieldname === "courseImage") {
      const courseImagePath = path.join(
        __dirname,
        `../uploads/${courseName}/image`
      );
      ensureDirectoryExists(courseImagePath);
      console.log("Course Image Path:", courseImagePath); // Debugging statement
      cb(null, courseImagePath);
    } else if (file.fieldname.startsWith("modules")) {
      const moduleIndex = file.fieldname.match(/\[(\d+)\]/)[1];
      const moduleTitle = modules[moduleIndex]?.title || "untitled";
      const moduleVideoPath = path.join(
        __dirname,
        `../uploads/${courseName}/${moduleTitle}/video`
      );
      ensureDirectoryExists(moduleVideoPath);
      console.log("Module Video Path:", moduleVideoPath); // Debugging statement
      cb(null, moduleVideoPath);
    }
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Use upload.any() to accept any field name
const uploadFiles = upload.any();

const createCourse = async (req, res) => {
  uploadFiles(req, res, async (err) => {
    if (err) {
      console.error("Multer Error:", err);
      return res
        .status(500)
        .json({ message: "Error during file upload", error: err.message });
    }

    console.log("Request Body:", req.body); // Debugging statement
    console.log("Request Files:", req.files); // Debugging statement

    const { courseName } = req.body;

    // Parse the modules from req.body
    let modulesArray = [];
    if (req.body.modules) {
      try {
        modulesArray = JSON.parse(req.body.modules);
      } catch (err) {
        console.error("Error parsing modules:", err);
        return res.status(400).json({ message: "Invalid modules data" });
      }
    }

    console.log("Parsed Modules Array:", modulesArray);

    if (!Array.isArray(modulesArray)) {
      return res.status(400).json({ message: "Modules must be an array" });
    }

    // Get the uploaded course image path
    const courseImage = req.files.find(
      (file) => file.fieldname === "courseImage"
    )?.path;

    // Process the module videos and update with the uploaded video paths
    const modulesData = modulesArray.map((module, index) => {
      const videoFile = req.files.find(
        (file) => file.fieldname === `modules[${index}][video]`
      );
      return {
        title: module.title,
        description: module.description,
        video: videoFile ? videoFile.path : null,
      };
    });
    
    try {
      const newCourse = new Course({
        courseName,
        courseImage,
        modules: modulesData,
      });

      await newCourse.save();
      res
        .status(201)
        .json({ message: "Course created successfully", course: newCourse });
    } catch (err) {
      console.error("Database Error:", err);
      res
        .status(500)
        .json({ message: "Error creating course", error: err.message });
    }
  });
};

// Get all courses
const getCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    res
      .status(200)
      .json({ message: "Courses retrieved successfully", courses });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error retrieving courses", error: err.message });
  }
};

// Get a single course by ID
const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.status(200).json({ message: "Course retrieved successfully", course });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error retrieving course", error: err.message });
  }
};

// Update a course by ID
const updateCourse = async (req, res) => {
  try {
    const { courseName, modules } = req.body;

    // Find the course by ID
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Update course fields
    course.courseName = courseName || course.courseName;
    course.modules = modules || course.modules;

    // Save the updated course
    await course.save();
    res.status(200).json({ message: "Course updated successfully", course });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating course", error: err.message });
  }
};

// Delete a course by ID
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.status(200).json({ message: "Course deleted successfully", course });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting course", error: err.message });
  }
};

module.exports = {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
};
