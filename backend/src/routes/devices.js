import express from 'express';
import * as deviceController from '../controllers/deviceController.js';
import { validateDevice, validateDeviceId } from '../middleware/validate.js';
import { authenticateToken, verifyDeviceToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/devices
 * @desc    Get all devices
 * @access  Public
 */
router.get('/', deviceController.getDevices);

/**
 * @route   GET /api/devices/:id
 * @desc    Get device by ID
 * @access  Public
 */
router.get('/:id', validateDeviceId, deviceController.getDevice);

/**
 * @route   POST /api/devices
 * @desc    Create new device
 * @access  Public
 */
router.post('/', validateDevice, deviceController.createDevice);

/**
 * Admin: queue a command for a device (open/close)
 * Protect with admin API secret
 */
router.post('/:id/command', authenticateToken, requireAdmin, deviceController.sendCommand);

/**
 * Device polling endpoint to retrieve next pending command
 * Device must authenticate with its device token
 */
router.get('/:id/commands/poll', authenticateToken, verifyDeviceToken, deviceController.pollCommand);

/**
 * Device acknowledges a command
 */
router.post('/:id/commands/:cmdId/ack', authenticateToken, verifyDeviceToken, deviceController.acknowledgeCommand);

/**
 * Get device logical state derived from last acknowledged command
 */
router.get('/:id/state', deviceController.getDeviceState);

/**
 * @route   PUT /api/devices/:id
 * @desc    Update device
 * @access  Public
 */
router.put('/:id', validateDeviceId, deviceController.updateDevice);

/**
 * @route   DELETE /api/devices/:id
 * @desc    Delete/deactivate device
 * @access  Public
 */
router.delete('/:id', validateDeviceId, deviceController.deleteDevice);

export default router;
