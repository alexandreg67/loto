import { LotoDraw } from '@/types';

// Mock lottery data for development and testing
export const mockLotteryDraws: LotoDraw[] = [
	{
		_id: '1',
		drawDate: new Date('2024-07-27'),
		numbers: [3, 12, 25, 31, 47],
		luckyNumber: 8,
	},
	{
		_id: '2',
		drawDate: new Date('2024-07-24'),
		numbers: [7, 18, 22, 35, 43],
		luckyNumber: 4,
	},
	{
		_id: '3',
		drawDate: new Date('2024-07-20'),
		numbers: [1, 15, 28, 39, 46],
		luckyNumber: 9,
	},
	{
		_id: '4',
		drawDate: new Date('2024-07-17'),
		numbers: [5, 11, 24, 33, 41],
		luckyNumber: 2,
	},
	{
		_id: '5',
		drawDate: new Date('2024-07-13'),
		numbers: [8, 19, 26, 37, 44],
		luckyNumber: 6,
	},
	{
		_id: '6',
		drawDate: new Date('2024-07-10'),
		numbers: [2, 14, 21, 32, 49],
		luckyNumber: 1,
	},
	{
		_id: '7',
		drawDate: new Date('2024-07-06'),
		numbers: [9, 16, 27, 38, 45],
		luckyNumber: 7,
	},
	{
		_id: '8',
		drawDate: new Date('2024-07-03'),
		numbers: [4, 13, 23, 34, 42],
		luckyNumber: 5,
	},
	{
		_id: '9',
		drawDate: new Date('2024-06-29'),
		numbers: [6, 17, 29, 36, 48],
		luckyNumber: 3,
	},
	{
		_id: '10',
		drawDate: new Date('2024-06-26'),
		numbers: [10, 20, 30, 40, 41],
		luckyNumber: 10,
	},
	{
		_id: '11',
		drawDate: new Date('2024-06-22'),
		numbers: [2, 11, 19, 28, 35],
		luckyNumber: 4,
	},
	{
		_id: '12',
		drawDate: new Date('2024-06-19'),
		numbers: [7, 15, 23, 31, 44],
		luckyNumber: 8,
	},
	{
		_id: '13',
		drawDate: new Date('2024-06-15'),
		numbers: [1, 12, 26, 33, 47],
		luckyNumber: 2,
	},
	{
		_id: '14',
		drawDate: new Date('2024-06-12'),
		numbers: [5, 18, 24, 37, 49],
		luckyNumber: 6,
	},
	{
		_id: '15',
		drawDate: new Date('2024-06-08'),
		numbers: [3, 14, 22, 39, 45],
		luckyNumber: 9,
	},
	{
		_id: '16',
		drawDate: new Date('2024-06-05'),
		numbers: [8, 16, 25, 32, 42],
		luckyNumber: 1,
	},
	{
		_id: '17',
		drawDate: new Date('2024-06-01'),
		numbers: [4, 13, 21, 34, 46],
		luckyNumber: 7,
	},
	{
		_id: '18',
		drawDate: new Date('2024-05-29'),
		numbers: [9, 17, 27, 36, 43],
		luckyNumber: 5,
	},
	{
		_id: '19',
		drawDate: new Date('2024-05-25'),
		numbers: [6, 19, 29, 38, 48],
		luckyNumber: 3,
	},
	{
		_id: '20',
		drawDate: new Date('2024-05-22'),
		numbers: [11, 20, 30, 41, 47],
		luckyNumber: 10,
	}
];

// Mock analysis service that works without database
export class MockAnalysisService {
	/**
	 * Generate mock frequency analysis
	 */
	getFrequencies(): [number, number][] {
		const frequencies = new Map<number, number>();
		
		mockLotteryDraws.forEach(draw => {
			const allNumbers = [...draw.numbers, draw.luckyNumber];
			allNumbers.forEach(num => {
				frequencies.set(num, (frequencies.get(num) || 0) + 1);
			});
		});

		return Array.from(frequencies.entries())
			.sort((a, b) => b[1] - a[1])
			.slice(0, 20);
	}

	/**
	 * Generate mock pair analysis
	 */
	getPairs(): [string, number][] {
		const pairs = new Map<string, number>();
		
		mockLotteryDraws.forEach(draw => {
			const allNumbers = [...draw.numbers, draw.luckyNumber];
			for (let i = 0; i < allNumbers.length; i++) {
				for (let j = i + 1; j < allNumbers.length; j++) {
					const pair = [allNumbers[i], allNumbers[j]].sort().join(',');
					pairs.set(pair, (pairs.get(pair) || 0) + 1);
				}
			}
		});

		return Array.from(pairs.entries())
			.sort((a, b) => b[1] - a[1])
			.slice(0, 15);
	}

	/**
	 * Generate mock gap analysis
	 */
	getGaps(): [number, number][] {
		const lastSeen = new Map<number, number>();
		const gaps = new Map<number, number>();

		mockLotteryDraws.forEach((draw, index) => {
			const allNumbers = [...draw.numbers, draw.luckyNumber];
			allNumbers.forEach(num => {
				if (lastSeen.has(num)) {
					const gap = index - (lastSeen.get(num) as number);
					gaps.set(num, gap);
				}
				lastSeen.set(num, index);
			});
		});

		return Array.from(gaps.entries())
			.sort((a, b) => a[1] - b[1])
			.slice(0, 15);
	}

	/**
	 * Generate suggested numbers based on mock analysis
	 */
	getSuggestedNumbers(): number[] {
		const frequencies = this.getFrequencies();
		const topNumbers = frequencies.slice(0, 10).map(([num]) => num);
		
		// Add some randomness to make it interesting
		const randomNumbers: number[] = [];
		while (randomNumbers.length < 6) {
			const num = Math.floor(Math.random() * 49) + 1;
			if (!randomNumbers.includes(num)) {
				randomNumbers.push(num);
			}
		}

		// Combine top frequent numbers with some random ones
		const suggested = [...topNumbers.slice(0, 4), ...randomNumbers.slice(0, 2)];
		return suggested.slice(0, 6);
	}

	/**
	 * Get comprehensive mock analysis data
	 */
	getComprehensiveAnalysis() {
		return {
			frequencies: this.getFrequencies(),
			pairs: this.getPairs(),
			gaps: this.getGaps(),
			sequences: [] as [string, number][],
			clusters: [] as [string, number][],
			delays: [] as [number, number][],
			slidingFrequencies: this.getFrequencies().slice(0, 10),
			markovChainAnalysis: [] as [number, number][],
			cycleAnalysis: [] as [number, number][],
			sumAnalysis: [] as [number, number][],
			parityAnalysis: [] as [string, number][],
			spacingAnalysis: [] as [number, number][],
			endingAnalysis: [] as [number, number][],
			groupAnalysis: [] as [number, number][],
			weightedRandomNumbers: this.getSuggestedNumbers(),
			suggestedNumbers: this.getSuggestedNumbers()
		};
	}
}

// In-memory storage for new draws added during the session
let inMemoryDraws: LotoDraw[] = [...mockLotteryDraws];

// Mock data service with add functionality
export class MockDataService {
	/**
	 * Get all draws (mock + in-memory)
	 */
	getAllDraws(): LotoDraw[] {
		return [...inMemoryDraws].sort((a, b) => 
			new Date(b.drawDate).getTime() - new Date(a.drawDate).getTime()
		);
	}

	/**
	 * Add a new draw to in-memory storage
	 */
	addDraw(draw: Omit<LotoDraw, '_id'>): LotoDraw {
		// Generate new ID
		const newId = (inMemoryDraws.length + 1).toString();
		const newDraw: LotoDraw = {
			...draw,
			_id: newId,
			drawDate: typeof draw.drawDate === 'string' ? new Date(draw.drawDate) : draw.drawDate,
		};

		// Add to in-memory storage
		inMemoryDraws.unshift(newDraw);
		
		return newDraw;
	}

	/**
	 * Check if draw exists for a specific date
	 */
	findDrawByDate(date: Date): LotoDraw | null {
		const targetDate = new Date(date).toDateString();
		return inMemoryDraws.find(draw => 
			new Date(draw.drawDate).toDateString() === targetDate
		) || null;
	}

	/**
	 * Get draws with pagination and filtering
	 */
	getDraws(limit = 50, offset = 0, startDate?: string, endDate?: string): {
		draws: LotoDraw[];
		totalCount: number;
	} {
		let filteredDraws = inMemoryDraws;

		// Apply date filtering
		if (startDate || endDate) {
			filteredDraws = inMemoryDraws.filter(draw => {
				const drawDate = new Date(draw.drawDate);
				if (startDate && drawDate < new Date(startDate)) return false;
				if (endDate && drawDate > new Date(endDate)) return false;
				return true;
			});
		}

		// Apply pagination
		const paginatedDraws = filteredDraws.slice(offset, offset + limit);

		return {
			draws: paginatedDraws,
			totalCount: filteredDraws.length
		};
	}

	/**
	 * Bulk import draws (for API integration)
	 */
	importDraws(draws: Omit<LotoDraw, '_id'>[]): {
		imported: number;
		skipped: number;
	} {
		let imported = 0;
		let skipped = 0;

		draws.forEach(draw => {
			const existingDraw = this.findDrawByDate(new Date(draw.drawDate));
			if (existingDraw) {
				skipped++;
			} else {
				this.addDraw(draw);
				imported++;
			}
		});

		return { imported, skipped };
	}

	/**
	 * Reset to original mock data (for testing)
	 */
	reset(): void {
		inMemoryDraws = [...mockLotteryDraws];
	}
}

export const mockAnalysisService = new MockAnalysisService();
export const mockDataService = new MockDataService();