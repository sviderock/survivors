import { createSignal, onCleanup, onMount } from 'solid-js';
import FPSCounter from '~/components/FPSCounter';
import MemoryUsage from '~/components/Memory';
import Ping from '~/components/Ping';

type Rect = Omit<DOMRect, 'toJSON'>;

function getRect<T extends HTMLElement>(ref: T): Rect {
	const rect = ref.getBoundingClientRect();
	return {
		x: rect.x,
		y: rect.y,
		bottom: rect.bottom,
		top: rect.top,
		left: rect.left,
		right: rect.right,
		width: rect.width,
		height: rect.height,
	};
}

const PLAYER_SPEED = 5;
const ENEMY_SPEED = 1;

const [keyPressed, setKeyPressed] = createSignal({ w: false, s: false, a: false, d: false });
const [worldPos, setWorldPos] = createSignal({ x: 0, y: 0 });
const [playerPos, setPlayerPos] = createSignal<Rect>({
	x: 0,
	y: 0,
	bottom: 0,
	top: 0,
	left: 0,
	right: 0,
	width: 0,
	height: 0,
});
const [enemyPos, setEnemyPos] = createSignal<Rect>({
	x: 0,
	y: 0,
	bottom: 0,
	top: 0,
	left: 0,
	right: 0,
	width: 0,
	height: 0,
});

export default function Game() {
	let worldRef: HTMLDivElement | undefined;

	onMount(() => {
		function onKeyDown(e: KeyboardEvent) {
			if (e.key === 'w') return setKeyPressed((keyPressed) => ({ ...keyPressed, w: true }));
			if (e.key === 's') return setKeyPressed((keyPressed) => ({ ...keyPressed, s: true }));
			if (e.key === 'a') return setKeyPressed((keyPressed) => ({ ...keyPressed, a: true }));
			if (e.key === 'd') return setKeyPressed((keyPressed) => ({ ...keyPressed, d: true }));
		}

		function onKeyUp(e: KeyboardEvent) {
			if (e.key === 'w') return setKeyPressed((keyPressed) => ({ ...keyPressed, w: false }));
			if (e.key === 's') return setKeyPressed((keyPressed) => ({ ...keyPressed, s: false }));
			if (e.key === 'a') return setKeyPressed((keyPressed) => ({ ...keyPressed, a: false }));
			if (e.key === 'd') return setKeyPressed((keyPressed) => ({ ...keyPressed, d: false }));
		}

		function animate() {
			let newX = worldPos().x;
			let newY = worldPos().y;
			if (keyPressed().w) newY += PLAYER_SPEED;
			if (keyPressed().s) newY -= PLAYER_SPEED;
			if (keyPressed().a) newX += PLAYER_SPEED;
			if (keyPressed().d) newX -= PLAYER_SPEED;
			setWorldPos({ x: newX, y: newY });

			const relativePlayerPos = {
				left: playerPos().left - newX,
				right: playerPos().right - newX,
				top: playerPos().top - newY,
				bottom: playerPos().bottom - newY,
			};

			const enemyCenter = {
				x: enemyPos().x + enemyPos().width / 2,
				y: enemyPos().y + enemyPos().height / 2,
			};

			let newEnemyX = enemyPos().x;
			let newEnemyY = enemyPos().y;
			switch (true) {
				case enemyCenter.x < relativePlayerPos.left:
					newEnemyX += ENEMY_SPEED;
					break;

				case enemyCenter.x > relativePlayerPos.right:
					newEnemyX -= ENEMY_SPEED;
					break;
			}

			switch (true) {
				case enemyCenter.y < relativePlayerPos.top:
					newEnemyY += ENEMY_SPEED;
					break;

				case enemyCenter.y > relativePlayerPos.bottom:
					newEnemyY -= ENEMY_SPEED;
					break;
			}
			setEnemyPos((pos) => ({ ...pos, x: newEnemyX, y: newEnemyY }));

			requestAnimationFrame(animate);
		}

		requestAnimationFrame(animate);

		document.addEventListener('keydown', onKeyDown);
		document.addEventListener('keyup', onKeyUp);
		onCleanup(() => {
			document.removeEventListener('keydown', onKeyDown);
			document.removeEventListener('keyup', onKeyUp);
		});
	});

	return (
		<div class="relative h-lvh w-full overflow-hidden" ref={worldRef}>
			<GameField />
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
		const rect = getRect(ref!);
		setPlayerPos(rect);
	});

	return (
		<span
			ref={ref}
			class="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 bg-red-500 transition-none"
		/>
	);
}

function GameField() {
	let enemyRef: HTMLSpanElement | undefined;

	onMount(() => {
		const rect = getRect(enemyRef!);
		setEnemyPos(rect);
	});

	return (
		<div
			class="bg-forest bg-size absolute h-[2000px] w-[2000px] bg-[100px_100px]"
			style={{
				transform: `translate3d(${worldPos().x}px, ${worldPos().y}px, 0)`,
			}}
		>
			<span
				ref={enemyRef}
				class="absolute h-8 w-8 bg-blue-500"
				style={{ transform: `translate3d(${enemyPos().x}px, ${enemyPos().y}px, 0)` }}
			/>
		</div>
	);
}
