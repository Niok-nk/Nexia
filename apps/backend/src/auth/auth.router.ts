import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authService } from './auth.service.js';

const router = Router();

const loginSchema = z.object({
	username: z.string().min(1),
	password: z.string().min(1),
});

// POST /api/v1/auth/login
router.post('/login', (req: Request, res: Response) => {
	const result = loginSchema.safeParse(req.body);
	if (!result.success) {
		res.status(400).json({ error: 'Datos inválidos', details: result.error.flatten() });
		return;
	}

	const { username, password } = result.data;
	const token = authService.login(username, password);

	if (!token) {
		res.status(401).json({ error: 'Credenciales incorrectas' });
		return;
	}

	res.json({
		token,
		expiresIn: process.env.JWT_EXPIRES_IN || '8h',
		username,
		role: 'admin',
	});
});

// POST /api/v1/auth/refresh
router.post('/refresh', (req: Request, res: Response) => {
	const authHeader = req.headers.authorization;
	if (!authHeader?.startsWith('Bearer ')) {
		res.status(401).json({ error: 'Token requerido' });
		return;
	}

	try {
		const token = authHeader.slice(7);
		const payload = authService.verify(token);
		const newToken = authService.refresh(payload);
		res.json({ token: newToken });
	} catch {
		res.status(401).json({ error: 'Token inválido o expirado' });
	}
});

// POST /api/v1/auth/logout
router.post('/logout', (_req: Request, res: Response) => {
	// Con JWT stateless el cliente simplemente descarta el token.
	// En producción se puede usar una blacklist en Redis.
	res.json({ message: 'Sesión cerrada correctamente' });
});

export { router as authRouter };
