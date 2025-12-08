import * as deviceService from '../services/deviceService.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * Send command to device (admin)
 */
export const sendCommand = asyncHandler(async (req, res) => {
    const deviceId = req.params.id;
    const { command, payload } = req.body;

    if (!command) {
        return errorResponse(res, 'command is required', 400);
    }

    const cmd = await deviceService.createCommand(deviceId, command, payload || null);
    successResponse(res, cmd, 'Command queued successfully', 201);
});

/**
 * Device polling endpoint: device requests next command
 */
export const pollCommand = asyncHandler(async (req, res) => {
    const deviceId = req.params.id;
    const cmd = await deviceService.pollNextCommand(deviceId);

    if (!cmd) {
        return successResponse(res, null, 'No pending commands', 204);
    }

    successResponse(res, cmd, 'Command retrieved');
});

/**
 * Device acknowledges command execution
 */
export const acknowledgeCommand = asyncHandler(async (req, res) => {
    const deviceId = req.params.id;
    const commandId = req.params.cmdId;
    const resultMeta = req.body || null;

    const updated = await deviceService.ackCommand(commandId, deviceId, resultMeta);

    if (!updated) return errorResponse(res, 'Command not found or not allowed', 404);

    successResponse(res, updated, 'Command acknowledged');
});

/**
 * Get device logical state from last acknowledged command
 */
export const getDeviceState = asyncHandler(async (req, res) => {
    const deviceId = req.params.id;
    const last = await deviceService.getLastAcknowledgedCommand(deviceId);

    if (!last) return successResponse(res, { state: 'unknown' }, 'No state available');

    // derive simple state from last command
    const state = last.command === 'open' ? 'open' : last.command === 'close' ? 'closed' : 'unknown';
    successResponse(res, { state, lastCommand: last }, 'Device state retrieved');
});

/**
 * Get all devices
 */
export const getDevices = asyncHandler(async (req, res) => {
    const devices = await deviceService.getAllDevices();
    successResponse(res, devices, 'Devices retrieved successfully');
});

/**
 * Get device by ID
 */
export const getDevice = asyncHandler(async (req, res) => {
    const device = await deviceService.getDeviceById(req.params.id);

    if (!device) {
        return errorResponse(res, 'Device not found', 404);
    }

    successResponse(res, device, 'Device retrieved successfully');
});

/**
 * Create new device
 */
export const createDevice = asyncHandler(async (req, res) => {
    const device = await deviceService.createDevice(req.body);
    successResponse(res, device, 'Device created successfully', 201);
});

/**
 * Update device
 */
export const updateDevice = asyncHandler(async (req, res) => {
    const device = await deviceService.updateDevice(req.params.id, req.body);
    successResponse(res, device, 'Device updated successfully');
});

/**
 * Delete device
 */
export const deleteDevice = asyncHandler(async (req, res) => {
    await deviceService.deleteDevice(req.params.id);
    successResponse(res, null, 'Device deactivated successfully');
});
