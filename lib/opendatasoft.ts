import { LotoDraw } from '@/types';

interface OpenDataSoftResponse {
	total_count: number;
	records: Array<{
		record: {
			timestamp: string;
			fields: {
				date_de_tirage: string;
				boule_1: number;
				boule_2: number;
				boule_3: number;
				boule_4: number;
				boule_5: number;
				numero_chance: number;
			};
		};
	}>;
}

export class OpenDataSoftService {
	private readonly baseUrl = 'https://data.opendatasoft.com/api/v2/catalog/datasets/resultats-loto-2019-a-aujourd-hui@agrall';

	/**
	 * Fetch latest French Loto results from OpenDataSoft
	 */
	async fetchLatestResults(limit = 50): Promise<LotoDraw[]> {
		try {
			const url = `${this.baseUrl}/records?limit=${limit}&order_by=-date_de_tirage`;
			const response = await fetch(url, {
				headers: {
					'Accept': 'application/json',
					'User-Agent': 'LotoAnalyzer/1.0',
				},
			});

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			const data: OpenDataSoftResponse = await response.json();
			return this.transformResults(data.records);
		} catch (error) {
			console.error('Error fetching lottery results from OpenDataSoft:', error);
			throw new Error(`Failed to fetch lottery results: ${error}`);
		}
	}

	/**
	 * Fetch results for a specific date range
	 */
	async fetchResultsByDateRange(startDate: string, endDate: string): Promise<LotoDraw[]> {
		try {
			const url = `${this.baseUrl}/records?where=date_de_tirage >= '${startDate}' AND date_de_tirage <= '${endDate}'&order_by=-date_de_tirage`;
			const response = await fetch(url);

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			const data: OpenDataSoftResponse = await response.json();
			return this.transformResults(data.records);
		} catch (error) {
			console.error('Error fetching lottery results by date range:', error);
			throw new Error(`Failed to fetch lottery results: ${error}`);
		}
	}

	/**
	 * Transform OpenDataSoft results to our LotoDraw format
	 */
	private transformResults(records: OpenDataSoftResponse['records']): LotoDraw[] {
		return records.map(record => {
			const fields = record.record.fields;
			return {
				_id: `${fields.date_de_tirage}`, // Using date as temporary ID
				drawDate: new Date(fields.date_de_tirage),
				numbers: [
					fields.boule_1,
					fields.boule_2,
					fields.boule_3,
					fields.boule_4,
					fields.boule_5,
				].sort((a, b) => a - b), // Sort numbers for consistency
				luckyNumber: fields.numero_chance,
			};
		});
	}

	/**
	 * Check if the API is available
	 */
	async healthCheck(): Promise<boolean> {
		try {
			const response = await fetch(`${this.baseUrl}?limit=1`);
			return response.ok;
		} catch {
			return false;
		}
	}
}

export const openDataSoftService = new OpenDataSoftService();