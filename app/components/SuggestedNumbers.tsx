import { useEffect, useState } from 'react';
import axios from 'axios';

export default function SuggestedNumbers() {
	const [data, setData] = useState<any>({});

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await axios.get('/api/suggested-numbers');
				setData(response.data);
			} catch (error) {
				console.error('Erreur lors du chargement des numéros suggérés:', error);
			}
		};

		fetchData();
	}, []);

	return (
		<div className="container mx-auto py-12 px-4">
			<h2 className="text-4xl font-bold mb-6 text-center text-primary">
				Numéros Suggérés pour le Prochain Tirage
			</h2>

			<div className="bg-base-100 p-6 rounded-lg shadow-lg text-center">
				<h3 className="text-3xl font-bold text-secondary mb-4">
					Numéros à Jouer
				</h3>
				<div className="flex justify-center space-x-4">
					{data.suggestedNumbers?.map((num: number, index: number) => (
						<span
							key={index}
							className="badge badge-lg badge-accent text-2xl p-4"
						>
							{num}
						</span>
					))}
				</div>
			</div>

			<div className="mt-8">
				<h3 className="text-2xl font-bold mb-4">Résumé des Analyses</h3>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
					<div className="card shadow-lg bg-base-100">
						<div className="card-body">
							<h4 className="card-title">Fréquences des Numéros</h4>
							<ul className="list-disc pl-5 space-y-2">
								{data.frequencies
									?.slice(0, 5)
									.map(([num, freq]: [number, number], index: number) => (
										<li key={index} className="text-lg">
											<span className="font-bold">Numéro {num}:</span>
											<span className="badge badge-accent ml-2">
												{freq} fois
											</span>
										</li>
									))}
							</ul>
						</div>
					</div>

					<div className="card shadow-lg bg-base-100">
						<div className="card-body">
							<h4 className="card-title">Paires Fréquentes</h4>
							<ul className="list-disc pl-5 space-y-2">
								{data.pairs
									?.slice(0, 5)
									.map(([pair, freq]: [string, number], index: number) => (
										<li key={index} className="text-lg">
											<span className="font-bold">Paire {pair}:</span>
											<span className="badge badge-accent ml-2">
												{freq} fois
											</span>
										</li>
									))}
							</ul>
						</div>
					</div>

					<div className="card shadow-lg bg-base-100">
						<div className="card-body">
							<h4 className="card-title">Analyse des Écarts</h4>
							<ul className="list-disc pl-5 space-y-2">
								{data.gaps
									?.slice(0, 5)
									.map(([num, gap]: [number, number], index: number) => (
										<li key={index} className="text-lg">
											<span className="font-bold">Numéro {num}:</span>
											<span className="badge badge-accent ml-2">
												écart de {gap} tirages
											</span>
										</li>
									))}
							</ul>
						</div>
					</div>

					<div className="card shadow-lg bg-base-100">
						<div className="card-body">
							<h4 className="card-title">Analyse des Séquences</h4>
							<ul className="list-disc pl-5 space-y-2">
								{data.sequences
									?.slice(0, 5)
									.map(([sequence, freq]: [string, number], index: number) => (
										<li key={index} className="text-lg">
											<span className="font-bold">Séquence {sequence}:</span>
											<span className="badge badge-accent ml-2">
												{freq} fois
											</span>
										</li>
									))}
							</ul>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
