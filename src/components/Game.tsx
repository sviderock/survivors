import { createEffect, createSignal, Match, onCleanup, onMount, Show, Switch } from 'solid-js';
import { createStore } from 'solid-js/store';
import FPSCounter from '~/components/FPSCounter';
import MemoryUsage from '~/components/Memory';
import Ping from '~/components/Ping';
import FaSolidArrowRightLong from '~/icons/FaSolidArrowRightLong';
import { cn } from '~/utils';

type RectSides = Pick<DOMRect, 'left' | 'right' | 'top' | 'bottom'>;
type Rect = RectSides & Pick<DOMRect, 'x' | 'y' | 'width' | 'height'>;

function collisionDetected<T extends RectSides>(a: T, b: T) {
	return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

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

const getInitialRect = () => ({
	x: 0,
	y: 0,
	bottom: 0,
	top: 0,
	left: 0,
	right: 0,
	width: 0,
	height: 0,
});

function gameLoop() {
	if (gameState.status !== 'in_progress') return;

	let newX = worldPos().x;
	let newY = worldPos().y;
	if (keyPressed.w) newY += PLAYER_SPEED;
	if (keyPressed.s) newY -= PLAYER_SPEED;
	if (keyPressed.a) newX += PLAYER_SPEED;
	if (keyPressed.d) newX -= PLAYER_SPEED;
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
	setEnemyPos((pos) => ({
		...pos,
		x: newEnemyX,
		y: newEnemyY,
		left: newEnemyX,
		right: newEnemyX + pos.width,
		top: newEnemyY,
		bottom: newEnemyY + pos.height,
	}));

	if (collisionDetected(enemyPos(), relativePlayerPos)) {
		setGameState('status', 'lost');
	}

	requestAnimationFrame(gameLoop);
}

function runGameLoop() {
	requestAnimationFrame(gameLoop);
}

const PLAYER_SPEED = 5;
const ENEMY_SPEED = 1;

const [gameState, setGameState] = createStore({
	experience: 0,
	status: 'in_progress' as 'idle' | 'won' | 'lost' | 'in_progress',
});

const [keyPressed, setKeyPressed] = createStore({ w: false, s: false, a: false, d: false });
const [worldPos, setWorldPos] = createSignal({ x: 0, y: 0 });
const [playerPos, setPlayerPos] = createSignal<Rect>(getInitialRect());
const [enemyPos, setEnemyPos] = createSignal<Rect>(getInitialRect());

const pressedCombination = () => {
	if (keyPressed.w && keyPressed.a) return 'wa';
	if (keyPressed.w && keyPressed.d) return 'wd';
	if (keyPressed.s && keyPressed.a) return 'sa';
	if (keyPressed.s && keyPressed.d) return 'sd';
	if (keyPressed.w) return 'w';
	if (keyPressed.s) return 's';
	if (keyPressed.a) return 'a';
	if (keyPressed.d) return 'd';
};

export default function Game() {
	let worldRef: HTMLDivElement | undefined;

	onMount(() => {
		function onKeyDown(e: KeyboardEvent) {
			if (e.key === 'w') return setKeyPressed('w', true);
			if (e.key === 's') return setKeyPressed('s', true);
			if (e.key === 'a') return setKeyPressed('a', true);
			if (e.key === 'd') return setKeyPressed('d', true);
		}

		function onKeyUp(e: KeyboardEvent) {
			if (e.key === 'w') return setKeyPressed('w', false);
			if (e.key === 's') return setKeyPressed('s', false);
			if (e.key === 'a') return setKeyPressed('a', false);
			if (e.key === 'd') return setKeyPressed('d', false);
		}

		runGameLoop();

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

			<Banner />
		</div>
	);
}

function UIStats() {
	return (
		<div class="absolute right-4 top-2 flex w-[300px] flex-col items-end justify-between rounded-md border-2 bg-white p-2 px-4">
			<MemoryUsage />
			<div class="flex gap-2">
				<Ping />

				<FPSCounter />
			</div>
		</div>
	);
}

function Player() {
	let ref: HTMLDivElement | undefined;

	onMount(() => {
		const rect = getRect(ref!);
		setPlayerPos(rect);
	});

	return (
		<div
			ref={ref}
			class="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center border-2 border-red-800 bg-red-500 text-white transition-none"
		>
			<strong>{gameState.experience}</strong>
			<span>EXP</span>
			<FaSolidArrowRightLong
				class={cn(
					!pressedCombination() && 'opacity-0',
					pressedCombination() === 'wa' && '-rotate-[135deg]',
					pressedCombination() === 'wd' && '-rotate-45',
					pressedCombination() === 'sa' && '-rotate-90',
					pressedCombination() === 'sd' && 'rotate-45',
					pressedCombination() === 'w' && '-rotate-90',
					pressedCombination() === 'a' && 'rotate-180',
					pressedCombination() === 's' && 'rotate-90',
					pressedCombination() === 'sa' && 'rotate-[135deg]'
				)}
			/>
		</div>
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

function Banner() {
	return (
		<Switch>
			<Match when={gameState.status === 'won'}>
				<div class="absolute left-0 top-0 z-50 flex h-full w-full items-center justify-center bg-green-500/50 text-9xl">
					WON
				</div>
			</Match>
			<Match when={gameState.status === 'lost'}>
				<div class="absolute left-0 top-0 z-50 flex h-full w-full items-center justify-center bg-red-500/50 text-9xl">
					LOST
				</div>
			</Match>
		</Switch>
	);
}
