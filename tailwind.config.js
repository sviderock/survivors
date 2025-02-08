/** @type {import('tailwindcss').Config} */
export default {
	content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
	theme: {
		extend: {
			backgroundImage: {
				forest: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewbox="0 0 113.75 117.6" width="113.75" height="117.6" style="opacity: 0.3; filter: grayscale(0.3);"><text x="0em" y="1em" font-size="35" transform="rotate(0 21.875 21)">🌲</text><text x="1.625em" y="2.4em" font-size="35" transform="rotate(0 78.75 70)">🌲</text></svg>');`,
			},
		},
	},
	plugins: [],
};
