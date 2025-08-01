'use client';

import React from 'react';

interface ErrorBoundaryState {
	hasError: boolean;
	error?: Error;
	errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
	children: React.ReactNode;
	fallback?: React.ComponentType<{ error?: Error; retry: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { hasError: false };
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		console.error('ErrorBoundary caught an error:', error, errorInfo);
		
		this.setState({
			error,
			errorInfo
		});

		// In production, you could send this to an error reporting service
		if (process.env.NODE_ENV === 'production') {
			// Example: sendErrorReport(error, errorInfo);
		}
	}

	private handleRetry = () => {
		this.setState({ hasError: false, error: undefined, errorInfo: undefined });
	};

	render() {
		if (this.state.hasError) {
			// Custom fallback component
			if (this.props.fallback) {
				const FallbackComponent = this.props.fallback;
				return <FallbackComponent error={this.state.error} retry={this.handleRetry} />;
			}

			// Default fallback UI
			return (
				<div className="min-h-screen bg-gradient-to-r from-red-600 to-red-800 text-white flex items-center justify-center">
					<div className="text-center p-8 bg-white/10 backdrop-blur-sm rounded-lg max-w-md">
						<div className="text-6xl mb-4">⚠️</div>
						<h2 className="text-2xl font-bold mb-4">Oups! Une erreur s&apos;est produite</h2>
						<p className="text-lg mb-6 opacity-90">
							L&apos;application a rencontré un problème inattendu. 
							Nos développeurs ont été notifiés.
						</p>
						
						{process.env.NODE_ENV === 'development' && this.state.error && (
							<details className="mb-4 text-left bg-black/20 p-4 rounded text-sm">
								<summary className="cursor-pointer font-semibold mb-2">
									Détails de l&apos;erreur (développement)
								</summary>
								<pre className="whitespace-pre-wrap break-words">
									{this.state.error.message}
									{this.state.errorInfo?.componentStack}
								</pre>
							</details>
						)}

						<div className="space-y-3">
							<button
								onClick={this.handleRetry}
								className="btn btn-primary w-full"
							>
								Réessayer
							</button>
							<button
								onClick={() => window.location.reload()}
								className="btn btn-outline btn-secondary w-full"
							>
								Recharger la page
							</button>
						</div>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}

// Hook for functional components to handle errors
export const useErrorHandler = () => {
	return (error: Error, errorInfo?: any) => {
		console.error('Error caught by useErrorHandler:', error, errorInfo);
		
		// In production, send to error reporting service
		if (process.env.NODE_ENV === 'production') {
			// Example: sendErrorReport(error, errorInfo);
		}
	};
};

// Simple error fallback component
export const SimpleErrorFallback: React.FC<{ error?: Error; retry: () => void }> = ({ 
	error, 
	retry 
}) => (
	<div className="bg-red-50 border border-red-200 rounded-lg p-6 m-4">
		<div className="flex">
			<div className="flex-shrink-0">
				<svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
					<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
				</svg>
			</div>
			<div className="ml-3">
				<h3 className="text-sm font-medium text-red-800">
					Une erreur s&apos;est produite
				</h3>
				<div className="mt-2 text-sm text-red-700">
					<p>Impossible de charger ce composant.</p>
				</div>
				<div className="mt-4">
					<button
						onClick={retry}
						className="btn btn-sm btn-outline btn-error"
					>
						Réessayer
					</button>
				</div>
			</div>
		</div>
	</div>
);