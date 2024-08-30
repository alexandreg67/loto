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
	const [selectedMonth, setSelectedMonth] = useState<string>(
		new Date().toISOString().slice(0, 7)
	); // Format "YYYY-MM"

	useEffect(() => {
		fetchDrawsForMonth(selectedMonth);
	}, [selectedMonth]);

	async function fetchDrawsForMonth(month: string) {
		const response = await fetch(`/api/draws?month=${month}`);
		const data = await response.json();
		if (data.success) {
			setDraws(data.draws);
		}
	}

	function handleMonthChange(event: React.ChangeEvent<HTMLSelectElement>) {
		setSelectedMonth(event.target.value);
	}

	function getMonthOptions() {
		const currentYear = new Date().getFullYear();
		const options = [];
		for (let year = currentYear - 5; year <= currentYear; year++) {
			// Affiche les 5 dernières années
			for (let month = 1; month <= 12; month++) {
				const monthString = month.toString().padStart(2, '0');
				options.push(`${year}-${monthString}`);
			}
		}
		return options.reverse(); // Montrer les options récentes en premier
	}

	return (
		<div className="min-h-screen bg-gray-100 text-gray-900 py-12">
			<div className="container mx-auto px-4">
				<div className="flex justify-between items-center mb-8">
					<h1 className="text-4xl font-bold text-center">
						Historique des Tirages
					</h1>
					<select
						value={selectedMonth}
						onChange={handleMonthChange}
						className="border border-gray-300 rounded-lg p-2"
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
				</div>
				<ul className="space-y-4">
					{draws.length > 0 ? (
						draws.map((draw) => (
							<li
								key={draw._id}
								className="bg-white shadow-md rounded-lg p-4 flex items-center justify-between"
							>
								<span className="text-lg font-semibold text-gray-700">
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
						))
					) : (
						<p className="text-gray-600">
							Aucun tirage disponible pour ce mois.
						</p>
					)}
				</ul>
			</div>
		</div>
	);
}
