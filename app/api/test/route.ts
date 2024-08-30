import dbConnect from '@/lib/mongodb';
import Loto from '@/models/loto';
import { NextResponse } from 'next/server';

export async function GET() {
	try {
		await dbConnect();

		// Essayer de récupérer un document pour vérifier que la connexion fonctionne
		const draws = await Loto.find({}).limit(1);

		return NextResponse.json({ success: true, draws }, { status: 200 });
	} catch (error) {
		return NextResponse.json(
			{
				success: false,
				message: 'Connexion à MongoDB échouée.',
				error: (error as Error).message,
			},
			{ status: 500 }
		);
	}
}
