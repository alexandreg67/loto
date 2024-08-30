'use client';

import { useEffect, useState } from 'react';

export default function Analysis() {
	const [analysis, setAnalysis] = useState<{
		sequences: any;
		gaps: any;
		pairs: any;
		frequencies: any;
		clusters: any;
		delays: any;
		slidingFrequencies: any;
		markovChainAnalysis: any;
		cycleAnalysis: any;
		suggestedNumbers: number[];
	} | null>(null);

	useEffect(() => {
		async function fetchAnalysis() {
			const response = await fetch('/api/analysis');
			const data = await response.json();
			if (data.success) {
				setAnalysis(data);
			} else {
				console.error(
					"Erreur lors de la récupération des données d'analyse:",
					data.message
				);
			}
		}

		fetchAnalysis();
	}, []);

	function displayTopResults(results: [any, number][], limit = 3) {
		const sortedResults = results.sort((a, b) => b[1] - a[1]);
		const topResults = sortedResults.slice(0, limit);

		// Gestion des égalités : si le dernier résultat affiché a le même score que d'autres,
		// les inclure également
		const lastDisplayedScore = topResults[topResults.length - 1][1];
		const remainingResults = sortedResults.slice(limit);
		const equalResults = remainingResults.filter(
			([, score]) => score === lastDisplayedScore
		);

		return (
			<ul className="space-y-2">
				{topResults.map(([item, freq]) => (
					<li key={item} className="text-lg">
						<span className="font-bold text-primary">{item}</span> : {freq} fois
					</li>
				))}
				{equalResults.length > 0 && (
					<li className="text-lg">
						Autres avec la même fréquence :{' '}
						{equalResults.map(([item]) => item).join(', ')}
					</li>
				)}
			</ul>
		);
	}

	if (!analysis) {
		return <p>Chargement des donn&eacute;es d&rsquo;analyse...</p>;
	}

	return (
		<div className="min-h-screen bg-gray-100 text-gray-900 py-12">
			<main className="container mx-auto px-4">
				<h1 className="text-4xl font-bold mb-8 text-center">
					Analyse des Tirages
				</h1>

				<section className="mb-12 bg-white p-6 shadow-lg rounded-lg">
					<h2 className="text-2xl font-bold mb-4">Numéros Suggérés</h2>
					<p className="mb-4 text-gray-700">
						Les numéros ci-dessous sont ceux qui ont été analysés en utilisant
						différents algorithmes pour prédire les numéros potentiellement
						gagnants.
					</p>
					<ul className="flex space-x-4 justify-center">
						{analysis.suggestedNumbers.map((num) => (
							<li
								key={num}
								className="bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center text-lg font-bold"
							>
								{num}
							</li>
						))}
					</ul>
				</section>

				<section className="mb-12 bg-white p-6 shadow-lg rounded-lg">
					<h2 className="text-2xl font-bold mb-4">Analyse des Fréquences</h2>
					<p className="mb-4 text-gray-700">
						Cet algorithme analyse la fréquence d&apos;apparition de chaque
						numéro dans les tirages passés. Les numéros les plus fréquents sont
						considérés comme ayant plus de chances d&apos;être tirés à nouveau.
					</p>
					{displayTopResults(analysis.frequencies)}
				</section>

				<section className="mb-12 bg-white p-6 shadow-lg rounded-lg">
					<h2 className="text-2xl font-bold mb-4">
						Analyse des Paires Fréquentes
					</h2>
					<p className="mb-4 text-gray-700">
						Cet algorithme identifie les paires de numéros qui apparaissent le
						plus souvent ensemble dans les tirages passés.
					</p>
					{displayTopResults(analysis.pairs)}
				</section>

				<section className="mb-12 bg-white p-6 shadow-lg rounded-lg">
					<h2 className="text-2xl font-bold mb-4">Analyse des Écarts</h2>
					<p className="mb-4 text-gray-700">
						Cet algorithme examine le nombre de tirages écoulés depuis la
						dernière apparition de chaque numéro. Les numéros ayant un écart
						élevé pourraient être plus susceptibles d&apos;être tirés
						prochainement.
					</p>
					{displayTopResults(analysis.gaps)}
				</section>

				<section className="mb-12 bg-white p-6 shadow-lg rounded-lg">
					<h2 className="text-2xl font-bold mb-4">Analyse des Séquences</h2>
					<p className="mb-4 text-gray-700">
						Cet algorithme recherche des suites de numéros consécutifs qui
						apparaissent fréquemment ensemble dans les tirages passés.
					</p>
					{displayTopResults(analysis.sequences)}
				</section>

				<section className="mb-12 bg-white p-6 shadow-lg rounded-lg">
					<h2 className="text-2xl font-bold mb-4">Analyse des Clusters</h2>
					<p className="mb-4 text-gray-700">
						Cet algorithme identifie des groupes de trois numéros qui ont
						tendance à être tirés ensemble plus souvent que le hasard ne le
						suggérerait.
					</p>
					{displayTopResults(analysis.clusters)}
				</section>

				<section className="mb-12 bg-white p-6 shadow-lg rounded-lg">
					<h2 className="text-2xl font-bold mb-4">Analyse des Retards</h2>
					<p className="mb-4 text-gray-700">
						Cet algorithme calcule le nombre de tirages écoulés depuis la
						dernière apparition de chaque numéro. Les numéros ayant un retard
						élevé pourraient être plus susceptibles d&apos;être tirés
						prochainement.
					</p>
					{displayTopResults(analysis.delays)}
				</section>

				<section className="mb-12 bg-white p-6 shadow-lg rounded-lg">
					<h2 className="text-2xl font-bold mb-4">
						Analyse des Fréquences Glissantes
					</h2>
					<p className="mb-4 text-gray-700">
						Cet algorithme analyse la fréquence d&apos;apparition des numéros
						dans une fenêtre glissante des derniers tirages (par exemple, les 10
						derniers tirages). Cela permet d&apos;identifier les tendances à
						court terme.
					</p>
					{displayTopResults(analysis.slidingFrequencies)}
				</section>

				{/* <section className="mb-12 bg-white p-6 shadow-lg rounded-lg">
					<h2 className="text-2xl font-bold mb-4">
						Analyse des Chaînes de Markov
					</h2>
					<p className="mb-4 text-gray-700">
						Cet algorithme modélise la probabilité de transition d&apos;un
						numéro à un autre dans les tirages successifs, permettant
						d&apos;identifier des enchaînements de numéros fréquents.
					</p>
					{displayTopResults(analysis.markovChainAnalysis)}{' '}
				</section> */}

				{/* <section className="mb-12 bg-white p-6 shadow-lg rounded-lg">
					<h2 className="text-2xl font-bold mb-4">Analyse des Cycles</h2>
					<p className="mb-4 text-gray-700">
						Cet algorithme recherche des cycles ou des périodes où certains
						numéros ont tendance à apparaître plus fréquemment.
					</p>
					{displayTopResults(analysis.cycleAnalysis)}{' '}
				</section> */}
			</main>
		</div>
	);
}
