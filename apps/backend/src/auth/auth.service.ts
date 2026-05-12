import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme_secret_key_dev';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin1234';

export interface JwtPayload {
	sub: string;
	username: string;
	role: 'admin' | 'agent' | 'viewer';
	iat?: number;
	exp?: number;
}

export const authService = {
	/**
	 * Verifica credenciales y retorna un JWT firmado.
	 */
	login(username: string, password: string): string | null {
		if (username !== ADMIN_USER || password !== ADMIN_PASSWORD) {
			return null;
		}

		const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
			sub: 'admin-001',
			username,
			role: 'admin',
		};

		return jwt.sign(payload, JWT_SECRET, {
			expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
		});
	},

	/**
	 * Verifica y decodifica un JWT. Lanza error si es inválido.
	 */
	verify(token: string): JwtPayload {
		return jwt.verify(token, JWT_SECRET) as JwtPayload;
	},

	/**
	 * Genera un nuevo token a partir de un payload existente.
	 */
	refresh(payload: JwtPayload): string {
		const { sub, username, role } = payload;
		return jwt.sign({ sub, username, role }, JWT_SECRET, {
			expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
		});
	},
};
