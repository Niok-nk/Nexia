import { IAgent, AgentResponse } from './types.js';
import { buildUserDataContext, buildGemmaPrompt, cleanResponse, formatHistory } from './helpers.js';
import { generateResponse } from '../utils/gemini.js';

export class DistribuidoresAgent implements IAgent {
	name = 'Distribuidores';

	async handle(message: string, context: any): Promise<AgentResponse> {
		const userDataCtx = buildUserDataContext(context?.userData);
		const datos = `Datos a recolectar paso a paso: 1. NIT, 2. Nombre o razón social, 3. Teléfono, 4. Correo, 5. Rango de ventas estimado, 6. Departamento, 7. Ciudad. Pedir uno o dos por mensaje, no todos de golpe.${userDataCtx}`;

		const { system, user } = buildGemmaPrompt({
			instruccion: `Eres asistente del programa de distribuidores de Electrodomésticos JLC. Atiendes a interesados en ser distribuidores autorizados. Recolecta los datos de forma amable, de a poco. Datos: ${datos}`,
			ejemplos: [
				{
					cliente: 'Quiero ser distribuidor',
					asistente:
						'¡Bienvenido al programa de distribuidores JLC! Para iniciar el registro, ¿me compartes tu nombre o razón social y la ciudad donde operarías?',
				},
				{
					cliente: 'Soy Comercial XYZ SAS, en Medellín',
					asistente:
						'¡Excelente! Ahora, ¿me indicas tu NIT y un número de contacto?',
				},
				{
					cliente: 'NIT 901234567, teléfono 3001234567',
					asistente:
						'¡Perfecto! Por último, ¿cuál es tu correo electrónico y un rango aproximado de ventas mensuales? Con esto completamos tu solicitud.',
				},
			],
			historial: formatHistory(context?.history),
			mensajeCliente: message,
		});

		const raw = await generateResponse(user, system);
		const response = cleanResponse(raw);

		return {
			response,
			metadata: { agentType: 'distribuidores' },
		};
	}
}
