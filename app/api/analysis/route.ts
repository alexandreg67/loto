import { NextResponse } from 'next/server';
import { optimizedAnalysis } from '@/lib/optimized-analysis';
import { mockAnalysisService } from '@/lib/mock-data';
import { ApiResponse, CombinedAnalysisData } from '@/types';

export async function GET(): Promise<NextResponse<ApiResponse<CombinedAnalysisData>>> {
	try {
		let analysisData;
		
		try {
			// Try to use real database analysis
			analysisData = await optimizedAnalysis.getComprehensiveAnalysis();
		} catch (dbError) {
			// Fallback to mock data if database is not available
			console.warn('Database unavailable, using mock data:', dbError);
			analysisData = mockAnalysisService.getComprehensiveAnalysis();
		}
		
		return NextResponse.json(
			{ 
				success: true, 
				data: analysisData,
				message: 'Analyse terminée avec succès'
			},
			{ 
				status: 200,
				headers: {
					'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
				}
			}
		);
	} catch (error) {
		console.error('Analysis error:', error);
		
		return NextResponse.json(
			{
				success: false,
				message: "Erreur lors de l'analyse des données de loterie.",
				error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Internal server error',
			},
			{ status: 500 }
		);
	}
}

// Add cache clearing endpoint for development
export async function DELETE(): Promise<NextResponse<ApiResponse<null>>> {
	try {
		optimizedAnalysis.clearCache();
		
		return NextResponse.json(
			{
				success: true,
				message: 'Cache cleared successfully'
			},
			{ status: 200 }
		);
	} catch (error) {
		return NextResponse.json(
			{
				success: false,
				message: 'Error clearing cache',
				error: (error as Error).message,
			},
			{ status: 500 }
		);
	}
}
