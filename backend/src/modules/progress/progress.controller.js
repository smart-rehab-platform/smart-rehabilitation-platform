const progressService = require('./progress.service');
const treatmentJourneyService = require('./treatmentJourney.service');

const createSnapshot = async (req, res) => {
  try {
    const snapshot = await progressService.createSnapshot(req.body);

    res.status(201).json({
      success: true,
      message: 'Progress snapshot created successfully',
      data: snapshot
    });
  } catch (error) {
    console.error('Create progress snapshot error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create progress snapshot'
    });
  }
};

const getAllSnapshots = async (req, res) => {
  try {
    const snapshots = await progressService.getAllSnapshots();

    res.status(200).json({
      success: true,
      count: snapshots.length,
      data: snapshots
    });
  } catch (error) {
    console.error('Get progress snapshots error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get progress snapshots'
    });
  }
};

const getPatientProgress = async (req, res) => {
  try {
    const progress = await progressService.getPatientProgress(req.params.id);

    res.status(200).json({
      success: true,
      count: progress.length,
      data: progress
    });
  } catch (error) {
    console.error('Get patient progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get patient progress'
    });
  }
};

const getDailyProgress = async (req, res) => {
  try {
    const progress = await progressService.getPatientProgressByPeriod(req.params.id, 'daily');

    res.status(200).json({
      success: true,
      count: progress.length,
      data: progress
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get daily progress'
    });
  }
};

const getWeeklyProgress = async (req, res) => {
  try {
    const progress = await progressService.getPatientProgressByPeriod(req.params.id, 'weekly');

    res.status(200).json({
      success: true,
      count: progress.length,
      data: progress
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get weekly progress'
    });
  }
};

const getMonthlyProgress = async (req, res) => {
  try {
    const progress = await progressService.getPatientProgressByPeriod(req.params.id, 'monthly');

    res.status(200).json({
      success: true,
      count: progress.length,
      data: progress
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get monthly progress'
    });
  }
};

const getImprovementPercentage = async (req, res) => {
  try {
    const improvement = await progressService.getImprovementPercentage(req.params.id);

    res.status(200).json({
      success: true,
      data: improvement
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get improvement percentage'
    });
  }
};

const getPerformanceMetrics = async (req, res) => {
  try {
    const metrics = await progressService.getPerformanceMetrics(req.params.id);

    res.status(200).json({
      success: true,
      data: metrics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get performance metrics'
    });
  }
};

const getTreatmentJourney = async (req, res) => {
  try {
    const journey = await treatmentJourneyService.getTreatmentJourney(
      req.params.id,
      req.query.period
    );

    if (!journey) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.status(200).json({
      success: true,
      data: journey
    });
  } catch (error) {
    console.error('Get treatment journey error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get treatment journey'
    });
  }
};

module.exports = {
  createSnapshot,
  getAllSnapshots,
  getPatientProgress,
  getDailyProgress,
  getWeeklyProgress,
  getMonthlyProgress,
  getImprovementPercentage,
  getPerformanceMetrics,
  getTreatmentJourney
};