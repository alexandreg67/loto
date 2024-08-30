import dbConnect from './mongodb';
import Loto from '../models/loto';
import { log } from 'console';

// getNumberFrequencies
export async function getNumberFrequencies() {
	await dbConnect();
	const draws = await Loto.find({}).lean();

	const frequencyMap = new Map<number, number>();

	draws.forEach((draw) => {
		// Combiner les numéros principaux et le numéro chance
		const allNumbers = [...draw.numbers, draw.luckyNumber];
		allNumbers.forEach((num: number) => {
			frequencyMap.set(num, (frequencyMap.get(num) || 0) + 1);
		});
	});

	return Array.from(frequencyMap.entries()).sort((a, b) => b[1] - a[1]);
}

// getFrequentPairs
export async function getFrequentPairs() {
	await dbConnect();
	const draws = await Loto.find({}).lean();

	const pairMap = new Map<string, number>();

	draws.forEach((draw) => {
		// Combiner les numéros principaux et le numéro chance
		const allNumbers = [...draw.numbers, draw.luckyNumber];
		for (let i = 0; i < allNumbers.length; i++) {
			for (let j = i + 1; j < allNumbers.length; j++) {
				const pair = [allNumbers[i], allNumbers[j]].sort().join(',');
				pairMap.set(pair, (pairMap.get(pair) || 0) + 1);
			}
		}
	});

	return Array.from(pairMap.entries()).sort((a, b) => b[1] - a[1]);
}

// getGapAnalysis - Inclus le numéro chance dans l'analyse des écarts
export async function getGapAnalysis() {
	await dbConnect();
	const draws = await Loto.find({}).lean();

	const lastSeen = new Map<number, number>();
	const gaps = new Map<number, number>();

	draws.forEach((draw, index) => {
		// Combiner les numéros principaux et le numéro chance
		const allNumbers = [...draw.numbers, draw.luckyNumber];
		allNumbers.forEach((num: number) => {
			if (lastSeen.has(num)) {
				const gap = index - (lastSeen.get(num) as number);
				gaps.set(num, gap);
			}
			lastSeen.set(num, index);
		});
	});

	return Array.from(gaps.entries()).sort((a, b) => a[1] - b[1]);
}

// getSequentialAnalysis - Garde l'analyse sur les numéros principaux uniquement
export async function getSequentialAnalysis() {
	await dbConnect();
	const draws = await Loto.find({}).lean();

	const sequenceMap = new Map<string, number>();

	draws.forEach((draw) => {
		const sortedNumbers = draw.numbers.sort((a: number, b: number) => a - b); // Utiliser uniquement les numéros principaux
		for (let i = 0; i < sortedNumbers.length - 1; i++) {
			if (sortedNumbers[i + 1] === sortedNumbers[i] + 1) {
				const sequence = `${sortedNumbers[i]},${sortedNumbers[i + 1]}`;
				sequenceMap.set(sequence, (sequenceMap.get(sequence) || 0) + 1);
			}
		}
	});

	return Array.from(sequenceMap.entries()).sort((a, b) => b[1] - a[1]);
}

// getClusterAnalysis - Inclus le numéro chance dans l'analyse des clusters
export async function getClusterAnalysis() {
	await dbConnect();
	const draws = await Loto.find({}).lean();

	const clusterMap = new Map<string, number>();

	draws.forEach((draw) => {
		// Combiner les numéros principaux et le numéro chance
		const allNumbers = [...draw.numbers, draw.luckyNumber];
		const sortedNumbers = allNumbers.sort((a: number, b: number) => a - b);
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

// getDelayAnalysis - Inclus le numéro chance dans l'analyse des retards
export async function getDelayAnalysis() {
	await dbConnect();
	const draws = await Loto.find({}).lean();

	const lastSeen = new Map<number, number>();
	const delays = new Map<number, number>();
	const currentIndex = draws.length - 1;

	draws.forEach((draw, index) => {
		// Combiner les numéros principaux et le numéro chance
		const allNumbers = [...draw.numbers, draw.luckyNumber];
		allNumbers.forEach((num: number) => {
			lastSeen.set(num, index);
		});
	});

	lastSeen.forEach((index, num) => {
		const delay = currentIndex - index;
		delays.set(num, delay);
	});

	return Array.from(delays.entries()).sort((a, b) => b[1] - a[1]);
}

// getSlidingFrequencyAnalysis - Inclus le numéro chance
export async function getSlidingFrequencyAnalysis(windowSize = 10) {
	await dbConnect();
	const draws = await Loto.find({}).sort({ _id: -1 }).limit(windowSize).lean();

	const frequencyMap = new Map<number, number>();

	draws.forEach((draw) => {
		// Combiner les numéros principaux et le numéro chance
		const allNumbers = [...draw.numbers, draw.luckyNumber];
		allNumbers.forEach((num: number) => {
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
			// Combiner les numéros principaux et le numéro chance du tirage précédent
			const prevDrawNumbers = [
				...draws[index - 1].numbers,
				draws[index - 1].luckyNumber,
			];
			// Combiner les numéros principaux et le numéro chance du tirage actuel
			const currentDrawNumbers = [...draw.numbers, draw.luckyNumber];

			currentDrawNumbers.forEach((num) => {
				prevDrawNumbers.forEach((prevNum) => {
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
	// Combiner les numéros principaux et le numéro chance du dernier tirage
	const lastDraw = [
		...draws[draws.length - 1].numbers,
		draws[draws.length - 1].luckyNumber,
	];

	lastDraw.forEach((num) => {
		const transitions = transitionMap.get(`${num}`);
		if (transitions) {
			transitions.forEach((count, nextNum) => {
				probabilities.set(nextNum, (probabilities.get(nextNum) || 0) + count);
			});
		}
	});

	return Array.from(probabilities.entries()).sort((a, b) => b[1] - a[1]);
}

// getCycleAnalysis - Inclure le numéro chance dans l'analyse des cycles
export async function getCycleAnalysis(cycleLength = 10) {
	await dbConnect();
	const draws = await Loto.find({}).lean();

	const cycleFrequencyMap = new Map<number, number[]>();

	draws.forEach((draw, index) => {
		const cycleIndex = index % cycleLength;
		// Combiner les numéros principaux et le numéro chance
		const allNumbers = [...draw.numbers, draw.luckyNumber];
		allNumbers.forEach((num) => {
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

	console.log('je suis dans getCycleAnalysis et je log scores', scores);

	return Array.from(scores.entries()).sort((a, b) => b[1] - a[1]);
}

// getSumAnalysis - Inclure le numéro chance dans le calcul de la somme
export async function getSumAnalysis() {
	await dbConnect();
	const draws = await Loto.find({}).lean();

	const sumFrequencyMap = new Map<number, number>();

	draws.forEach((draw) => {
		// Inclure le numéro chance dans le calcul de la somme
		const sum = [...draw.numbers, draw.luckyNumber].reduce(
			(acc, num) => acc + num,
			0
		);
		sumFrequencyMap.set(sum, (sumFrequencyMap.get(sum) || 0) + 1);
	});

	return Array.from(sumFrequencyMap.entries()).sort((a, b) => b[1] - a[1]);
}

// getParityAnalysis - Inclure le numéro chance dans l'analyse de parité
export async function getParityAnalysis() {
	await dbConnect();
	const draws = await Loto.find({}).lean();

	const parityMap = new Map<string, number>();

	draws.forEach((draw) => {
		// Inclure le numéro chance dans le comptage de pairs/impairs
		const allNumbers = [...draw.numbers, draw.luckyNumber];
		const numEven = allNumbers.filter((num) => num % 2 === 0).length;
		const numOdd = allNumbers.length - numEven;
		const parityKey = `${numEven},${numOdd}`;
		parityMap.set(parityKey, (parityMap.get(parityKey) || 0) + 1);
	});

	return Array.from(parityMap.entries()).sort((a, b) => b[1] - a[1]);
}

// getSpacingAnalysis - Inclure le numéro chance
export async function getSpacingAnalysis() {
	await dbConnect();
	const draws = await Loto.find({}).lean();

	const spacingMap = new Map<number, number>();

	draws.forEach((draw) => {
		// Combiner les numéros principaux et le numéro chance, puis trier
		const allNumbers = [...draw.numbers, draw.luckyNumber].sort(
			(a, b) => a - b
		);
		for (let i = 0; i < allNumbers.length - 1; i++) {
			const spacing = allNumbers[i + 1] - allNumbers[i];
			spacingMap.set(spacing, (spacingMap.get(spacing) || 0) + 1);
		}
	});

	return Array.from(spacingMap.entries()).sort((a, b) => b[1] - a[1]);
}

// getEndingAnalysis - Inclure le numéro chance
export async function getEndingAnalysis() {
	await dbConnect();
	const draws = await Loto.find({}).lean();

	const endingMap = new Map<number, number>();

	draws.forEach((draw) => {
		// Inclure le numéro chance dans l'analyse des terminaisons
		const allNumbers = [...draw.numbers, draw.luckyNumber];
		allNumbers.forEach((num) => {
			const ending = num % 10;
			endingMap.set(ending, (endingMap.get(ending) || 0) + 1);
		});
	});

	return Array.from(endingMap.entries()).sort((a, b) => b[1] - a[1]);
}

// getGroupAnalysis - Inclure le numéro chance
export async function getGroupAnalysis(groupSize = 10) {
	await dbConnect();
	const draws = await Loto.find({}).lean();

	const groupMap = new Map<number, number>();

	draws.forEach((draw) => {
		// Inclure le numéro chance dans l'analyse des groupes
		const allNumbers = [...draw.numbers, draw.luckyNumber];
		allNumbers.forEach((num) => {
			const group = Math.floor((num - 1) / groupSize) + 1;
			groupMap.set(group, (groupMap.get(group) || 0) + 1);
		});
	});

	return Array.from(groupMap.entries()).sort((a, b) => b[1] - a[1]);
}

export async function getWeightedRandomNumbers() {
	const frequencies = await getNumberFrequencies(); // Cette fonction devrait maintenant inclure le numéro chance

	const totalFrequency = frequencies.reduce((sum, [, freq]) => sum + freq, 0);
	const probabilities = frequencies.map(([num, freq]) => [
		num,
		freq / totalFrequency,
	]);

	const weightedRandomNumbers: number[] = [];
	while (weightedRandomNumbers.length < 6) {
		// On veut 6 numéros au total (5 principaux + 1 chance)
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

	const normalizeScores = (analysis: [any, number][]) => {
		const values = analysis.map(([, value]) => value);
		const minValue = Math.min(...values);
		const maxValue = Math.max(...values);

		// Calculer la variance des valeurs
		const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
		const variance =
			values.reduce((sum, val) => sum + (val - mean) ** 2, 0) / values.length;

		// Si la variance est très petite (vous pouvez ajuster ce seuil),
		// on considère que toutes les valeurs sont égales
		if (variance < 1e-6) {
			return analysis.map(([item]) => [item, 0]);
		} else {
			return analysis.map(([item, value]) => {
				const normalizedValue = (value - minValue) / (maxValue - minValue);
				return [item, normalizedValue];
			});
		}
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

	console.log(
		'je suis dans suggestedNumbers et je log normalizedAnalyses',
		normalizedAnalyses
	);

	// Combiner les scores avec pondération (exclure weightedRandomNumbers)
	normalizedAnalyses.slice(0, -1).forEach((analysis, index) => {
		const weight = weights[analysesNames[index] as keyof typeof weights];
		analysis.slice(0, 10).forEach(([num, normalizedValue]) => {
			// Vérifier si 'num' et 'normalizedValue' sont des nombres valides
			if (
				typeof num === 'number' &&
				!isNaN(num) &&
				typeof normalizedValue === 'number' &&
				!isNaN(normalizedValue)
			) {
				scoreMap.set(num, (scoreMap.get(num) || 0) + normalizedValue * weight);
			} else {
				// Gérer le cas où les valeurs ne sont pas valides
				console.error(
					`Analyse ${analysesNames[index]} a produit des valeurs invalides pour le numéro ${num} :`,
					analysis
				);
			}
		});
	});

	console.log('je suis dans suggestedNumbers et je log scoreMap', scoreMap);

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

	console.log(
		'je suis dans suggestedNumbers et je log suggestedNumbers',
		suggestedNumbers
	);

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
