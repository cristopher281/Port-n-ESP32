-- ESP32 IoT Monitoring Platform Database Schema
-- Drop tables if they exist (for fresh installation)
DROP TABLE IF EXISTS sensor_readings;
DROP TABLE IF EXISTS devices;
-- Create devices table
CREATE TABLE devices (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    device_type VARCHAR(100) DEFAULT 'ESP32',
    status ENUM('active', 'inactive', 'maintenance') DEFAULT 'active',
    api_token VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_token (api_token)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- Create sensor_readings table
CREATE TABLE sensor_readings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    device_id INT NOT NULL,
    sensor_type VARCHAR(100) NOT NULL,
    value DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(50),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSON,
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
    INDEX idx_device_timestamp (device_id, timestamp DESC),
    INDEX idx_sensor_type (sensor_type),
    INDEX idx_timestamp (timestamp)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- Create device_commands table to queue commands for devices (open/close)
CREATE TABLE device_commands (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    device_id INT NOT NULL,
    command VARCHAR(50) NOT NULL,
    status ENUM('pending','sent','acknowledged','failed') DEFAULT 'pending',
    payload JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
    INDEX idx_device_status (device_id, status)
 ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- Insert sample device for testing
INSERT INTO devices (name, location, device_type, api_token, status)
VALUES (
        'ESP32 Gateway',
        'Main Entrance',
        'ESP32',
        'esp32_sample_token_12345',
        'active'
    );