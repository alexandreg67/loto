import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Loto from '@/models/loto';
import { mockDataService } from '@/lib/mock-data';
import { ApiResponse, LotoDraw } from '@/types';

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<LotoDraw[]>>> {
	try {
		// Parse query parameters for pagination and filtering
		const { searchParams } = new URL(request.url);
		const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200); // Max 200
		const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0);
		const startDate = searchParams.get('startDate');
		const endDate = searchParams.get('endDate');

		let draws: LotoDraw[];
		let totalCount: number;

		try {
			// Try to use real database
			await dbConnect();
			
			// Build query with optional date filtering
			let query = {};
			if (startDate || endDate) {
				query = {
					drawDate: {
						...(startDate && { $gte: new Date(startDate) }),
						...(endDate && { $lte: new Date(endDate) })
					}
				};
			}

			// Execute query with pagination
			const [dbDraws, dbTotalCount] = await Promise.all([
				Loto.find(query)
					.sort({ drawDate: -1 })
					.limit(limit)
					.skip(offset)
					.lean(),
				Loto.countDocuments(query)
			]);

			draws = dbDraws as unknown as LotoDraw[];
			totalCount = dbTotalCount;
		} catch (dbError) {
			// Fallback to mock data service (includes in-memory draws)
			console.warn('Database unavailable, using mock data service:', dbError);
			
			const result = mockDataService.getDraws(limit, offset, startDate || undefined, endDate || undefined);
			draws = result.draws;
			totalCount = result.totalCount;
		}

		return NextResponse.json(
			{ 
				success: true, 
				data: draws,
				message: `Récupération de ${draws.length} tirages`,
				meta: {
					total: totalCount,
					limit,
					offset,
					hasMore: offset + limit < totalCount
				}
			} as ApiResponse<LotoDraw[]>,
			{ 
				status: 200,
				headers: {
					'Cache-Control': 'public, max-age=600' // Cache for 10 minutes
				}
			}
		);
	} catch (error) {
		console.error('Error fetching draws:', error);
		
		return NextResponse.json(
			{
				success: false,
				message: 'Erreur lors de la récupération des tirages.',
				error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Internal server error',
			},
			{ status: 500 }
		);
	}
}
