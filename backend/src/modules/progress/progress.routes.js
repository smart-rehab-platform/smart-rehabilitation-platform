const express = require('express');
const router = express.Router();

const progressController = require('./progress.controller');
const { validateCreateProgressSnapshot } = require('./progress.validation');

router.post('/progress-snapshots', validateCreateProgressSnapshot, progressController.createSnapshot);
router.get('/progress-snapshots', progressController.getAllSnapshots);

router.get('/patients/:id/progress', progressController.getPatientProgress);
router.get('/patients/:id/progress/daily', progressController.getDailyProgress);
router.get('/patients/:id/progress/weekly', progressController.getWeeklyProgress);
router.get('/patients/:id/progress/monthly', progressController.getMonthlyProgress);

router.get('/patients/:id/improvement-percentage', progressController.getImprovementPercentage);
router.get('/patients/:id/performance-metrics', progressController.getPerformanceMetrics);

module.exports = router;