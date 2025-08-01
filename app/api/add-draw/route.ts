import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Loto from '@/models/loto';
import { mockDataService } from '@/lib/mock-data';
import { LotoDraw, ApiResponse } from '@/types';

interface AddDrawRequest {
	drawDate: string;
	numbers: number[];
	luckyNumber: number;
}

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<LotoDraw>>> {
	try {
		// Récupérer les données du corps de la requête POST
		const body: AddDrawRequest = await request.json();
		const { drawDate, numbers, luckyNumber } = body;

		// Validation détaillée des données
		if (!drawDate || isNaN(Date.parse(drawDate))) {
			return NextResponse.json(
				{
					success: false,
					message: 'Date de tirage invalide.',
				},
				{ status: 400 }
			);
		}

		if (!Array.isArray(numbers) || numbers.length !== 5) {
			return NextResponse.json(
				{
					success: false,
					message: 'Vous devez fournir exactement 5 numéros principaux.',
				},
				{ status: 400 }
			);
		}

		// Vérifier que tous les numéros sont valides (1-49)
		const invalidNumbers = numbers.filter(num => !Number.isInteger(num) || num < 1 || num > 49);
		if (invalidNumbers.length > 0) {
			return NextResponse.json(
				{
					success: false,
					message: 'Les numéros principaux doivent être des entiers entre 1 et 49.',
				},
				{ status: 400 }
			);
		}

		// Vérifier les doublons
		const uniqueNumbers = new Set(numbers);
		if (uniqueNumbers.size !== 5) {
			return NextResponse.json(
				{
					success: false,
					message: 'Les numéros principaux doivent être uniques.',
				},
				{ status: 400 }
			);
		}

		// Vérifier le numéro chance (1-10)
		if (!Number.isInteger(luckyNumber) || luckyNumber < 1 || luckyNumber > 10) {
			return NextResponse.json(
				{
					success: false,
					message: 'Le numéro chance doit être un entier entre 1 et 10.',
				},
				{ status: 400 }
			);
		}

		let savedDraw: LotoDraw;

		try {
			// Try to use real database
			await dbConnect();
			
			// Vérifier si un tirage existe déjà pour cette date
			const existingDraw = await Loto.findOne({ drawDate: new Date(drawDate) });

			if (existingDraw) {
				return NextResponse.json(
					{
						success: false,
						message: 'Un tirage existe déjà pour cette date.',
					},
					{ status: 400 }
				);
			}

			// Créer un nouveau tirage
			const newDraw = new Loto({
				drawDate: new Date(drawDate),
				numbers,
				luckyNumber,
			});

			// Enregistrer le tirage dans la base de données
			savedDraw = await newDraw.save();
		} catch (dbError) {
			// Fallback to mock data service
			console.warn('Database unavailable, using mock data service:', dbError);
			
			// Vérifier si un tirage existe déjà pour cette date dans les données mock
			const existingDraw = mockDataService.findDrawByDate(new Date(drawDate));

			if (existingDraw) {
				return NextResponse.json(
					{
						success: false,
						message: 'Un tirage existe déjà pour cette date.',
					},
					{ status: 400 }
				);
			}

			// Ajouter le tirage aux données mock
			savedDraw = mockDataService.addDraw({
				drawDate: new Date(drawDate),
				numbers,
				luckyNumber,
			});
		}

		return NextResponse.json(
			{ 
				success: true, 
				message: 'Tirage ajouté avec succès!',
				data: savedDraw
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error("Erreur lors de l'ajout du tirage:", error);
		return NextResponse.json(
			{
				success: false,
				message: "Erreur lors de l'ajout du tirage.",
				error: (error as Error).message,
			},
			{ status: 500 }
		);
	}
}
