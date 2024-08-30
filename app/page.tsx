'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Home() {
	interface Draw {
		_id: string;
		drawDate: string;
		numbers: number[];
		bonusNumber: number;
	}

	const [analysis, setAnalysis] = useState<{
		sequences: any;
		gaps: any;
		pairs: any;
		frequencies: any;
		suggestedNumbers: number[];
	} | null>(null);

	useEffect(() => {
		async function fetchAnalysis() {
			const response = await fetch('/api/analysis');
			const data = await response.json();
			console.log("je suis dans la page d'accueil et je log data", data);
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

	return (
		<div className="min-h-screen bg-background text-text">
			<main className="container mx-auto py-12 px-4">
				<section className="text-center mb-12">
					<h2 className="text-4xl font-bold mb-4">
						Bienvenue sur Mon Application Loto
					</h2>
					<p className="text-lg text-gray-700">
						Votre solution unique pour analyser et suivre les numéros de
						loterie.
					</p>
				</section>

				<section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					<div className="card shadow-lg bg-white p-6 rounded-lg">
						<h3 className="text-2xl font-bold mb-2">Analyse des numéros</h3>
						<p className="text-gray-600">
							Utilisez nos algorithmes avancés pour analyser les résultats de
							loterie passés et faire des prédictions éclairées.
						</p>
						<Link
							href="/analysis"
							className="text-primary font-bold mt-4 inline-block"
						>
							Voir l&rsquo;analyse
						</Link>
					</div>

					<div className="card shadow-lg bg-white p-6 rounded-lg">
						<h3 className="text-2xl font-bold mb-2">Suivi de vos tickets</h3>
						<p className="text-gray-600">
							Gardez une trace de vos tickets de loterie et vérifiez si vous
							avez gagné.
						</p>
					</div>

					<div className="card shadow-lg bg-white p-6 rounded-lg">
						<h3 className="text-2xl font-bold mb-2">Obtenez des insights</h3>
						<p className="text-gray-600">
							Obtenez des informations précieuses et augmentez vos chances de
							gagner grâce à notre approche basée sur les données.
						</p>
					</div>
				</section>

				<section className="mt-12">
					<h2 className="text-2xl font-bold mb-4">Numéros Suggérés</h2>
					<p className="mb-4 text-gray-700">
						Les numéros ci-dessous sont ceux qui ont été analysés en utilisant
						différents algorithmes pour prédire les numéros potentiellement
						gagnants.
					</p>
					<ul className="flex space-x-4 justify-center">
						{analysis &&
							analysis.suggestedNumbers.map((num) => (
								<li
									key={num}
									className="bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center text-lg font-bold"
								>
									{num}
								</li>
							))}
					</ul>
				</section>
			</main>
		</div>
	);
}
