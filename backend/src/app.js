const express = require("express");
const cors = require("cors");

const usersRoutes = require("./modules/users/users.routes");
const authRoutes = require("./modules/auth/auth.routes");
const patientsRoutes = require("./modules/patients/patients.routes");
const assessmentsRoutes = require("./modules/assessments/assessments.routes");
const treatmentPlansRoutes = require("./modules/treatmentPlans/treatmentPlans.routes");
const goalsRoutes = require("./modules/goals/goals.routes");
const exercisesRoutes = require("./modules/exercises/exercises.routes");
const assignedExercisesRoutes = require("./modules/assignedExercises/assignedExercises.routes");
const exerciseSubmissionsRoutes = require("./modules/exerciseSubmissions/exerciseSubmissions.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Smart Rehab Backend API Running"
  });
});

app.use("/api/v1/users", usersRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/patients", patientsRoutes);
app.use("/api/v1/assessments", assessmentsRoutes);
app.use("/api/v1/treatment-plans", treatmentPlansRoutes);
app.use("/api/v1", goalsRoutes);
app.use("/api/v1", exercisesRoutes);
app.use("/api/v1", assignedExercisesRoutes);
app.use("/api/v1", exerciseSubmissionsRoutes);
module.exports = app;