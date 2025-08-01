import dbConnect from './mongodb';
import Loto from '../models/loto';
import { CombinedAnalysisData } from '@/types';

export class OptimizedAnalysis {
	private cache = new Map<string, any>();
	private cacheTimeout = 5 * 60 * 1000; // 5 minutes cache

	/**
	 * Get comprehensive analysis using optimized aggregation pipelines
	 */
	async getComprehensiveAnalysis(): Promise<CombinedAnalysisData> {
		const cacheKey = 'comprehensive-analysis';
		const cached = this.cache.get(cacheKey);
		
		if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
			return cached.data;
		}

		await dbConnect();

		// Single aggregation pipeline to get all basic statistics
		const pipeline = [
			{
				$addFields: {
					allNumbers: {
						$concatArrays: ['$numbers', ['$luckyNumber']]
					}
				}
			},
			{
				$facet: {
					// Frequency analysis
					frequencies: [
						{ $unwind: '$allNumbers' },
						{
							$group: {
								_id: '$allNumbers',
								count: { $sum: 1 }
							}
						},
						{ $sort: { count: -1 } },
						{
							$project: {
								_id: 0,
								number: '$_id',
								frequency: '$count'
							}
						}
					],
					// Gap analysis
					drawsForGap: [
						{
							$project: {
								drawDate: 1,
								allNumbers: 1,
								sortOrder: { $toLong: '$drawDate' }
							}
						},
						{ $sort: { sortOrder: 1 } }
					],
					// Pair analysis
					pairs: [
						{
							$addFields: {
								pairs: {
									$reduce: {
										input: { $range: [0, { $size: '$allNumbers' }] },
										initialValue: [],
										in: {
											$concatArrays: [
												'$$value',
												{
													$map: {
														input: { $range: [{ $add: ['$$this', 1] }, { $size: '$allNumbers' }] },
														as: 'j',
														in: {
															$arrayElemAt: [
																[
																	{ $arrayElemAt: ['$allNumbers', '$$this'] },
																	{ $arrayElemAt: ['$allNumbers', '$$j'] }
																],
																0
															]
														}
													}
												}
											]
										}
									}
								}
							}
						},
						{ $unwind: '$pairs' },
						{
							$group: {
								_id: {
									$concat: [
										{ $toString: { $min: '$pairs' } },
										',',
										{ $toString: { $max: '$pairs' } }
									]
								},
								count: { $sum: 1 }
							}
						},
						{ $sort: { count: -1 } }
					],
					// Sum analysis
					sums: [
						{
							$addFields: {
								totalSum: { $sum: '$allNumbers' }
							}
						},
						{
							$group: {
								_id: '$totalSum',
								count: { $sum: 1 }
							}
						},
						{ $sort: { count: -1 } }
					],
					// Most recent draws for delay analysis
					recentDraws: [
						{ $sort: { drawDate: -1 } },
						{ $limit: 50 }
					]
				}
			}
		];

		const [result] = await Loto.aggregate(pipeline as any);

		// Process frequencies
		const frequencies: [number, number][] = result.frequencies.map((item: any) => [
			item.number,
			item.frequency
		]);

		// Process pairs
		const pairs: [string, number][] = result.pairs.map((item: any) => [
			item._id,
			item.count
		]);

		// Calculate gaps using the sorted draws
		const gaps = await this.calculateGaps(result.drawsForGap);

		// Get additional analyses in parallel
		const [sequences, clusters, delays] = await Promise.all([
			this.getSequentialAnalysis(),
			this.getClusterAnalysis(),
			this.getDelayAnalysis(result.recentDraws)
		]);

		// Calculate sliding frequencies
		const slidingFrequencies = await this.getSlidingFrequencyAnalysis();

		// Advanced analyses
		const [markov, cycle, parity, spacing, ending, group] = await Promise.all([
			this.getMarkovChainAnalysis(),
			this.getCycleAnalysis(),
			this.getParityAnalysis(),
			this.getSpacingAnalysis(),
			this.getEndingAnalysis(),
			this.getGroupAnalysis()
		]);

		// Generate weighted random numbers and suggestions
		const weightedRandomNumbers = this.generateWeightedRandomNumbers(frequencies);
		const suggestedNumbers = this.calculateSuggestedNumbers({
			frequencies,
			pairs,
			gaps,
			sequences,
			clusters,
			delays,
			slidingFrequencies,
			markovChainAnalysis: markov,
			cycleAnalysis: cycle,
			sumAnalysis: result.sums.map((s: any) => [s._id, s.count]),
			parityAnalysis: parity,
			spacingAnalysis: spacing,
			endingAnalysis: ending,
			groupAnalysis: group,
			weightedRandomNumbers
		});

		const analysisResult: CombinedAnalysisData = {
			frequencies,
			pairs,
			gaps,
			sequences,
			clusters,
			delays,
			slidingFrequencies,
			markovChainAnalysis: markov,
			cycleAnalysis: cycle,
			sumAnalysis: result.sums.map((s: any) => [s._id, s.count]),
			parityAnalysis: parity,
			spacingAnalysis: spacing,
			endingAnalysis: ending,
			groupAnalysis: group,
			weightedRandomNumbers,
			suggestedNumbers
		};

		// Cache the result
		this.cache.set(cacheKey, {
			data: analysisResult,
			timestamp: Date.now()
		});

		return analysisResult;
	}

	private async calculateGaps(sortedDraws: any[]): Promise<[number, number][]> {
		const lastSeen = new Map<number, number>();
		const gaps = new Map<number, number>();

		sortedDraws.forEach((draw, index) => {
			draw.allNumbers.forEach((num: number) => {
				if (lastSeen.has(num)) {
					const gap = index - (lastSeen.get(num) as number);
					gaps.set(num, gap);
				}
				lastSeen.set(num, index);
			});
		});

		return Array.from(gaps.entries()).sort((a, b) => a[1] - b[1]);
	}

	private async getSequentialAnalysis(): Promise<[string, number][]> {
		const pipeline = [
			{
				$addFields: {
					sortedNumbers: {
						$sortArray: { input: '$numbers', sortBy: 1 }
					}
				}
			},
			{
				$addFields: {
					sequences: {
						$reduce: {
							input: { $range: [0, { $subtract: [{ $size: '$sortedNumbers' }, 1] }] },
							initialValue: [],
							in: {
								$cond: {
									if: {
										$eq: [
											{ $arrayElemAt: ['$sortedNumbers', { $add: ['$$this', 1] }] },
											{ $add: [{ $arrayElemAt: ['$sortedNumbers', '$$this'] }, 1] }
										]
									},
									then: {
										$concatArrays: [
											'$$value',
											[{
												$concat: [
													{ $toString: { $arrayElemAt: ['$sortedNumbers', '$$this'] } },
													',',
													{ $toString: { $arrayElemAt: ['$sortedNumbers', { $add: ['$$this', 1] }] } }
												]
											}]
										]
									},
									else: '$$value'
								}
							}
						}
					}
				}
			},
			{ $unwind: '$sequences' },
			{
				$group: {
					_id: '$sequences',
					count: { $sum: 1 }
				}
			},
			{ $sort: { count: -1 } }
		];

		const result = await Loto.aggregate(pipeline as any);
		return result.map((item: any) => [item._id, item.count]);
	}

	private async getClusterAnalysis(): Promise<[string, number][]> {
		// Simplified cluster analysis for performance
		const draws = await Loto.find({}).limit(100).lean();
		const clusterMap = new Map<string, number>();

		draws.forEach((draw) => {
			const allNumbers = [...draw.numbers, draw.luckyNumber].sort((a, b) => a - b);
			for (let i = 0; i < allNumbers.length - 2; i++) {
				for (let j = i + 1; j < allNumbers.length - 1; j++) {
					for (let k = j + 1; k < allNumbers.length; k++) {
						const cluster = [allNumbers[i], allNumbers[j], allNumbers[k]].join(',');
						clusterMap.set(cluster, (clusterMap.get(cluster) || 0) + 1);
					}
				}
			}
		});

		return Array.from(clusterMap.entries())
			.sort((a, b) => b[1] - a[1])
			.slice(0, 20);
	}

	private getDelayAnalysis(recentDraws: any[]): [number, number][] {
		const lastSeen = new Map<number, number>();
		const delays = new Map<number, number>();
		const currentIndex = recentDraws.length - 1;

		recentDraws.forEach((draw, index) => {
			draw.allNumbers.forEach((num: number) => {
				lastSeen.set(num, index);
			});
		});

		lastSeen.forEach((index, num) => {
			const delay = currentIndex - index;
			delays.set(num, delay);
		});

		return Array.from(delays.entries()).sort((a, b) => b[1] - a[1]);
	}

	private async getSlidingFrequencyAnalysis(windowSize = 10): Promise<[number, number][]> {
		const recentDraws = await Loto.find({}).sort({ drawDate: -1 }).limit(windowSize).lean();
		const frequencyMap = new Map<number, number>();

		recentDraws.forEach((draw) => {
			const allNumbers = [...draw.numbers, draw.luckyNumber];
			allNumbers.forEach((num) => {
				frequencyMap.set(num, (frequencyMap.get(num) || 0) + 1);
			});
		});

		return Array.from(frequencyMap.entries()).sort((a, b) => b[1] - a[1]);
	}

	// Placeholder implementations for other analyses - can be optimized further
	private async getMarkovChainAnalysis(): Promise<[number, number][]> {
		// Simplified implementation for performance
		return [];
	}

	private async getCycleAnalysis(): Promise<[number, number][]> {
		return [];
	}

	private async getParityAnalysis(): Promise<[string, number][]> {
		return [];
	}

	private async getSpacingAnalysis(): Promise<[number, number][]> {
		return [];
	}

	private async getEndingAnalysis(): Promise<[number, number][]> {
		return [];
	}

	private async getGroupAnalysis(): Promise<[number, number][]> {
		return [];
	}

	private generateWeightedRandomNumbers(frequencies: [number, number][]): number[] {
		const totalFrequency = frequencies.reduce((sum, [, freq]) => sum + freq, 0);
		const probabilities = frequencies.map(([num, freq]) => [num, freq / totalFrequency]);

		const weightedRandomNumbers: number[] = [];
		while (weightedRandomNumbers.length < 6) {
			const random = Math.random();
			let cumulativeProbability = 0;
			for (const [num, prob] of probabilities) {
				cumulativeProbability += prob as number;
				if (random < cumulativeProbability) {
					if (!weightedRandomNumbers.includes(num as number)) {
						weightedRandomNumbers.push(num as number);
					}
					break;
				}
			}
		}

		return weightedRandomNumbers;
	}

	private calculateSuggestedNumbers(analysisData: any): number[] {
		const scoreMap = new Map<number, number>();
		const weights = {
			frequencies: 0.3,
			pairs: 0.2,
			gaps: 0.15,
			sequences: 0.1,
			clusters: 0.1,
			delays: 0.05,
			slidingFrequencies: 0.1
		};

		// Score based on frequency analysis
		analysisData.frequencies.slice(0, 20).forEach(([num, freq]: [number, number], index: number) => {
			const score = (20 - index) / 20 * weights.frequencies;
			scoreMap.set(num, (scoreMap.get(num) || 0) + score);
		});

		// Score based on sliding frequencies
		analysisData.slidingFrequencies.slice(0, 15).forEach(([num, freq]: [number, number], index: number) => {
			const score = (15 - index) / 15 * weights.slidingFrequencies;
			scoreMap.set(num, (scoreMap.get(num) || 0) + score);
		});

		// Add bonus for weighted random numbers
		analysisData.weightedRandomNumbers.forEach((num: number) => {
			scoreMap.set(num, (scoreMap.get(num) || 0) + 0.05);
		});

		return Array.from(scoreMap.entries())
			.sort((a, b) => b[1] - a[1])
			.slice(0, 6)
			.map(([num]) => num);
	}

	/**
	 * Clear cache manually
	 */
	clearCache(): void {
		this.cache.clear();
	}
}

export const optimizedAnalysis = new OptimizedAnalysis();