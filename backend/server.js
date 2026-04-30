require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./Database/db");
const errorHandler = require("./Middleware/errorHandler");

const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const taskRoutes = require("./routes/taskRoutes");

const app = express();

connectDB();

app.use(cors({ origin: "http://localhost:5173" }));
// app.use(cors({ origin: "https://strong-kelpie-cd86b8.netlify.app" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/auth", authRoutes);
app.use("/projects", projectRoutes);
app.use("/projects/:projectId/tasks", taskRoutes);
app.use("/tasks", taskRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`,
  );
});
