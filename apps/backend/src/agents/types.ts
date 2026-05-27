export interface AgentResponse {
	response: string;
	nextStage?: string;
	shouldTransfer?: boolean;
	metadata?: Record<string, any>;
}

export interface IAgent {
	name: string;
	handle(message: string, context: any): Promise<AgentResponse>;
}

export interface CreditoData {
	nombres?: string;
	apellidos?: string;
	cedula?: string;
	celular?: string;
	direccion?: string;
	tipoVivienda?: string;
	departamento?: string;
	ciudad?: string;
	personasACargo?: string;
	empresa?: string;
	cargo?: string;
	experienciaLaboral?: string;
	estadoCivil?: string;
	ingresosMensuales?: string;
	gastosMensuales?: string;
	otrosIngresos?: string;
	reportadoDataCredito?: string;
	dispuestoSaldarDeuda?: string;
	producto?: string;
	skuProducto?: string;
}

export interface CreditoStep {
	field: keyof CreditoData;
	pregunta: string;
	opciones?: string[];
}

export interface FewShotExample {
	cliente: string;
	asistente: string;
}
