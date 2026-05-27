import { IAgent, AgentResponse } from './types.js';
import { buildUserDataContext, buildGemmaPrompt, cleanResponse, formatHistory } from './helpers.js';
import { generateResponse } from '../utils/gemini.js';
import { wooCommerceService } from '../woocommerce/woocommerce.service.js';

export class RepuestosAgent implements IAgent {
	name = 'Repuestos';

	async handle(message: string, context: any): Promise<AgentResponse> {
		const lower = message.toLowerCase().trim();

		// ── Flujo de repuestos pausado ─────────────────────────────────────────
		if (context?.flujo === 'repuestos_pausado') {
			const quiereContinuar = /s[ií]|dale|ok|bueno|claro|por favor|seguir|continuar/i.test(lower);
			if (quiereContinuar) {
				context.flujo = 'repuestos';
			} else {
				context.flujo = null;
				return {
					response: 'Perfecto, dejamos de lado el tema de los repuestos. ¿En qué más te puedo ayudar hoy? 😊',
					metadata: { agentType: 'repuestos', flujo: null },
				};
			}
		}

		// Flujo de recolección de datos para repuesto
		const repuestoData = context?.repuestoData ?? {};

		// Paso 1: nombre del repuesto / qué necesita
		if (!repuestoData.repuesto) {
			if (message.length > 5 && !/^(hola|buenas|si|no|ok|claro)/i.test(message)) {
				repuestoData.repuesto = message.trim();
			} else {
				return {
					response: '¿Qué repuesto o pieza necesitas? Descríbelo lo mejor posible (ej: "filtro de agua nevera JLC", "empaque puerta lavadora").',
					metadata: { agentType: 'repuestos', flujo: 'repuestos', repuestoData },
				};
			}
		}

		// Paso 2: referencia o modelo del producto
		if (!repuestoData.referencia) {
			if (context?.flujo === 'repuestos' && repuestoData.repuesto && message !== repuestoData.repuesto) {
				repuestoData.referencia = message.trim();
			} else {
				return {
					response: `Gracias. ¿Cuál es la marca, modelo o referencia del electrodoméstico? (La encuentras en la placa trasera del equipo).`,
					metadata: { agentType: 'repuestos', flujo: 'repuestos', repuestoData },
				};
			}
		}

		// Paso 3: nombre y cédula del solicitante
		if (!repuestoData.nombreCliente) {
			if (context?.flujo === 'repuestos' && repuestoData.referencia && message !== repuestoData.referencia) {
				repuestoData.nombreCliente = message.trim();
			} else {
				return {
					response: `¿Cuál es tu nombre completo y número de cédula? (Necesarios para registrar tu solicitud).`,
					metadata: { agentType: 'repuestos', flujo: 'repuestos', repuestoData },
				};
			}
		}

		// Todos los datos básicos recolectados → buscar en WooCommerce y responder
		let productInfo = '';
		try {
			const products = await wooCommerceService.searchProducts(
				`${repuestoData.repuesto} ${repuestoData.referencia} repuesto`,
				3
			);
			if (products.length > 0) {
				productInfo = wooCommerceService.formatProductList(products);
			}
		} catch {
			// continuar sin catálogo
		}

		const userDataCtx = buildUserDataContext(context?.userData);
		const datos = `Repuesto solicitado: "${repuestoData.repuesto}". Referencia equipo: "${repuestoData.referencia}". Solicitante: ${repuestoData.nombreCliente}.${userDataCtx}
Sin stock: tiempo de pedido 3 a 5 días hábiles. Web: https://jlc-electronics.com/.${productInfo ? ` Repuestos encontrados: ${productInfo}` : ' No se encontraron repuestos en catálogo en este momento.'}
Instrucción: indica al cliente que su solicitud fue registrada y que será respondida para confirmar disponibilidad y precio. Si hay repuestos en catálogo, mencionarlos. Pedirle que envíe foto del equipo si puede para confirmar la referencia exacta.`;

		const { system, user } = buildGemmaPrompt({
			instruccion: `Eres asistente de repuestos de Electrodomésticos JLC. ${datos}`,
			ejemplos: [
				{
					cliente: 'Necesito un empaque para nevera JLC modelo JLC-325',
					asistente:
						'¡Gracias! Tu solicitud quedó registrada. En un momento revisamos disponibilidad y precio del empaque para la JLC-325 y te confirmamos. Si puedes, envíanos una foto de la puerta de la nevera para confirmar la medida exacta.',
				},
			],
			historial: formatHistory(context?.history),
			mensajeCliente: message,
		});

		const raw = await generateResponse(user, system);
		const response = cleanResponse(raw);

		return {
			response,
			metadata: {
				agentType: 'repuestos',
				flujo: 'repuestos_completado',
				repuestoData,
			},
		};
	}
}
