import express from 'express'
import * as authController from '../controllers/authController.js'
import { body } from 'express-validator'
import { validate } from '../middleware/validate.js'

const router = express.Router()

router.post('/register',
  body('username').isString().trim().notEmpty().withMessage('username required'),
  body('password').isString().isLength({ min: 6 }).withMessage('password min 6 chars'),
  validate,
  authController.register
)

router.post('/login',
  body('username').isString().trim().notEmpty(),
  body('password').isString().notEmpty(),
  validate,
  authController.login
)

export default router
