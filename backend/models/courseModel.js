const mongoose = require("mongoose");

const courseSchema = mongoose.Schema({
  courseName: String,
  courseImage: String,
  modules: [
    {
      title: String,
      description: String,
      video: String,
    },
  ],
});

const Course = mongoose.model("Course", courseSchema);

module.exports = Course;
