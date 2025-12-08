import pool from '../config/database.js';

/**
 * Save sensor reading
 */
export async function saveSensorReading(readingData) {
    const { device_id, sensor_type, value, unit, metadata } = readingData;

    const [result] = await pool.query(
        'INSERT INTO sensor_readings (device_id, sensor_type, value, unit, metadata) VALUES (?, ?, ?, ?, ?)',
        [device_id, sensor_type, value, unit || null, metadata ? JSON.stringify(metadata) : null]
    );

    return {
        id: result.insertId,
        ...readingData,
        timestamp: new Date()
    };
}

/**
 * Get latest reading for a device
 */
export async function getLatestReading(deviceId, sensorType = null) {
    let query = `
    SELECT sr.*, d.name as device_name, d.location 
    FROM sensor_readings sr
    JOIN devices d ON sr.device_id = d.id
    WHERE sr.device_id = ?
  `;

    const params = [deviceId];

    if (sensorType) {
        query += ' AND sr.sensor_type = ?';
        params.push(sensorType);
    }

    query += ' ORDER BY sr.timestamp DESC LIMIT 1';

    const [rows] = await pool.query(query, params);
    return rows[0];
}

/**
 * Get all latest readings for a device (one per sensor type)
 */
export async function getAllLatestReadings(deviceId) {
    const query = `
    SELECT sr1.*
    FROM sensor_readings sr1
    INNER JOIN (
      SELECT sensor_type, MAX(timestamp) as max_timestamp
      FROM sensor_readings
      WHERE device_id = ?
      GROUP BY sensor_type
    ) sr2 ON sr1.sensor_type = sr2.sensor_type AND sr1.timestamp = sr2.max_timestamp
    WHERE sr1.device_id = ?
    ORDER BY sr1.timestamp DESC
  `;

    const [rows] = await pool.query(query, [deviceId, deviceId]);
    return rows;
}

/**
 * Get historical readings with filtering and pagination
 */
export async function getHistoricalReadings(deviceId, options = {}) {
    const {
        limit = 100,
        offset = 0,
        start_date,
        end_date,
        sensor_type
    } = options;

    let query = `
    SELECT sr.*, d.name as device_name 
    FROM sensor_readings sr
    JOIN devices d ON sr.device_id = d.id
    WHERE sr.device_id = ?
  `;

    const params = [deviceId];

    if (start_date) {
        query += ' AND sr.timestamp >= ?';
        params.push(start_date);
    }

    if (end_date) {
        query += ' AND sr.timestamp <= ?';
        params.push(end_date);
    }

    if (sensor_type) {
        query += ' AND sr.sensor_type = ?';
        params.push(sensor_type);
    }

    // Get total count
    const countQuery = query.replace('SELECT sr.*, d.name as device_name', 'SELECT COUNT(*) as total');
    const [countResult] = await pool.query(countQuery, params);
    const total = countResult[0].total;

    // Get paginated results
    query += ' ORDER BY sr.timestamp DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await pool.query(query, params);

    return {
        data: rows,
        pagination: {
            total,
            limit,
            offset
        }
    };
}

/**
 * Get statistics for a device
 */
export async function getDeviceStatistics(deviceId, sensorType, hours = 24) {
    const query = `
    SELECT 
      COUNT(*) as count,
      AVG(value) as avg_value,
      MIN(value) as min_value,
      MAX(value) as max_value,
      sensor_type
    FROM sensor_readings
    WHERE device_id = ?
      AND sensor_type = ?
      AND timestamp >= DATE_SUB(NOW(), INTERVAL ? HOUR)
    GROUP BY sensor_type
  `;

    const [rows] = await pool.query(query, [deviceId, sensorType, hours]);
    return rows[0];
}
