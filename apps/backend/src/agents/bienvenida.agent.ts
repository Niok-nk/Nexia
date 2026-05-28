import { IAgent, AgentResponse } from './types.js';
import { getSaludo, AGENT_NAME } from './helpers.js';
import { generateResponse } from '../utils/gemini.js';

async function generarBienvenidaIA(recurrente: boolean, nombreCliente?: string): Promise<string> {
	const saludo = getSaludo();
	const esRecurrente = recurrente ? 'el cliente ya ha interactuado antes con nosotros' : 'el cliente nos contacta por primera vez';
	const nombreCtx = nombreCliente ? ` Se llama ${nombreCliente}.` : '';
	try {
		const raw = await generateResponse(
			`Clima: ${saludo}. Contexto: ${esRecurrente}.${nombreCtx}`,
			`Eres ${AGENT_NAME}, asesora virtual de JLC Electronics, la marca de los colombianos.
Genera un mensaje de bienvenida PERSONALIZADO y natural (máximo 3 oraciones) para este cliente.
Debe incluir:
- El clima (${saludo}) al inicio
- Tu nombre (${AGENT_NAME})
- "Gracias por escoger a JLC Electronics, la marca de los colombianos" o similar
- Terminar preguntando "¿En qué te puedo ayudar?" de forma natural

NO uses listas numeradas, NO uses "1️⃣", NO muestres opciones.
Tono cálido, femenino, español colombiano.`
		);
		const limpio = raw.replace(/["""*]/g, '').trim();
		if (limpio.length > 20) return limpio;
	} catch {}
	const nombrePart = nombreCliente ? ` ${nombreCliente}, ` : ' ';
	return `¡${saludo}!${nombrePart}soy ${AGENT_NAME}, gracias por escoger a JLC Electronics, la marca de los colombianos. 😊 ¿En qué te puedo ayudar?`;
}

export class BienvenidaAgent implements IAgent {
	name = 'Bienvenida';

	private esClienteRecurrente(context: any): boolean {
		return context?.nuevaSesion || (context?.history?.length ?? 0) > 0;
	}

	async handle(_message: string, context: any): Promise<AgentResponse> {
		const recurrente = this.esClienteRecurrente(context);
		const nombre = context?.userData?.nombre || undefined;
		const iaMsg = await generarBienvenidaIA(recurrente, nombre);
		return {
			response: iaMsg,
			metadata: { agentType: 'bienvenida', passthrough: false },
		};
	}
}
