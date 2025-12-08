// Middleware para registrar intentos de login (opcional)
import pool from '../config/database.js'

export async function logLoginAttempt(username, success, ip) {
    try {
        await pool.query('INSERT INTO login_attempts (username, success, ip, created_at) VALUES (?, ?, ?, NOW())', [username, success ? 1 : 0, ip || null])
    } catch (err) {
        // ignore logging errors
        console.error('logLoginAttempt error', err.message)
    }
}
