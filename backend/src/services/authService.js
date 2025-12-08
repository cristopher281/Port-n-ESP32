import pool from '../config/database.js'
import bcrypt from 'bcryptjs'

export async function createUser(username, password, isAdmin = false) {
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)

    const [result] = await pool.query(
        'INSERT INTO users (username, password_hash, is_admin) VALUES (?, ?, ?)',
        [username, hash, isAdmin ? 1 : 0]
    )

    const [rows] = await pool.query('SELECT id, username, is_admin, created_at FROM users WHERE id = ?', [result.insertId])
    return rows[0]
}

export async function findUserByUsername(username) {
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username])
    return rows[0]
}

export async function findUserById(id) {
    const [rows] = await pool.query('SELECT id, username, is_admin, created_at FROM users WHERE id = ?', [id])
    return rows[0]
}

export async function verifyPassword(password, hash) {
    return bcrypt.compare(password, hash)
}

export async function updateLastLogin(userId) {
    await pool.query('UPDATE users SET last_login = NOW() WHERE id = ?', [userId])
}
