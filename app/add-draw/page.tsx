'use client';

import { useState } from 'react';

// Définir le type de données pour un tirage
interface Draw {
	drawDate: string;
	numbers: number[];
	luckyNumber: number; // Numéro chance
}

export default function AddDraw() {
	const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
	const [luckyNumber, setLuckyNumber] = useState<number | null>(null);
	const [drawDate, setDrawDate] = useState('');
	const [loading, setLoading] = useState(false);

	const toggleNumber = (num: number) => {
		if (selectedNumbers.includes(num)) {
			setSelectedNumbers((prev) => prev.filter((n) => n !== num));
		} else if (selectedNumbers.length < 5) {
			setSelectedNumbers((prev) => [...prev, num]);
		}
	};

	const handleLuckyNumberSelect = (num: number) => {
		setLuckyNumber(num);
	};

	const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setDrawDate(e.target.value);
	};

	const handleSubmit = async () => {
		if (selectedNumbers.length !== 5) {
			alert('Vous devez sélectionner exactement 5 numéros.');
			return;
		}
		if (luckyNumber === null) {
			alert('Vous devez sélectionner un numéro chance.');
			return;
		}
		if (!drawDate) {
			alert('Veuillez sélectionner une date.');
			return;
		}

		setLoading(true);

		const newDraw: Draw = {
			drawDate,
			numbers: selectedNumbers.sort((a, b) => a - b),
			luckyNumber,
		};

		const response = await fetch('/api/add-draw', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(newDraw),
		});

		const data = await response.json();

		if (data.success) {
			alert('Tirage ajouté avec succès!');
			setSelectedNumbers([]);
			setLuckyNumber(null);
			setDrawDate('');
		} else {
			alert(data.message || "Erreur lors de l'ajout du tirage.");
		}

		setLoading(false);
	};

	return (
		<div className="min-h-screen bg-gray-100 text-gray-900 py-12">
			<div className="container mx-auto px-4">
				<h1 className="text-4xl font-bold mb-8 text-center">
					Ajouter un Tirage
				</h1>
				<div className="mb-4">
					<label className="block text-lg font-semibold text-gray-700 mb-2">
						Date du Tirage:
					</label>
					<input
						type="date"
						value={drawDate}
						onChange={handleDateChange}
						className="px-4 py-2 bg-white border border-gray-300 rounded-lg w-full"
					/>
				</div>
				<div className="mb-8">
					<h2 className="text-lg font-semibold text-gray-700 mb-2">
						Sélectionnez les 5 numéros principaux:
					</h2>
					<div className="grid grid-cols-7 gap-2 mb-4">
						{Array.from({ length: 50 }, (_, i) => i).map((num) => (
							<button
								key={num}
								onClick={() => toggleNumber(num)}
								className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
									selectedNumbers.includes(num)
										? 'bg-primary text-white'
										: 'bg-gray-200 text-gray-900 hover:bg-primary hover:text-white'
								}`}
								disabled={
									selectedNumbers.length >= 5 && !selectedNumbers.includes(num)
								}
							>
								{num}
							</button>
						))}
					</div>
					<h2 className="text-lg font-semibold text-gray-700 mb-2">
						Sélectionnez le numéro chance:
					</h2>
					<div className="grid grid-cols-7 gap-2">
						{Array.from({ length: 50 }, (_, i) => i).map((num) => (
							<button
								key={num}
								onClick={() => handleLuckyNumberSelect(num)}
								className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
									luckyNumber === num
										? 'bg-secondary text-white'
										: 'bg-gray-200 text-gray-900 hover:bg-secondary hover:text-white'
								}`}
							>
								{num}
							</button>
						))}
					</div>
				</div>
				<div className="flex justify-center">
					<button
						onClick={handleSubmit}
						disabled={
							loading ||
							selectedNumbers.length !== 5 ||
							luckyNumber === null ||
							!drawDate
						}
						className={`px-6 py-3 bg-primary text-white rounded-lg ${
							loading
								? 'opacity-50 cursor-not-allowed'
								: 'hover:bg-primary-dark'
						}`}
					>
						{loading ? 'Ajout en cours...' : 'Ajouter le Tirage'}
					</button>
				</div>
			</div>
		</div>
	);
}
