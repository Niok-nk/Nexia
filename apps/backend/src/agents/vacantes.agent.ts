import { IAgent, AgentResponse } from './types.js';
import { buildUserDataContext, buildGemmaPrompt, cleanResponse, formatHistory } from './helpers.js';
import { generateResponse } from '../utils/gemini.js';

export class VacantesAgent implements IAgent {
	name = 'Vacantes';

	async handle(message: string, context: any): Promise<AgentResponse> {
		const userDataCtx = buildUserDataContext(context?.userData);
		const datos = `No hay listado de vacantes cargado actualmente. El interesado deja sus datos para quedar en base de datos: nombre completo, cargo de interés, ciudad. Puede enviar hoja de vida.${userDataCtx}`;

		const { system, user } = buildGemmaPrompt({
			instruccion: `Eres asistente de recursos humanos de Electrodomésticos JLC. Atiendes a personas interesadas en trabajar en la empresa. Datos: ${datos}`,
			ejemplos: [
				{
					cliente: '¿Tienen vacantes?',
					asistente:
						'¡Gracias por tu interés en trabajar con nosotros! En este momento no tengo el listado de vacantes disponible, pero puedo registrar tu perfil. ¿Me compartes tu nombre completo, el cargo de interés y tu ciudad?',
				},
				{
					cliente: 'Soy Carlos Pérez, busco asesor comercial en Cali',
					asistente:
						'¡Excelente, Carlos! Quedas registrado en nuestra base de datos. Si quieres, envía tu hoja de vida para adjuntarla a tu perfil y que RRHH te contacte cuando haya una vacante de asesor comercial en Cali.',
				},
			],
			historial: formatHistory(context?.history),
			mensajeCliente: message,
		});

		const raw = await generateResponse(user, system);
		const response = cleanResponse(raw);

		return {
			response,
			metadata: { agentType: 'vacantes' },
		};
	}
}
