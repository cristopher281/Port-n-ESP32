import pool from '../config/database.js';

/**
 * Get all devices
 */
export async function getAllDevices() {
    const [rows] = await pool.query(
        'SELECT id, name, location, device_type, status, created_at, updated_at FROM devices ORDER BY created_at DESC'
    );
    return rows;
}

/**
 * Get device by ID
 */
export async function getDeviceById(id) {
    const [rows] = await pool.query(
        'SELECT id, name, location, device_type, status, api_token, created_at, updated_at FROM devices WHERE id = ?',
        [id]
    );
    return rows[0];
}

/**
 * Create new device
 */
export async function createDevice(deviceData) {
    const { name, location, device_type } = deviceData;

    // Generate unique API token
    const api_token = generateToken();

    const [result] = await pool.query(
        'INSERT INTO devices (name, location, device_type, api_token, status) VALUES (?, ?, ?, ?, ?)',
        [name, location || null, device_type || 'ESP32', api_token, 'active']
    );

    return getDeviceById(result.insertId);
}

/**
 * Update device
 */
export async function updateDevice(id, updates) {
    const { name, location, device_type, status } = updates;

    const [result] = await pool.query(
        'UPDATE devices SET name = COALESCE(?, name), location = COALESCE(?, location), device_type = COALESCE(?, device_type), status = COALESCE(?, status) WHERE id = ?',
        [name, location, device_type, status, id]
    );

    if (result.affectedRows === 0) {
        throw new Error('Device not found');
    }

    return getDeviceById(id);
}

/**
 * Delete device (soft delete by setting status to inactive)
 */
export async function deleteDevice(id) {
    const [result] = await pool.query(
        'UPDATE devices SET status = ? WHERE id = ?',
        ['inactive', id]
    );

    if (result.affectedRows === 0) {
        throw new Error('Device not found');
    }

    return true;
}

/**
 * Verify device token
 */
export async function verifyToken(token, deviceId = null) {
    let query = 'SELECT * FROM devices WHERE api_token = ? AND status = ?';
    let params = [token, 'active'];

    if (deviceId) {
        query += ' AND id = ?';
        params.push(deviceId);
    }

    const [rows] = await pool.query(query, params);
    return rows[0];
}

/**
 * Generate unique token for device
 */
function generateToken() {
    return 'esp32_' + Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15) +
        Date.now().toString(36);
}

/**
 * Create a command for a device (admin action)
 */
export async function createCommand(deviceId, command, payload = null) {
    const [result] = await pool.query(
        'INSERT INTO device_commands (device_id, command, payload) VALUES (?, ?, ?)',
        [deviceId, command, payload ? JSON.stringify(payload) : null]
    );

    const [rows] = await pool.query('SELECT * FROM device_commands WHERE id = ?', [result.insertId]);
    return rows[0];
}

/**
 * Poll next pending command for a device (used by ESP32)
 */
export async function pollNextCommand(deviceId) {
    // Atomically select the oldest pending command and mark as 'sent'
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();
        const [rows] = await conn.query(
            'SELECT * FROM device_commands WHERE device_id = ? AND status = ? ORDER BY created_at ASC LIMIT 1 FOR UPDATE',
            [deviceId, 'pending']
        );

        if (!rows || rows.length === 0) {
            await conn.commit();
            conn.release();
            return null;
        }

        const cmd = rows[0];
        await conn.query('UPDATE device_commands SET status = ? WHERE id = ?', ['sent', cmd.id]);
        await conn.commit();
        conn.release();
        return cmd;
    } catch (err) {
        await conn.rollback();
        conn.release();
        throw err;
    }
}

/**
 * Acknowledge a command (device reports that it executed the command)
 */
export async function ackCommand(commandId, deviceId, resultMeta = null) {
    const [result] = await pool.query(
        'UPDATE device_commands SET status = ?, payload = JSON_MERGE_PATCH(IFNULL(payload, JSON_OBJECT()), ?) WHERE id = ? AND device_id = ?',
        ['acknowledged', resultMeta ? JSON.stringify(resultMeta) : null, commandId, deviceId]
    );

    if (result.affectedRows === 0) return false;
    const [rows] = await pool.query('SELECT * FROM device_commands WHERE id = ?', [commandId]);
    return rows[0];
}

/**
 * Get last acknowledged command for device (useful to show current gate state)
 */
export async function getLastAcknowledgedCommand(deviceId) {
    const [rows] = await pool.query(
        'SELECT * FROM device_commands WHERE device_id = ? AND status = ? ORDER BY updated_at DESC LIMIT 1',
        [deviceId, 'acknowledged']
    );
    return rows[0];
}
