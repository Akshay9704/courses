const express = require("express");
const mongoose = require("mongoose");
const createCourse = require("./routes/courseRoutes");
const app = express();

// MongoDB connection setup
const mongoURI = 'mongodb+srv://akshay:akshay@cluster0.locqv.mongodb.net/';
mongoose.connect(mongoURI)  // Removed the deprecated options
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

// Basic route
app.get("/", (req, res) => {
  res.send("Hello, Node.js Server!");
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/course", createCourse);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
