import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Loto from '@/models/loto';

export async function POST() {
	try {
		await dbConnect();

		const url =
			'https://api.lotteryresultsapi.com/alpha/lottery/fr_lotto/draw?sort_number=false&offset=0&limit=5';
		const token = process.env.LOTTERY_API_TOKEN;

		if (!token) {
			throw new Error(
				"Le token d'API LOTTERY_API_TOKEN est manquant dans .env.local"
			);
		}

		const response = await fetch(url, {
			method: 'GET',
			headers: {
				'X-API-Token': token,
			},
		});

		if (!response.ok) {
			throw new Error(
				`Erreur lors de la récupération des données de l'API: ${response.statusText}`
			);
		}

		const data = await response.json();
		console.log('Données reçues:', data);

		const newDraws = [];

		for (const draw of data) {
			const drawDate = new Date(draw.date);
			console.log('Vérification du tirage pour la date:', drawDate);

			const existingDraw = await Loto.findOne({ drawDate });

			if (!existingDraw) {
				console.log(
					'Aucun tirage existant, enregistrement du nouveau tirage...'
				);
				let numbers = draw.numbers.split(' ').map(Number); // Convertir en tableau de nombres
				let luckyNumber: number | null = null;

				// Vérifier les doublons
				const numberCounts = numbers.reduce(
					(acc: { [x: string]: any }, num: string | number) => {
						acc[num] = (acc[num] || 0) + 1;
						return acc;
					},
					{}
				);

				const duplicates = Object.keys(numberCounts).filter(
					(num) => numberCounts[num] > 1
				);

				if (duplicates.length > 0) {
					// Si un doublon est trouvé, c'est le numéro chance
					luckyNumber = parseInt(duplicates[0], 10);
					numbers = numbers.filter((num: number | null) => num !== luckyNumber); // Retirer une occurrence du numéro chance
				} else {
					// Sinon, le dernier numéro est le numéro chance
					luckyNumber = numbers.pop();
				}

				const newDraw = new Loto({
					drawDate,
					numbers,
					luckyNumber, // Assurez-vous d'inclure le luckyNumber ici
				});

				await newDraw.save();
				console.log('Tirage enregistré:', newDraw);
				newDraws.push(newDraw);
			} else {
				console.log(
					"Tirage pour cette date déjà existant, saut de l'enregistrement."
				);
			}
		}

		return NextResponse.json(
			{
				success: true,
				message: `${newDraws.length} tirage(s) ont été importé(s).`,
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error("Erreur lors de l'importation des tirages:", error);
		return NextResponse.json(
			{
				success: false,
				message: "Erreur lors de l'importation des tirages.",
				error: (error as Error).message,
			},
			{ status: 500 }
		);
	}
}
