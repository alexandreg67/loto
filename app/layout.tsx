import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from './components/Header';
import Footer from './components/Footer';
import { ErrorBoundary } from './components/ErrorBoundary';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
	title: 'Loto Analyzer - Analyse Avancée des Tirages',
	description: 'Application d\'analyse statistique avancée pour les tirages de la loterie française. Algorithmes de prédiction basés sur l\'analyse fréquentielle, les chaînes de Markov et la détection de motifs.',
	keywords: 'loto, loterie, analyse statistique, prédiction, algorithmes, fréquence, probabilités',
	authors: [{ name: 'Alex' }],
	robots: 'index, follow',
};

export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="fr" className="scroll-smooth">
			<body className={`${inter.className} antialiased`}>
				<ErrorBoundary>
					<Header />
					<main className="min-h-screen">
						{children}
					</main>
					<Footer />
				</ErrorBoundary>
			</body>
		</html>
	);
}
