import Link from 'next/link';

export default function Header() {
	return (
		<header className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white p-4 shadow-md">
			<div className="container mx-auto flex justify-between items-center">
				<h1 className="text-3xl font-bold">Mon Application Loto</h1>
				<nav>
					<ul className="flex space-x-4">
						<li>
							<Link href="/" passHref className="hover:text-secondary">
								Accueil
							</Link>
						</li>
						<li>
							<Link href="/features" passHref className="hover:text-secondary">
								Fonctionnalités
							</Link>
						</li>
						<li>
							<Link href="/add-draw" passHref className="hover:text-secondary">
								Ajouter un Tirage
							</Link>
						</li>
						<li>
							<Link href="/history" passHref className="hover:text-secondary">
								Historique
							</Link>
						</li>
						<li>
							<Link href="/analysis" passHref className="hover:text-secondary">
								Analyse
							</Link>
						</li>
					</ul>
				</nav>
			</div>
		</header>
	);
}
