import dbConnect from './mongodb';
import Loto from '../models/loto';

export async function getNumberFrequencies() {
	await dbConnect();
	const draws = await Loto.find({}).lean();

	const frequencyMap = new Map<number, number>();

	draws.forEach((draw) => {
		draw.numbers.forEach((num: number) => {
			frequencyMap.set(num, (frequencyMap.get(num) || 0) + 1);
		});
	});

	return Array.from(frequencyMap.entries()).sort((a, b) => b[1] - a[1]);
}

export async function getFrequentPairs() {
	await dbConnect();
	const draws = await Loto.find({}).lean();

	const pairMap = new Map<string, number>();

	draws.forEach((draw) => {
		const numbers = draw.numbers;
		for (let i = 0; i < numbers.length; i++) {
			for (let j = i + 1; j < numbers.length; j++) {
				const pair = [numbers[i], numbers[j]].sort().join(',');
				pairMap.set(pair, (pairMap.get(pair) || 0) + 1);
			}
		}
	});

	return Array.from(pairMap.entries()).sort((a, b) => b[1] - a[1]);
}

export async function getGapAnalysis() {
	await dbConnect();
	const draws = await Loto.find({}).lean();

	const lastSeen = new Map<number, number>();
	const gaps = new Map<number, number>();

	draws.forEach((draw, index) => {
		draw.numbers.forEach((num: number) => {
			if (lastSeen.has(num)) {
				const gap = index - (lastSeen.get(num) as number);
				gaps.set(num, gap);
			}
			lastSeen.set(num, index);
		});
	});

	return Array.from(gaps.entries()).sort((a, b) => a[1] - b[1]);
}

export async function getSequentialAnalysis() {
	await dbConnect();
	const draws = await Loto.find({}).lean();

	const sequenceMap = new Map<string, number>();

	draws.forEach((draw) => {
		const sortedNumbers = draw.numbers.sort((a: number, b: number) => a - b);
		for (let i = 0; i < sortedNumbers.length - 1; i++) {
			if (sortedNumbers[i + 1] === sortedNumbers[i] + 1) {
				const sequence = `${sortedNumbers[i]},${sortedNumbers[i + 1]}`;
				sequenceMap.set(sequence, (sequenceMap.get(sequence) || 0) + 1);
			}
		}
	});

	return Array.from(sequenceMap.entries()).sort((a, b) => b[1] - a[1]);
}

export async function getClusterAnalysis() {
	await dbConnect();
	const draws = await Loto.find({}).lean();

	const clusterMap = new Map<string, number>();

	draws.forEach((draw) => {
		const sortedNumbers = draw.numbers.sort((a: number, b: number) => a - b);
		for (let i = 0; i < sortedNumbers.length; i++) {
			for (let j = i + 1; j < sortedNumbers.length; j++) {
				for (let k = j + 1; k < sortedNumbers.length; k++) {
					const cluster = [sortedNumbers[i], sortedNumbers[j], sortedNumbers[k]]
						.sort()
						.join(',');
					clusterMap.set(cluster, (clusterMap.get(cluster) || 0) + 1);
				}
			}
		}
	});

	return Array.from(clusterMap.entries()).sort((a, b) => b[1] - a[1]);
}

export async function getDelayAnalysis() {
	await dbConnect();
	const draws = await Loto.find({}).lean();

	const lastSeen = new Map<number, number>();
	const delays = new Map<number, number>();
	const currentIndex = draws.length - 1;

	draws.forEach((draw, index) => {
		draw.numbers.forEach((num: number) => {
			lastSeen.set(num, index);
		});
	});

	lastSeen.forEach((index, num) => {
		const delay = currentIndex - index;
		delays.set(num, delay);
	});

	return Array.from(delays.entries()).sort((a, b) => b[1] - a[1]);
}

export async function getSlidingFrequencyAnalysis(windowSize = 10) {
	await dbConnect();
	const draws = await Loto.find({}).sort({ _id: -1 }).limit(windowSize).lean();

	const frequencyMap = new Map<number, number>();

	draws.forEach((draw) => {
		draw.numbers.forEach((num: number) => {
			frequencyMap.set(num, (frequencyMap.get(num) || 0) + 1);
		});
	});

	return Array.from(frequencyMap.entries()).sort((a, b) => b[1] - a[1]);
}

export async function getMarkovChainAnalysis() {
	await dbConnect();
	const draws = await Loto.find({}).lean();

	const transitionMap = new Map<string, Map<number, number>>();

	draws.forEach((draw, index) => {
		if (index > 0) {
			const prevDrawNumbers = draws[index - 1].numbers;
			draw.numbers.forEach((num: number) => {
				prevDrawNumbers.forEach((prevNum: any) => {
					const key = `${prevNum}`;
					if (!transitionMap.has(key)) {
						transitionMap.set(key, new Map<number, number>());
					}
					const countMap = transitionMap.get(key);
					countMap!.set(num, (countMap!.get(num) || 0) + 1);
				});
			});
		}
	});

	const probabilities = new Map<number, number>();
	const lastDraw = draws[draws.length - 1].numbers;

	lastDraw.forEach((num: any) => {
		const transitions = transitionMap.get(`${num}`);
		if (transitions) {
			transitions.forEach((count, nextNum) => {
				probabilities.set(nextNum, (probabilities.get(nextNum) || 0) + count);
			});
		}
	});

	return Array.from(probabilities.entries()).sort((a, b) => b[1] - a[1]);
}

export async function getCycleAnalysis(cycleLength = 10) {
	await dbConnect();
	const draws = await Loto.find({}).lean();

	const cycleFrequencyMap = new Map<number, number[]>();

	draws.forEach((draw, index) => {
		const cycleIndex = index % cycleLength;
		draw.numbers.forEach((num: number) => {
			if (!cycleFrequencyMap.has(num)) {
				cycleFrequencyMap.set(num, new Array(cycleLength).fill(0));
			}
			cycleFrequencyMap.get(num)![cycleIndex]++;
		});
	});

	const currentCycleIndex = draws.length % cycleLength;
	const scores = new Map<number, number>();

	cycleFrequencyMap.forEach((frequencies, num) => {
		scores.set(num, frequencies[currentCycleIndex]);
	});

	return Array.from(scores.entries()).sort((a, b) => b[1] - a[1]);
}

export async function getSumAnalysis() {
	await dbConnect();
	const draws = await Loto.find({}).lean();

	const sumFrequencyMap = new Map<number, number>();

	draws.forEach((draw) => {
		const sum = draw.numbers.reduce((acc: any, num: any) => acc + num, 0);
		sumFrequencyMap.set(sum, (sumFrequencyMap.get(sum) || 0) + 1);
	});

	return Array.from(sumFrequencyMap.entries()).sort((a, b) => b[1] - a[1]);
}

export async function getParityAnalysis() {
	await dbConnect();
	const draws = await Loto.find({}).lean();

	const parityMap = new Map<string, number>();

	draws.forEach((draw) => {
		const numEven = draw.numbers.filter((num: number) => num % 2 === 0).length;
		const numOdd = draw.numbers.length - numEven;
		const parityKey = `${numEven},${numOdd}`;
		parityMap.set(parityKey, (parityMap.get(parityKey) || 0) + 1);
	});

	return Array.from(parityMap.entries()).sort((a, b) => b[1] - a[1]);
}

export async function getSpacingAnalysis() {
	await dbConnect();
	const draws = await Loto.find({}).lean();

	const spacingMap = new Map<number, number>();

	draws.forEach((draw) => {
		const sortedNumbers = draw.numbers.sort((a: number, b: number) => a - b);
		for (let i = 0; i < sortedNumbers.length - 1; i++) {
			const spacing = sortedNumbers[i + 1] - sortedNumbers[i];
			spacingMap.set(spacing, (spacingMap.get(spacing) || 0) + 1);
		}
	});

	return Array.from(spacingMap.entries()).sort((a, b) => b[1] - a[1]);
}

export async function getEndingAnalysis() {
	await dbConnect();
	const draws = await Loto.find({}).lean();

	const endingMap = new Map<number, number>();

	draws.forEach((draw) => {
		draw.numbers.forEach((num: number) => {
			const ending = num % 10;
			endingMap.set(ending, (endingMap.get(ending) || 0) + 1);
		});
	});

	return Array.from(endingMap.entries()).sort((a, b) => b[1] - a[1]);
}

export async function getGroupAnalysis(groupSize = 10) {
	await dbConnect();
	const draws = await Loto.find({}).lean();

	const groupMap = new Map<number, number>();

	draws.forEach((draw) => {
		draw.numbers.forEach((num: number) => {
			const group = Math.floor((num - 1) / groupSize) + 1;
			groupMap.set(group, (groupMap.get(group) || 0) + 1);
		});
	});

	return Array.from(groupMap.entries()).sort((a, b) => b[1] - a[1]);
}

export async function getWeightedRandomNumbers() {
	const frequencies = await getNumberFrequencies();

	const totalFrequency = frequencies.reduce((sum, [, freq]) => sum + freq, 0);
	const probabilities = frequencies.map(([num, freq]) => [
		num,
		freq / totalFrequency,
	]);

	const weightedRandomNumbers: number[] = [];
	while (weightedRandomNumbers.length < 6) {
		const random = Math.random();
		let cumulativeProbability = 0;
		for (const [num, prob] of probabilities) {
			cumulativeProbability += prob;
			if (random < cumulativeProbability) {
				if (!weightedRandomNumbers.includes(num)) {
					weightedRandomNumbers.push(num);
				}
				break;
			}
		}
	}

	return weightedRandomNumbers;
}

// export async function getSuggestedNumbers() {

// 	const suggestedNumbers = Array.from(scoreMap.entries())
// 		.sort((a, b) => b[1] - a[1])
// 		.slice(0, 6)
// 		.map(([num]) => num);

// 	return {
// 		frequencies,
// 		pairs,
// 		gaps,
// 		sequences,
// 		clusters,
// 		delays,
// 		slidingFrequencies,
// 		markovChainAnalysis,
// 		cycleAnalysis,
// 		sumAnalysis,
// 		parityAnalysis,
// 		spacingAnalysis,
// 		endingAnalysis,
// 		groupAnalysis,
// 		weightedRandomNumbers,
// 		suggestedNumbers,
// 	};
// }

export async function getSuggestedNumbers() {
	// ... (obtenir les résultats de toutes les analyses)
	const frequencies = await getNumberFrequencies();
	const pairs = await getFrequentPairs();
	const gaps = await getGapAnalysis();
	const sequences = await getSequentialAnalysis();
	const clusters = await getClusterAnalysis();
	const delays = await getDelayAnalysis();
	const slidingFrequencies = await getSlidingFrequencyAnalysis();
	const markovChainAnalysis = await getMarkovChainAnalysis();
	const cycleAnalysis = await getCycleAnalysis();
	const sumAnalysis = await getSumAnalysis();
	const parityAnalysis = await getParityAnalysis();
	const spacingAnalysis = await getSpacingAnalysis();
	const endingAnalysis = await getEndingAnalysis();
	const groupAnalysis = await getGroupAnalysis();
	const weightedRandomNumbers = await getWeightedRandomNumbers();

	const scoreMap = new Map<number, number>();

	// ... (déclarer analyses, analysesNames, normalizeScores, weights)

	// Attribuer des scores basés sur toutes les analyses précédentes
	const analyses = [
		frequencies,
		pairs,
		gaps,
		sequences,
		clusters,
		delays,
		slidingFrequencies,
		markovChainAnalysis,
		cycleAnalysis,
		sumAnalysis,
		parityAnalysis,
		spacingAnalysis,
		endingAnalysis,
		groupAnalysis,
	];

	const analysesNames = [
		'frequencies',
		'pairs',
		'gaps',
		'sequences',
		'clusters',
		'delays',
		'slidingFrequencies',
		'markovChainAnalysis',
		'cycleAnalysis',
		'sumAnalysis',
		'parityAnalysis',
		'spacingAnalysis',
		'endingAnalysis',
		'groupAnalysis',
	];

	// Normaliser les scores de chaque analyse
	const normalizeScores = (analysis: [any, number][]) => {
		const values = analysis.map(([, value]) => value);
		const minValue = Math.min(...values);
		const maxValue = Math.max(...values);

		return analysis.map(([item, value]) => {
			const normalizedValue = (value - minValue) / (maxValue - minValue);
			return [item, normalizedValue];
		});
	};

	// Appliquer des poids aux analyses (vous pouvez ajuster ces valeurs)
	const weights = {
		frequencies: 0.3,
		pairs: 0.2,
		gaps: 0.15,
		sequences: 0.1,
		clusters: 0.1,
		delays: 0.05,
		slidingFrequencies: 0.05,
		markovChainAnalysis: 0.025,
		cycleAnalysis: 0.025,
		sumAnalysis: 0.1,
		parityAnalysis: 0.1,
		spacingAnalysis: 0.05,
		endingAnalysis: 0.05,
		groupAnalysis: 0.05,
	};

	// Normaliser les scores de chaque analyse
	const normalizedAnalyses = analyses.map((analysis) =>
		normalizeScores(analysis)
	);

	// Combiner les scores avec pondération (exclure weightedRandomNumbers)
	normalizedAnalyses.slice(0, -1).forEach((analysis, index) => {
		const weight = weights[analysesNames[index] as keyof typeof weights];
		analysis.slice(0, 10).forEach(([num, normalizedValue]) => {
			scoreMap.set(
				Number(num),
				(scoreMap.get(Number(num)) || 0) + normalizedValue * weight
			);
		});
	});

	// Influencer les scores avec weightedRandomNumbers (exemple)
	const weightedRandomBonus = 0.1;
	weightedRandomNumbers.forEach((num) => {
		scoreMap.set(num, (scoreMap.get(num) || 0) + weightedRandomBonus);
	});

	// Trier et sélectionner les numéros suggérés, en gérant les égalités
	const suggestedNumbers = Array.from(scoreMap.entries())
		.sort((a, b) => {
			if (b[1] !== a[1]) {
				return b[1] - a[1];
			} else {
				const freqA = frequencies.find(([num]) => num === a[0])?.[1] || 0;
				const freqB = frequencies.find(([num]) => num === b[0])?.[1] || 0;
				return freqB - freqA;
			}
		})
		.slice(0, 6) // Prendre les 6 premiers numéros après le tri
		.map(([num]) => num);

	return {
		frequencies,
		pairs,
		gaps,
		sequences,
		clusters,
		delays,
		slidingFrequencies,
		markovChainAnalysis,
		cycleAnalysis,
		sumAnalysis,
		parityAnalysis,
		spacingAnalysis,
		endingAnalysis,
		groupAnalysis,
		weightedRandomNumbers,
		suggestedNumbers,
	};
}
