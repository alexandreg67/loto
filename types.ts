// Core lottery data types
export interface LotoDraw {
	_id: string;
	drawDate: Date | string;
	numbers: number[]; // 5 main numbers (1-49)
	luckyNumber: number; // 1 lucky number (1-10)
	createdAt?: Date;
}

// Analysis result types
export interface CombinedAnalysisData {
	frequencies: [number, number][];
	pairs: [string, number][];
	gaps: [number, number][];
	sequences: [string, number][];
	clusters: [string, number][];
	delays: [number, number][];
	slidingFrequencies: [number, number][];
	markovChainAnalysis: [number, number][];
	cycleAnalysis: [number, number][];
	sumAnalysis: [number, number][];
	parityAnalysis: [string, number][];
	spacingAnalysis: [number, number][];
	endingAnalysis: [number, number][];
	groupAnalysis: [number, number][];
	weightedRandomNumbers: number[];
	suggestedNumbers: number[];
}

// API response types
export interface ApiResponse<T> {
	success: boolean;
	data?: T;
	message?: string;
	error?: string;
}

// Analysis state type for components
export interface AnalysisState {
	sequences: [string, number][];
	gaps: [number, number][];
	pairs: [string, number][];
	frequencies: [number, number][];
	suggestedNumbers: number[];
}
