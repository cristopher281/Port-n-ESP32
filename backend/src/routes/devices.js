import express from 'express';
import * as deviceController from '../controllers/deviceController.js';
import { validateDevice, validateDeviceId } from '../middleware/validate.js';

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
