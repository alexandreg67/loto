import React from 'react';

interface LoadingSpinnerProps {
	size?: 'sm' | 'md' | 'lg' | 'xl';
	text?: string;
	className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
	size = 'md', 
	text = 'Chargement...', 
	className = '' 
}) => {
	const sizeClasses = {
		sm: 'w-4 h-4',
		md: 'w-8 h-8',
		lg: 'w-12 h-12',
		xl: 'w-16 h-16'
	};

	return (
		<div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
			<div className={`animate-spin rounded-full border-4 border-primary border-t-transparent ${sizeClasses[size]}`} />
			{text && (
				<p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
					{text}
				</p>
			)}
		</div>
	);
};

// Skeleton loader for better UX
export const SkeletonLoader: React.FC<{ className?: string }> = ({ className = '' }) => (
	<div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} />
);

// Full page loading
export const PageLoader: React.FC<{ text?: string }> = ({ text = 'Chargement de l\'application...' }) => (
	<div className="min-h-screen bg-gradient-to-r from-indigo-600 to-blue-500 flex items-center justify-center">
		<div className="text-center text-white">
			<LoadingSpinner size="xl" text={text} />
		</div>
	</div>
);

// Card loading skeleton
export const CardSkeleton: React.FC = () => (
	<div className="bg-white rounded-lg shadow-lg p-6 animate-pulse">
		<div className="space-y-4">
			<SkeletonLoader className="h-6 w-3/4" />
			<SkeletonLoader className="h-4 w-full" />
			<SkeletonLoader className="h-4 w-5/6" />
			<div className="flex space-x-2 mt-4">
				{Array.from({ length: 6 }).map((_, i) => (
					<SkeletonLoader key={i} className="w-12 h-12 rounded-full" />
				))}
			</div>
		</div>
	</div>
);

// Numbers loading skeleton
export const NumbersSkeleton: React.FC = () => (
	<div className="flex space-x-4 justify-center">
		{Array.from({ length: 6 }).map((_, i) => (
			<SkeletonLoader 
				key={i} 
				className="w-12 h-12 rounded-full" 
			/>
		))}
	</div>
);