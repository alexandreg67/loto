'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AnalysisState } from '@/types';

export default function Home() {
	const [analysis, setAnalysis] = useState<AnalysisState | null>(null);

	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchAnalysis() {
			try {
				const response = await fetch('/api/analysis');
				const result = await response.json();
				
				if (result.success && result.data) {
					// Transform the new API response format to match the component's expectations
					setAnalysis({
						sequences: result.data.sequences || [],
						gaps: result.data.gaps || [],
						pairs: result.data.pairs || [],
						frequencies: result.data.frequencies || [],
						suggestedNumbers: result.data.suggestedNumbers || []
					});
				} else {
					console.error(
						"Erreur lors de la récupération des données d'analyse:",
						result.message
					);
				}
			} catch (error) {
				console.error('Erreur réseau ou serveur:', error);
			} finally {
				setLoading(false);
			}
		}

		fetchAnalysis();
	}, []);

	return (
		<div className="min-h-screen bg-gradient-to-r from-indigo-600 to-blue-500 text-white">
			<main className="container mx-auto py-12 px-4">
				<section className="text-center mb-12">
					<h2 className="text-5xl font-extrabold mb-4">
						Bienvenue sur Mon Application Loto
					</h2>
					<p className="text-lg text-gray-200">
						Votre solution unique pour analyser et suivre les numéros de
						loterie.
					</p>
				</section>

				<section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					<div className="card shadow-lg bg-white text-gray-800 p-6 rounded-lg transform transition-transform hover:scale-105">
						<h3 className="text-3xl font-bold mb-2">Analyse des numéros</h3>
						<p className="text-gray-600">
							Utilisez nos algorithmes avancés pour analyser les résultats de
							loterie passés et faire des prédictions éclairées.
						</p>
						<Link
							href="/analysis"
							className="text-blue-500 font-bold mt-4 inline-block"
						>
							Voir l&rsquo;analyse
						</Link>
					</div>

					<div className="card shadow-lg bg-white text-gray-800 p-6 rounded-lg transform transition-transform hover:scale-105">
						<h3 className="text-3xl font-bold mb-2">Obtenez des insights</h3>
						<p className="text-gray-600">
							Obtenez des informations précieuses et augmentez vos chances de
							gagner grâce à notre approche basée sur les données.
						</p>
					</div>
				</section>

				<section className="mt-12">
					<h2 className="text-3xl font-bold mb-4">Numéros Suggérés</h2>
					<p className="mb-4 text-gray-200">
						Les numéros ci-dessous sont ceux qui ont été analysés en utilisant
						différents algorithmes pour prédire les numéros potentiellement
						gagnants.
					</p>
					{loading ? (
						<div className="flex space-x-4 justify-center">
							{Array.from({ length: 6 }).map((_, i) => (
								<div 
									key={i}
									className="w-12 h-12 rounded-full bg-white/20 animate-pulse"
								/>
							))}
						</div>
					) : analysis && analysis.suggestedNumbers.length > 0 ? (
						<ul className="flex space-x-4 justify-center flex-wrap gap-2">
							{analysis.suggestedNumbers.map((num, index) => (
								<li
									key={num}
									className="bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center text-lg font-bold shadow-lg transform transition-all duration-300 hover:scale-110 hover:bg-primary-focus"
									style={{
										animationDelay: `${index * 0.1}s`,
									}}
								>
									{num}
								</li>
							))}
						</ul>
					) : (
						<div className="text-center py-8">
							<div className="text-6xl mb-4">🎯</div>
							<p className="text-lg text-gray-200 mb-4">
								Aucun numéro suggéré disponible
							</p>
							<p className="text-sm text-gray-300">
								Il semble qu&apos;il n&apos;y ait pas assez de données pour générer des suggestions.
							</p>
						</div>
					)}
				</section>
			</main>
		</div>
	);
}
