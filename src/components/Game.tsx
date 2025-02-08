import FPSCounter from '~/components/FPSCounter';
import Ping from '~/components/Ping';

export default function Game() {
	return (
		<div class="relative h-lvh w-full">
			<UIStats />
		</div>
	);
}

function UIStats() {
	return (
		<div class="absolute right-4 top-0 flex w-32 justify-between gap-4">
			<Ping />
			<FPSCounter />
		</div>
	);
}
