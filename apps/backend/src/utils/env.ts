import { z } from 'zod';

const envSchema = z.object({
	NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
	PORT: z.string().default('8000'),
	DATABASE_URL: z.string(),
	// Auth
	JWT_SECRET: z.string().min(16).default('changeme_secret_key_dev_min16chars'),
	JWT_EXPIRES_IN: z.string().default('8h'),
	ADMIN_USER: z.string().default('admin'),
	ADMIN_PASSWORD: z.string().min(6).default('admin1234'),
	// Frontend
	FRONTEND_URL: z.string().optional(),
	// Gemini
	GEMINI_API_KEY: z.string().optional(),
	// WooCommerce
	WC_BASE_URL: z.string().optional(),
	WC_CONSUMER_KEY: z.string().optional(),
	WC_CONSUMER_SECRET: z.string().optional(),
	// Redis
	REDIS_URL: z.string().optional(),
});

export const validateEnv = () => {
	const result = envSchema.safeParse(process.env);

	if (!result.success) {
		console.error('❌ Variables de entorno inválidas:');
		result.error.errors.forEach((e) => {
			console.error(`  - ${e.path.join('.')}: ${e.message}`);
		});
		process.exit(1);
	}

	if (process.env.NODE_ENV !== 'production') {
		console.log('✅ Variables de entorno validadas');
	}

	return result.data;
};
