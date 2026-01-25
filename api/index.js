
import app from '../backend/src/app.js';
import { createServer } from 'http';
import { parse } from 'url';

export default function handler(req, res) {
	// Vercel envía req y res como en Node.js
	// Express puede manejar directamente estos objetos
	app(req, res);
}
