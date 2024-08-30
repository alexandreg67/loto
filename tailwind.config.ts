import type { Config } from 'tailwindcss';

const config: Config = {
	content: [
		'./pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./components/**/*.{js,ts,jsx,tsx,mdx}',
		'./app/**/*.{js,ts,jsx,tsx,mdx}',
	],
	theme: {
		extend: {
			colors: {
				primary: '#1D4ED8', // Bleu professionnel
				secondary: '#9333EA', // Violet pour accentuer
				accent: '#10B981', // Vert pour les boutons et accents
				background: '#F3F4F6', // Gris clair pour le fond
				text: '#111827', // Noir pour le texte principal
			},
			fontFamily: {
				sans: ['Inter', 'sans-serif'],
			},
		},
	},
	plugins: [require('daisyui')],
	daisyui: {
		themes: [
			{
				mytheme: {
					primary: '#1D4ED8',
					secondary: '#9333EA',
					accent: '#10B981',
					neutral: '#3D4451',
					'base-100': '#FFFFFF',
					info: '#3ABFF8',
					success: '#36D399',
					warning: '#FBBD23',
					error: '#F87272',
				},
			},
		],
	},
};
export default config;
