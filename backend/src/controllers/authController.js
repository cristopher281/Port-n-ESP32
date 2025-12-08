import * as authService from '../services/authService.js'
import jwt from 'jsonwebtoken'
import { authConfig } from '../config/auth.js'
import { successResponse, errorResponse } from '../utils/response.js'
import { asyncHandler } from '../middleware/errorHandler.js'

export const register = asyncHandler(async (req, res) => {
    const { username, password } = req.body

    if (!username || !password) return errorResponse(res, 'username and password required', 400)

    const existing = await authService.findUserByUsername(username)
    if (existing) return errorResponse(res, 'username already exists', 409)

    const user = await authService.createUser(username, password, false)

    successResponse(res, user, 'User created', 201)
})

export const login = asyncHandler(async (req, res) => {
    const { username, password } = req.body

    if (!username || !password) return errorResponse(res, 'username and password required', 400)

    const user = await authService.findUserByUsername(username)
    if (!user) return errorResponse(res, 'Invalid credentials', 401)

    const ok = await authService.verifyPassword(password, user.password_hash)
    if (!ok) return errorResponse(res, 'Invalid credentials', 401)

    // optional: log attempt
    try { const { logLoginAttempt } = await import('../middleware/userLogger.js'); logLoginAttempt(username, true, req.ip) } catch(e){}

    // update last login
    await authService.updateLastLogin(user.id)

    const payload = { id: user.id, username: user.username, is_admin: !!user.is_admin }
    const token = jwt.sign(payload, authConfig.apiSecret, { expiresIn: '7d' })

    successResponse(res, { token, user: { id: user.id, username: user.username, is_admin: !!user.is_admin } }, 'Authenticated')
})
