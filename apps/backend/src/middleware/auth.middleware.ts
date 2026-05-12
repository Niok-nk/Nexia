import { Request, Response, NextFunction } from 'express';
import { authService } from '../auth/auth.service.js';

export interface AuthRequest extends Request {
	user?: {
		sub: string;
		username: string;
		role: 'admin' | 'agent' | 'viewer';
	};
}

/**
 * Middleware que exige JWT válido en el header Authorization.
 * Añade `req.user` con el payload decodificado.
 */
export const requireAuth = (
	req: AuthRequest,
	res: Response,
	next: NextFunction
): void => {
	const authHeader = req.headers.authorization;

	if (!authHeader?.startsWith('Bearer ')) {
		res.status(401).json({ error: 'Autenticación requerida' });
		return;
	}

	const token = authHeader.slice(7);

	try {
		const payload = authService.verify(token);
		req.user = {
			sub: payload.sub,
			username: payload.username,
			role: payload.role,
		};
		next();
	} catch {
		res.status(401).json({ error: 'Token inválido o expirado' });
	}
};

/**
 * Middleware que exige un rol específico. Debe usarse DESPUÉS de requireAuth.
 */
export const requireRole =
	(...roles: Array<'admin' | 'agent' | 'viewer'>) =>
	(req: AuthRequest, res: Response, next: NextFunction): void => {
		if (!req.user || !roles.includes(req.user.role)) {
			res.status(403).json({ error: 'Permiso denegado' });
			return;
		}
		next();
	};
