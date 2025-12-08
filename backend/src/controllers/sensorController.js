import * as sensorService from '../services/sensorService.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * Receive sensor data from ESP32
 */
export const submitSensorData = asyncHandler(async (req, res) => {
    const reading = await sensorService.saveSensorReading(req.body);
    successResponse(res, reading, 'Sensor data saved successfully', 201);
});

/**
 * Get latest reading for a device
 */
export const getLatestReading = asyncHandler(async (req, res) => {
    const { deviceId } = req.params;
    const { sensor_type } = req.query;

    const reading = await sensorService.getLatestReading(deviceId, sensor_type);

    if (!reading) {
        return errorResponse(res, 'No readings found for this device', 404);
    }

    successResponse(res, reading, 'Latest reading retrieved successfully');
});

/**
 * Get all latest readings for a device (one per sensor type)
 */
export const getAllLatestReadings = asyncHandler(async (req, res) => {
    const { deviceId } = req.params;

    const readings = await sensorService.getAllLatestReadings(deviceId);

    successResponse(res, readings, 'Latest readings retrieved successfully');
});

/**
 * Get historical readings
 */
export const getHistory = asyncHandler(async (req, res) => {
    const { deviceId } = req.params;
    const options = {
        limit: parseInt(req.query.limit) || 100,
        offset: parseInt(req.query.offset) || 0,
        start_date: req.query.start_date,
        end_date: req.query.end_date,
        sensor_type: req.query.sensor_type
    };

    const result = await sensorService.getHistoricalReadings(deviceId, options);

    paginatedResponse(
        res,
        result.data,
        result.pagination,
        'Historical data retrieved successfully'
    );
});

/**
 * Get device statistics
 */
export const getStatistics = asyncHandler(async (req, res) => {
    const { deviceId } = req.params;
    const { sensor_type, hours = 24 } = req.query;

    if (!sensor_type) {
        return errorResponse(res, 'sensor_type query parameter required', 400);
    }

    const stats = await sensorService.getDeviceStatistics(deviceId, sensor_type, hours);

    successResponse(res, stats, 'Statistics retrieved successfully');
});
