'use client';

import { useEffect, useState } from 'react';

interface Draw {
	_id: string;
	drawDate: string;
	numbers: number[];
	luckyNumber: number;
}

export default function History() {
	const [draws, setDraws] = useState<Draw[]>([]);
	const [filteredDraws, setFilteredDraws] = useState<Draw[]>([]);
	const [selectedMonth, setSelectedMonth] = useState<string>(
		new Date().toISOString().slice(0, 7)
	); // Format "YYYY-MM"
	const [loading, setLoading] = useState<boolean>(false);
	const [importing, setImporting] = useState<boolean>(false);

	useEffect(() => {
		fetchDraws();
	}, []);

	useEffect(() => {
		// Filtre les tirages en fonction du mois sélectionné
		const filtered = draws.filter((draw) =>
			draw.drawDate.startsWith(selectedMonth)
		);
		setFilteredDraws(filtered);
	}, [selectedMonth, draws]);

	async function fetchDraws() {
		setLoading(true);
		try {
			const response = await fetch('/api/draws'); // Utilise ton API pour récupérer les tirages
			if (!response.ok) {
				throw new Error(`Erreur HTTP : ${response.status}`);
			}
			const data = await response.json();
			if (data.success) {
				setDraws(data.draws);
				const filtered = data.draws.filter((draw: Draw) =>
					draw.drawDate.startsWith(selectedMonth)
				);
				setFilteredDraws(filtered);
			} else {
				console.error(
					'Erreur lors de la récupération des tirages:',
					data.message
				);
			}
		} catch (error) {
			console.error('Erreur lors de la récupération des tirages:', error);
		} finally {
			setLoading(false);
		}
	}

	async function importDraws() {
		setImporting(true);
		try {
			const response = await fetch('/api/import-draws', {
				method: 'POST',
			});
			if (!response.ok) {
				throw new Error(`Erreur HTTP : ${response.status}`);
			}
			const data = await response.json();
			if (data.success) {
				// Réactualise les tirages après l'importation
				fetchDraws();
			} else {
				console.error(
					"Erreur lors de l'importation des tirages:",
					data.message
				);
			}
		} catch (error) {
			console.error("Erreur lors de l'importation des tirages:", error);
		} finally {
			setImporting(false);
		}
	}

	function handleMonthChange(event: React.ChangeEvent<HTMLSelectElement>) {
		setSelectedMonth(event.target.value);
	}

	function getMonthOptions() {
		const currentYear = new Date().getFullYear();
		const options = [];
		for (let year = currentYear - 5; year <= currentYear; year++) {
			for (let month = 1; month <= 12; month++) {
				const monthString = month.toString().padStart(2, '0');
				options.push(`${year}-${monthString}`);
			}
		}
		return options.reverse(); // Montrer les options récentes en premier
	}

	return (
		<div className="min-h-screen bg-gradient-to-r from-indigo-600 to-blue-500 text-white py-12">
			<div className="container mx-auto px-4">
				<div className="flex justify-between items-center mb-8">
					<h1 className="text-4xl font-bold text-center">
						Historique des Tirages
					</h1>
					<div className="flex items-center space-x-4">
						<select
							value={selectedMonth}
							onChange={handleMonthChange}
							className="border border-gray-300 rounded-lg p-2 text-gray-800"
						>
							{getMonthOptions().map((month) => (
								<option key={month} value={month}>
									{new Date(month + '-01').toLocaleDateString('fr-FR', {
										year: 'numeric',
										month: 'long',
									})}
								</option>
							))}
						</select>
						<button
							onClick={importDraws}
							className="bg-primary text-white rounded-lg px-4 py-2 font-bold hover:bg-primary-dark transition duration-300"
							disabled={importing}
						>
							{importing ? 'Importation...' : 'Mettre à jour'}
						</button>
					</div>
				</div>
				{loading ? (
					<p className="text-center text-gray-200">Chargement des tirages...</p>
				) : filteredDraws.length > 0 ? (
					<ul className="space-y-4">
						{filteredDraws.map((draw) => (
							<li
								key={draw._id}
								className="bg-white text-gray-800 shadow-md rounded-lg p-4 flex items-center justify-between"
							>
								<span className="text-lg font-semibold">
									{new Date(draw.drawDate).toLocaleDateString('fr-FR')}
								</span>
								<div className="flex space-x-2">
									{draw.numbers.map((number, index) => (
										<span
											key={index}
											className="bg-primary text-white rounded-full w-10 h-10 flex items-center justify-center text-lg font-bold"
										>
											{number}
										</span>
									))}
									<span className="bg-secondary text-white rounded-full w-10 h-10 flex items-center justify-center text-lg font-bold">
										{draw.luckyNumber}
									</span>
								</div>
							</li>
						))}
					</ul>
				) : (
					<p className="text-center text-gray-200">
						Aucun tirage disponible pour ce mois.
					</p>
				)}
			</div>
		</div>
	);
}
