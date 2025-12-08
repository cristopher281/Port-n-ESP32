import { authConfig } from '../config/auth.js';
import jwt from 'jsonwebtoken';

/**
 * Authentication middleware for API endpoints
 * Verifies Bearer token in Authorization header
 */
export function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Authentication token required'
        });
    }

    // For device-specific tokens, we'll verify against database
    // For now, we'll accept the API secret or device tokens
    req.token = token;
    next();
}

/**
 * Verify device token from database
 */
export async function verifyDeviceToken(req, res, next) {
    try {
        const token = req.token;
        const deviceId = req.body.device_id || req.params.deviceId;

        // Import here to avoid circular dependency
        const { verifyToken } = await import('../services/deviceService.js');

        const device = await verifyToken(token, deviceId);

        if (!device) {
            return res.status(403).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }

        req.device = device;
        next();
    } catch (error) {
        return res.status(403).json({
            success: false,
            message: 'Token verification failed'
        });
    }
}

/**
 * Verify JWT token for frontend users
 */
export function verifyUserJWT(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ success: false, message: 'Authentication token required' });

    try {
        const payload = jwt.verify(token, authConfig.apiSecret);
        req.user = payload;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
}

/**
 * Verify admin/API secret token
 */
export function requireAdmin(req, res, next) {
    const token = req.token || (req.headers['authorization'] && req.headers['authorization'].split(' ')[1]);

    // Allow API_SECRET as admin token
    if (token && token === authConfig.apiSecret) return next();

    // Or allow JWT user with is_admin flag
    try {
        const payload = jwt.verify(token, authConfig.apiSecret);
        if (payload && payload.is_admin) {
            req.user = payload;
            return next();
        }
    } catch (err) {
        // ignore
    }

    return res.status(403).json({ success: false, message: 'Admin token required' });
}
