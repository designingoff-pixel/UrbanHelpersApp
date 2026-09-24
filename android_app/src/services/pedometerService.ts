/**
 * Backward compatibility wrapper around the real native StepCounterService.
 * All fake accelerometer estimations have been removed.
 */
export {
  startStepTracking as initializeStepTracking,
  subscribeToStepCount,
  getTodaySteps as getCurrentLiveSteps,
  getTodaySteps,
  getTotalSensorSteps,
  startStepTracking,
  stopStepTracking,
  checkStepCounterAvailability,
  getStepCounterStatus,
  getStepDailyHistory,
  getWeeklyStepTotal,
  getMonthlyStepTotal,
  getStepGoal,
  setStepGoal,
  getProgressTowardGoal,
} from "./stepCounterService";
