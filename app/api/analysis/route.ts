import { NextResponse } from 'next/server';
import { getSuggestedNumbers } from '@/lib/analysis';

export async function GET() {
	try {
		const analysisData = await getSuggestedNumbers();
		return NextResponse.json(
			{ success: true, ...analysisData },
			{ status: 200 }
		);
	} catch (error) {
		return NextResponse.json(
			{
				success: false,
				message: "Erreur lors de l'analyse.",
				error: (error as Error).message,
			},
			{ status: 500 }
		);
	}
}
