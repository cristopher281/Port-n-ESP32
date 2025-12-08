import { body, param, query, validationResult } from 'express-validator';

/**
 * Validation middleware to check for errors
 */
export function validate(req, res, next) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }

    next();
}

/**
 * Validation rules for sensor data submission
 */
export const validateSensorData = [
    body('device_id').isInt({ min: 1 }).withMessage('Valid device_id required'),
    body('sensor_type').isString().trim().notEmpty().withMessage('sensor_type required'),
    body('value').isFloat().withMessage('Numeric value required'),
    body('unit').optional().isString().trim(),
    body('metadata').optional().isObject(),
    validate
];

/**
 * Validation rules for device creation
 */
export const validateDevice = [
    body('name').isString().trim().notEmpty().withMessage('Device name required'),
    body('location').optional().isString().trim(),
    body('device_type').optional().isString().trim(),
    validate
];

/**
 * Validation rules for device ID parameter
 */
export const validateDeviceId = [
    param('id').isInt({ min: 1 }).withMessage('Valid device ID required'),
    validate
];

/**
 * Validation rules for history query parameters
 */
export const validateHistoryQuery = [
    query('limit').optional().isInt({ min: 1, max: 1000 }).withMessage('Limit must be between 1 and 1000'),
    query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be non-negative'),
    query('start_date').optional().isISO8601().withMessage('Invalid start date format'),
    query('end_date').optional().isISO8601().withMessage('Invalid end date format'),
    query('sensor_type').optional().isString().trim(),
    validate
];
