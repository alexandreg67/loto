import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Loto from '@/models/loto';

export async function GET() {
	try {
		await dbConnect();
		const draws = await Loto.find({}).sort({ drawDate: -1 }).lean();
		return NextResponse.json({ success: true, draws });
	} catch (error) {
		return NextResponse.json(
			{
				success: false,
				message: 'Erreur lors de la récupération des tirages.',
				error: (error as Error).message,
			},
			{ status: 500 }
		);
	}
}
