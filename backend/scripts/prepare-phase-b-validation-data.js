#!/usr/bin/env node
/**
 * One-off helper: inspect DB and create actionable assigned exercises for Parent Web Phase B validation.
 * Does not modify seed files or existing submissions.
 *
 * Usage: node backend/scripts/prepare-phase-b-validation-data.js [--create]
 */
const path = require("path");
const { Pool } = require("pg");

require("dotenv").config({ path: path.join(__dirname, "../.env") });

const PARENT_EMAIL = "fatima.parent@test.com";
const SPECIALIST_EMAIL = "bana.specialist@test.com";
const CHILD_NAME = "Omar Hassan";
const API_BASE = process.env.API_BASE || "http://127.0.0.1:5000/api/v1";

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function login(email, password) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.message || `Login failed for ${email}`);
  }
  return payload.data;
}

async function createAssignment(token, body) {
  const response = await fetch(`${API_BASE}/assigned-exercises`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  const payload = await response.json();
  return { status: response.status, payload };
}

function todayDateOnly() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDaysDateOnly(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

async function inspect() {
  const parentResult = await pool.query(
    "SELECT id, email FROM users WHERE email = $1",
    [PARENT_EMAIL],
  );
  const parent = parentResult.rows[0];
  if (!parent) {
    throw new Error(`Parent not found: ${PARENT_EMAIL}`);
  }

  const childrenResult = await pool.query(
    `SELECT p.id, p.full_name
     FROM patients p
     JOIN patient_guardians pg ON pg.patient_id = p.id
     WHERE pg.parent_id = $1
     ORDER BY p.full_name`,
    [parent.id],
  );

  const child = childrenResult.rows.find((row) => row.full_name === CHILD_NAME)
    || childrenResult.rows[0];

  if (!child) {
    throw new Error("No linked child found for parent.");
  }

  const plansResult = await pool.query(
    `SELECT id, status, title, patient_id
     FROM treatment_plans
     WHERE patient_id = $1
     ORDER BY created_at DESC`,
    [child.id],
  );

  const activePlan = plansResult.rows.find((row) => row.status === "active")
    || plansResult.rows[0];

  const assignedResult = await pool.query(
    `SELECT ae.id, ae.exercise_id, ae.frequency, ae.start_date, ae.due_date,
            e.title AS exercise_title
     FROM assigned_exercises ae
     JOIN exercises e ON ae.exercise_id = e.id
     WHERE ae.patient_id = $1 AND ae.is_active = true`,
    [child.id],
  );

  const submissionResult = await pool.query(
    `SELECT es.assigned_exercise_id, es.status
     FROM exercise_submissions es
     JOIN assigned_exercises ae ON ae.id = es.assigned_exercise_id
     WHERE ae.patient_id = $1`,
    [child.id],
  );

  const submittedAssignmentIds = new Set(
    submissionResult.rows.map((row) => row.assigned_exercise_id),
  );

  const exercisesResult = await pool.query(
    `SELECT id, title, instructions, instruction_media_url
     FROM exercises
     ORDER BY title`,
  );

  const assignedExerciseIds = new Set(assignedResult.rows.map((row) => row.exercise_id));

  const candidateExercises = exercisesResult.rows.filter((exercise) => {
    if (!exercise.instructions || !String(exercise.instructions).trim()) {
      return false;
    }
    return !assignedExerciseIds.has(exercise.id);
  });

  return {
    parent,
    child,
    activePlan,
    plans: plansResult.rows,
    assigned: assignedResult.rows,
    submittedAssignmentIds,
    candidateExercises,
    exercisesWithMedia: exercisesResult.rows.filter((row) => row.instruction_media_url),
  };
}

async function main() {
  const shouldCreate = process.argv.includes("--create");
  const info = await inspect();

  console.log(JSON.stringify({
    parentAccount: info.parent.email,
    parentUserId: info.parent.id,
    childName: info.child.full_name,
    childPatientId: info.child.id,
    activePlan: info.activePlan,
    assignedCount: info.assigned.length,
    submittedAssignmentCount: info.submittedAssignmentIds.size,
    candidateExerciseCount: info.candidateExercises.length,
    topCandidates: info.candidateExercises.slice(0, 5).map((row) => ({
      exercise_id: row.id,
      title: row.title,
      hasInstructionMedia: Boolean(row.instruction_media_url),
    })),
  }, null, 2));

  if (!shouldCreate) {
    console.log("\nDry run only. Re-run with --create to POST assignments via specialist API.");
    await pool.end();
    return;
  }

  if (!info.activePlan) {
    throw new Error("No treatment plan found for child.");
  }

  const specialistSession = await login(SPECIALIST_EMAIL, "Test123456!");
  const today = todayDateOnly();
  const dueDate = addDaysDateOnly(14);
  const created = [];

  const notesExercise = info.candidateExercises[0];
  if (!notesExercise) {
    throw new Error("No unused exercise with instructions found.");
  }

  const notesAssignmentBody = {
    exercise_id: notesExercise.id,
    plan_id: info.activePlan.id,
    patient_id: info.child.id,
    frequency: "daily",
    start_date: today,
    due_date: dueDate,
  };

  const notesResult = await createAssignment(
    specialistSession.accessToken,
    notesAssignmentBody,
  );

  if (notesResult.status !== 201) {
    throw new Error(
      `Failed to create notes-test assignment: ${notesResult.status} ${notesResult.payload.message}`,
    );
  }

  created.push({
    purpose: "notes-only submission test",
    assigned_exercise_id: notesResult.payload.data.id,
    exercise_id: notesExercise.id,
    plan_id: info.activePlan.id,
    request: notesAssignmentBody,
    response: notesResult.payload.data,
  });

  const mediaExercise = info.exercisesWithMedia.find(
    (row) => row.id !== notesExercise.id
      && !info.assigned.some((assignment) => assignment.exercise_id === row.id),
  ) || info.candidateExercises.find((row) => row.id !== notesExercise.id);

  if (mediaExercise) {
    const mediaAssignmentBody = {
      exercise_id: mediaExercise.id,
      plan_id: info.activePlan.id,
      patient_id: info.child.id,
      frequency: "daily",
      start_date: today,
      due_date: addDaysDateOnly(21),
    };

    const mediaResult = await createAssignment(
      specialistSession.accessToken,
      mediaAssignmentBody,
    );

    if (mediaResult.status === 201) {
      created.push({
        purpose: "media submission tests (image/video/audio)",
        assigned_exercise_id: mediaResult.payload.data.id,
        exercise_id: mediaExercise.id,
        plan_id: info.activePlan.id,
        request: mediaAssignmentBody,
        response: mediaResult.payload.data,
      });
    }
  }

  const extraExercise = info.candidateExercises.find(
    (row) => !created.some((entry) => entry.exercise_id === row.id),
  );

  if (extraExercise) {
    const extraBody = {
      exercise_id: extraExercise.id,
      plan_id: info.activePlan.id,
      patient_id: info.child.id,
      frequency: "daily",
      start_date: today,
      due_date: addDaysDateOnly(28),
    };

    const extraResult = await createAssignment(
      specialistSession.accessToken,
      extraBody,
    );

    if (extraResult.status === 201) {
      created.push({
        purpose: "additional media/validation reserve",
        assigned_exercise_id: extraResult.payload.data.id,
        exercise_id: extraExercise.id,
        plan_id: info.activePlan.id,
        request: extraBody,
        response: extraResult.payload.data,
      });
    }
  }

  console.log("\nCreated assignments:");
  console.log(JSON.stringify(created, null, 2));
  await pool.end();
}

main().catch(async (error) => {
  console.error("FAILED:", error.message);
  await pool.end();
  process.exit(1);
});
