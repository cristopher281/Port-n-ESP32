import express from 'express';
import * as sensorController from '../controllers/sensorController.js';
import { authenticateToken, verifyDeviceToken } from '../middleware/auth.js';
import { validateSensorData, validateDeviceId, validateHistoryQuery } from '../middleware/validate.js';

const router = express.Router();

/**
 * @route   POST /api/sensors/data
 * @desc    Submit sensor reading from ESP32
 * @access  Private (requires device token)
 */
router.post(
    '/data',
    authenticateToken,
    verifyDeviceToken,
    validateSensorData,
    sensorController.submitSensorData
);

/**
 * @route   GET /api/sensors/latest/:deviceId
 * @desc    Get latest reading for a device
 * @access  Public
 */
router.get(
    '/latest/:deviceId',
    validateDeviceId,
    sensorController.getLatestReading
);

/**
 * @route   GET /api/sensors/all-latest/:deviceId
 * @desc    Get all latest readings for a device (one per sensor type)
 * @access  Public
 */
router.get(
    '/all-latest/:deviceId',
    validateDeviceId,
    sensorController.getAllLatestReadings
);

/**
 * @route   GET /api/sensors/history/:deviceId
 * @desc    Get historical readings
 * @access  Public
 */
router.get(
    '/history/:deviceId',
    validateDeviceId,
    validateHistoryQuery,
    sensorController.getHistory
);

/**
 * @route   GET /api/sensors/stats/:deviceId
 * @desc    Get device statistics
 * @access  Public
 */
router.get(
    '/stats/:deviceId',
    validateDeviceId,
    sensorController.getStatistics
);

export default router;
