import { useState, useEffect } from 'react';
import axios from 'axios';

export default function FrequencyAnalysis() {
	const [frequencies, setFrequencies] = useState<[number, number][]>([]);
	const [prediction, setPrediction] = useState<number[]>([]);

	useEffect(() => {
		axios
			.get('/api/frequency-analysis')
			.then((response) => {
				setFrequencies(response.data.frequencies);
				setPrediction(response.data.prediction);
			})
			.catch((error) => console.error(error));
	}, []);

	return (
		<div className="container mx-auto py-12 px-4">
			<h2 className="text-4xl font-bold mb-4">Fréquence des numéros</h2>
			<ul className="list-disc pl-5 space-y-2">
				{frequencies.map(([num, freq], index) => (
					<li key={index}>
						Numéro {num}: {freq} fois
					</li>
				))}
			</ul>
			<h3 className="text-3xl font-bold mt-8">
				Prédiction des prochains numéros
			</h3>
			<ul className="list-disc pl-5 space-y-2">
				{prediction.map((num, index) => (
					<li key={index}>Numéro {num}</li>
				))}
			</ul>
		</div>
	);
}
