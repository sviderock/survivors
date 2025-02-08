import { createSignal, onCleanup, onMount } from 'solid-js';
import FPSCounter from '~/components/FPSCounter';
import MemoryUsage from '~/components/Memory';
import Ping from '~/components/Ping';

const SPEED = 1;
const MOVEMENT_INTERVAL_MS = 1;

export default function Game() {
	const [worldPos, setWorldPos] = createSignal({ x: 0, y: 0 });
	let intervalW: NodeJS.Timeout | undefined;
	let intervalS: NodeJS.Timeout | undefined;
	let intervalA: NodeJS.Timeout | undefined;
	let intervalD: NodeJS.Timeout | undefined;
	let worldRef: HTMLDivElement | undefined;

	onMount(() => {
		function onKeyDown(e: KeyboardEvent) {
			switch (e.key) {
				case 'w':
					if (intervalW) return;
					setWorldPos((pos) => ({ x: pos.x, y: pos.y + SPEED }));
					intervalW = setInterval(() => {
						setWorldPos((pos) => ({ x: pos.x, y: pos.y + SPEED }));
					}, MOVEMENT_INTERVAL_MS);
					break;
				case 's':
					if (intervalS) return;
					setWorldPos((pos) => ({ x: pos.x, y: pos.y - SPEED }));
					intervalS = setInterval(() => {
						setWorldPos((pos) => ({ x: pos.x, y: pos.y - SPEED }));
					}, MOVEMENT_INTERVAL_MS);
					break;
				case 'a':
					if (intervalA) return;
					setWorldPos((pos) => ({ x: pos.x + SPEED, y: pos.y }));
					intervalA = setInterval(() => {
						setWorldPos((pos) => ({ x: pos.x + SPEED, y: pos.y }));
					}, MOVEMENT_INTERVAL_MS);
					break;
				case 'd':
					if (intervalD) return;
					setWorldPos((pos) => ({ x: pos.x - SPEED, y: pos.y }));
					intervalD = setInterval(() => {
						setWorldPos((pos) => ({ x: pos.x - SPEED, y: pos.y }));
					}, MOVEMENT_INTERVAL_MS);
					break;
			}
		}

		function onKeyUp(e: KeyboardEvent) {
			switch (e.key) {
				case 'w':
					clearInterval(intervalW);
					intervalW = undefined;
					break;
				case 's':
					clearInterval(intervalS);
					intervalS = undefined;
					break;
				case 'a':
					clearInterval(intervalA);
					intervalA = undefined;
					break;
				case 'd':
					clearInterval(intervalD);
					intervalD = undefined;
					break;
			}
		}

		// function animate() {
		// 	requestAnimationFrame(animate);
		// }

		// requestAnimationFrame(animate);

		document.addEventListener('keydown', onKeyDown);
		document.addEventListener('keyup', onKeyUp);
		onCleanup(() => {
			document.removeEventListener('keydown', onKeyDown);
			document.removeEventListener('keyup', onKeyUp);
		});
	});

	return (
		<div class="relative h-lvh w-full overflow-hidden" ref={worldRef}>
			<Terrain worldPos={worldPos()} />
			<UIStats />
			<Player />
		</div>
	);
}

function UIStats() {
	return (
		<div class="absolute right-4 top-2 flex w-[270px] flex-col items-end justify-between rounded-md border-2 bg-white p-2 px-4">
			<MemoryUsage />
			<div class="flex gap-2">
				<Ping />

				<FPSCounter />
			</div>
		</div>
	);
}

function Player() {
	let ref: HTMLSpanElement | undefined;

	onMount(() => {
		console.log(ref?.getBoundingClientRect());
	});

	return (
		<span
			ref={ref}
			class="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 bg-red-500 transition-none"
		/>
	);
}

function Terrain(props: { worldPos: { x: number; y: number } }) {
	return (
		<div
			class="bg-forest bg-size absolute h-[2000px] w-[2000px] bg-[100px_100px]"
			style={{
				transform: `translate3d(${props.worldPos.x}px, ${props.worldPos.y}px, 0)`,
			}}
		/>
	);
}
