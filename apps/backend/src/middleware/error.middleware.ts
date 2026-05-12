import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger.js';

/**
 * Manejador de rutas no encontradas (404).
 */
export const notFoundHandler = (req: Request, res: Response): void => {
	res.status(404).json({
		error: 'Ruta no encontrada',
		path: req.originalUrl,
		method: req.method,
	});
};

/**
 * Manejador global de errores (500).
 */
export const errorHandler = (
	err: Error,
	req: Request,
	res: Response,
	_next: NextFunction
): void => {
	logger.error({ err, path: req.originalUrl, method: req.method }, 'Unhandled error');

	const status = (err as any).status || (err as any).statusCode || 500;
	const message =
		process.env.NODE_ENV === 'production'
			? 'Error interno del servidor'
			: err.message;

	res.status(status).json({ error: message });
};
