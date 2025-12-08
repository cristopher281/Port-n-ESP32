import * as deviceService from '../services/deviceService.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { asyncHandler } from '../middleware/errorHandler.js';

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
