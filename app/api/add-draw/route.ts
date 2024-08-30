import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Loto from '@/models/loto';

export async function POST(request: {
	json: () =>
		| PromiseLike<{ drawDate: any; numbers: any; luckyNumber: any }>
		| { drawDate: any; numbers: any; luckyNumber: any };
}) {
	try {
		await dbConnect();

		// Récupérer les données du corps de la requête POST
		const { drawDate, numbers, luckyNumber } = await request.json();

		// Vérifier que les données fournies sont valides
		if (
			!drawDate ||
			!numbers ||
			numbers.length !== 5 ||
			luckyNumber === undefined
		) {
			return NextResponse.json(
				{
					success: false,
					message:
						'Les données fournies sont invalides. Assurez-vous de fournir une date valide, 5 numéros, et un numéro chance.',
				},
				{ status: 400 }
			);
		}

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
		await newDraw.save();

		return NextResponse.json(
			{ success: true, message: 'Tirage ajouté avec succès!' },
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
