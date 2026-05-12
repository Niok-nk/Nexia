import { Router, Request, Response } from 'express';
import qrcode from 'qrcode';
import { z } from 'zod';
import { getStatus, getCurrentQR, sendMessage } from './whatsapp.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

// GET /api/v1/whatsapp/status
router.get('/status', requireAuth, (_req: Request, res: Response) => {
	res.json({ status: getStatus() });
});

// GET /api/v1/whatsapp/qr — Retorna QR como imagen base64
router.get('/qr', requireAuth, async (_req: Request, res: Response) => {
	const qr = getCurrentQR();

	if (!qr) {
		res.status(404).json({
			error: 'No hay QR disponible',
			status: getStatus(),
		});
		return;
	}

	try {
		const base64 = await qrcode.toDataURL(qr);
		res.json({ qr: base64, status: 'qr_pending' });
	} catch {
		res.status(500).json({ error: 'Error generando QR' });
	}
});

const sendSchema = z.object({
	to: z.string().min(5),
	message: z.string().min(1),
});

// POST /api/v1/whatsapp/send — Envía mensaje manual
router.post('/send', requireAuth, async (req: Request, res: Response) => {
	const result = sendSchema.safeParse(req.body);
	if (!result.success) {
		res.status(400).json({ error: 'Datos inválidos', details: result.error.flatten() });
		return;
	}

	if (getStatus() !== 'connected') {
		res.status(503).json({ error: 'WhatsApp no está conectado', status: getStatus() });
		return;
	}

	try {
		const { to, message } = result.data;
		await sendMessage(to, message);
		res.json({ success: true, to, message });
	} catch (error) {
		res.status(500).json({ error: 'Error enviando mensaje', details: String(error) });
	}
});

export { router as whatsappRouter };
