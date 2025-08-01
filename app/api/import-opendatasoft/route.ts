import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Loto from '@/models/loto';
import { openDataSoftService } from '@/lib/opendatasoft';
import { mockDataService } from '@/lib/mock-data';
import { ApiResponse, LotoDraw } from '@/types';

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<{ imported: number; skipped: number }>>> {
	try {
		// Parse request body for optional parameters
		const body = await request.json();
		const limit = body.limit || 50; // Reduced default limit for better performance

		// Check if OpenDataSoft API is available
		const isAvailable = await openDataSoftService.healthCheck();
		if (!isAvailable) {
			return NextResponse.json(
				{
					success: false,
					message: 'OpenDataSoft API is currently unavailable',
				},
				{ status: 503 }
			);
		}

		// Fetch latest results from OpenDataSoft
		const externalDraws = await openDataSoftService.fetchLatestResults(limit);

		let imported = 0;
		let skipped = 0;

		try {
			// Try to use real database
			await dbConnect();
			
			// Import each draw, skipping duplicates
			for (const draw of externalDraws) {
				try {
					// Check if draw already exists (by date)
					const existingDraw = await Loto.findOne({ 
						drawDate: {
							$gte: new Date(draw.drawDate).setHours(0, 0, 0, 0),
							$lt: new Date(draw.drawDate).setHours(23, 59, 59, 999)
						}
					});

					if (existingDraw) {
						skipped++;
						continue;
					}

					// Create new draw
					const newDraw = new Loto({
						drawDate: draw.drawDate,
						numbers: draw.numbers,
						luckyNumber: draw.luckyNumber,
					});

					await newDraw.save();
					imported++;
				} catch (error) {
					console.error(`Error importing draw for ${draw.drawDate}:`, error);
					skipped++;
				}
			}
		} catch (dbError) {
			// Fallback to mock data service
			console.warn('Database unavailable, using mock data service for import:', dbError);
			
			const drawsToImport = externalDraws.map(draw => ({
				drawDate: draw.drawDate,
				numbers: draw.numbers,
				luckyNumber: draw.luckyNumber,
			}));

			const result = mockDataService.importDraws(drawsToImport);
			imported = result.imported;
			skipped = result.skipped;
		}

		return NextResponse.json(
			{
				success: true,
				message: `Import completed: ${imported} draws imported, ${skipped} skipped`,
				data: { imported, skipped }
			},
			{ status: 200 }
		);

	} catch (error) {
		console.error('Error importing from OpenDataSoft:', error);
		return NextResponse.json(
			{
				success: false,
				message: 'Erreur lors de l\'importation des données',
				error: (error as Error).message,
			},
			{ status: 500 }
		);
	}
}

export async function GET(): Promise<NextResponse<ApiResponse<{ available: boolean }>>> {
	try {
		const isAvailable = await openDataSoftService.healthCheck();
		
		return NextResponse.json(
			{
				success: true,
				message: isAvailable ? 'OpenDataSoft API is available' : 'OpenDataSoft API is unavailable',
				data: { available: isAvailable }
			},
			{ status: 200 }
		);
	} catch (error) {
		return NextResponse.json(
			{
				success: false,
				message: 'Error checking API status',
				error: (error as Error).message,
			},
			{ status: 500 }
		);
	}
}