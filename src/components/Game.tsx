import { createEffect, createSignal, For, onCleanup, onMount } from 'solid-js';
import { createStore } from 'solid-js/store';
import FPSCounter from '~/components/FPSCounter';
import MemoryUsage from '~/components/Memory';
import Ping from '~/components/Ping';
import FaSolidArrowRightLong from '~/icons/FaSolidArrowRightLong';
import { cn } from '~/utils';

type RectSides = Pick<DOMRect, 'left' | 'right' | 'top' | 'bottom'>;
type RectCoords = Pick<DOMRect, 'x' | 'y'>;
type RectSize = Pick<DOMRect, 'width' | 'height'>;
type RectCenter = { centerX: number; centerY: number };
type Rect = RectSides & RectCoords & RectSize & RectCenter;

function getDiagonalDistance(distance: number) {
	return distance * (1 / Math.sqrt(2));
}

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
		centerX: rect.x + rect.width / 2,
		centerY: rect.y + rect.height / 2,
	};
}

function getNewPos({
	x,
	y,
	width,
	height,
}: {
	x: number;
	y: number;
	width: number;
	height: number;
}): RectSides & RectCoords & RectCenter {
	return {
		x: x,
		y: y,
		left: x,
		right: x + width,
		top: y,
		bottom: y + height,
		centerX: x + width / 2,
		centerY: y + height / 2,
	};
}

const getInitialRect = (): Rect => ({
	x: 0,
	y: 0,
	bottom: 0,
	top: 0,
	left: 0,
	right: 0,
	width: 0,
	height: 0,
	centerX: 0,
	centerY: 0,
});

function getRotationDeg(comb: ReturnType<typeof lastPressedCombination>) {
	if (comb === 'wa') return -45;
	if (comb === 'wd') return 45;
	if (comb === 'sa') return -135;
	if (comb === 'sd') return 135;
	if (comb === 'd') return 90;
	if (comb === 'a') return -90;
	if (comb === 's') return 180;
	return 0;
}

function getRotationClass(comb: ReturnType<typeof lastPressedCombination>) {
	if (comb === 'wa') return '-rotate-45';
	if (comb === 'wd') return 'rotate-45';
	if (comb === 'sa') return '-rotate-[135deg]';
	if (comb === 'sd') return 'rotate-[135deg]';
	if (comb === 'd') return 'rotate-90';
	if (comb === 'a') return '-rotate-90';
	if (comb === 's') return 'rotate-180';
	return 'flex';
}

const relativePlayerPos = () => ({
	left: playerPos().left - worldPos().x,
	right: playerPos().right - worldPos().x,
	top: playerPos().top - worldPos().y,
	bottom: playerPos().bottom - worldPos().y,
	centerX: playerPos().left - worldPos().x + playerPos().width / 2,
	centerY: playerPos().top - worldPos().y + playerPos().height / 2,
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

	const relPlayerPos = {
		left: playerPos().left - newX,
		right: playerPos().right - newX,
		top: playerPos().top - newY,
		bottom: playerPos().bottom - newY,
	};

	for (let i = 0; i < enemies().length; i++) {
		const [enemy, setEnemy] = enemies()[i];

		const enemyCenter = {
			x: enemy().x + enemy().width / 2,
			y: enemy().y + enemy().height / 2,
		};

		let newEnemyX = enemy().x;
		let newEnemyY = enemy().y;
		switch (true) {
			case enemyCenter.x < relPlayerPos.left:
				newEnemyX += ENEMY_SPEED;
				break;

			case enemyCenter.x > relPlayerPos.right:
				newEnemyX -= ENEMY_SPEED;
				break;
		}

		switch (true) {
			case enemyCenter.y < relPlayerPos.top:
				newEnemyY += ENEMY_SPEED;
				break;

			case enemyCenter.y > relPlayerPos.bottom:
				newEnemyY -= ENEMY_SPEED;
				break;
		}

		setEnemy((pos) => ({
			...pos,
			...getNewPos({ x: newEnemyX, y: newEnemyY, width: pos.width, height: pos.height }),
		}));
	}

	if (bulletPos().firedAt) {
		if (bulletPos().x === bulletPos().firedAt!.x && bulletPos().y === bulletPos().firedAt!.y) {
			setBulletPos((pos) => ({
				...pos,
				...getNewPos({
					x: relativePlayerPos().centerX - pos.width / 2,
					y: relativePlayerPos().centerY - pos.height / 2,
					width: pos.width,
					height: pos.height,
				}),
				firedAt: null,
			}));
		} else {
			let newBulletX = bulletPos().x;
			let newBulletY = bulletPos().y;

			const deltaX = Math.abs(bulletPos().x - bulletPos().firedAt!.x);
			if (deltaX) {
				switch (true) {
					case bulletPos().x < bulletPos().firedAt!.x:
						newBulletX += deltaX < BULLET_SPEED ? deltaX : BULLET_SPEED;
						break;
					case bulletPos().x > bulletPos().firedAt!.x:
						newBulletX -= deltaX <= BULLET_SPEED ? deltaX : BULLET_SPEED;
						break;
				}
			}

			const deltaY = Math.abs(bulletPos().y - bulletPos().firedAt!.y);
			switch (true) {
				case bulletPos().y < bulletPos().firedAt!.y:
					newBulletY += deltaY <= BULLET_SPEED ? deltaY : BULLET_SPEED;
					break;
				case bulletPos().y > bulletPos().firedAt!.y:
					newBulletY -= deltaY <= BULLET_SPEED ? deltaY : BULLET_SPEED;
					break;
			}

			setBulletPos((pos) => ({
				...pos,
				...getNewPos({ x: newBulletX, y: newBulletY, width: pos.width, height: pos.height }),
			}));
		}

		for (let i = 0; i < enemies().length; i++) {
			const [enemy] = enemies()[i];
			if (collisionDetected(bulletPos(), enemy())) {
				setEnemies((prev) => prev.filter((_, idx) => idx !== i));
				setGameState('experience', (exp) => exp + 1);
			}
		}
	}

	// if (collisionDetected(enemyPos(), relPlayerPos)) {
	// 	// setGameState('status', 'lost');
	// }

	requestAnimationFrame(gameLoop);
}

function runGameLoop() {
	requestAnimationFrame(gameLoop);
}

function createEnemies() {
	const [enemy, setEnemy] = createSignal(getInitialRect());
	const [enemies, setEnemies] = createSignal([[enemy, setEnemy] as const]);
	return [enemies, setEnemies] as const;
}

const PLAYER_SPEED = 5;
const ENEMY_SPEED = 1;
const BULLET_SPEED = 7;
const BULLET_DISTANCE = 500;

const [gameState, setGameState] = createStore({
	experience: 0,
	status: 'in_progress' as 'idle' | 'won' | 'lost' | 'in_progress',
});

const [enemies, setEnemies] = createEnemies();
const [keyPressed, setKeyPressed] = createStore({ w: false, s: false, a: false, d: false });
const [worldPos, setWorldPos] = createSignal({ x: 0, y: 0 });
const [playerPos, setPlayerPos] = createSignal(getInitialRect());
const [bulletPos, setBulletPos] = createSignal({
	...getInitialRect(),
	rotation: getRotationDeg('w') as ReturnType<typeof getRotationDeg>,
	firedAt: null as {
		x: number;
		y: number;
	} | null,
});
const [lastPressedCombination, setLastPressedCombination] = createSignal(
	'w' as 'wa' | 'wd' | 'sa' | 'sd' | 'w' | 's' | 'a' | 'd'
);

export default function Game() {
	let worldRef: HTMLDivElement;

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

	createEffect(() => {
		if (keyPressed.w && keyPressed.a) return setLastPressedCombination('wa');
		if (keyPressed.w && keyPressed.d) return setLastPressedCombination('wd');
		if (keyPressed.s && keyPressed.a) return setLastPressedCombination('sa');
		if (keyPressed.s && keyPressed.d) return setLastPressedCombination('sd');
		if (keyPressed.w) return setLastPressedCombination('w');
		if (keyPressed.s) return setLastPressedCombination('s');
		if (keyPressed.a) return setLastPressedCombination('a');
		if (keyPressed.d) return setLastPressedCombination('d');
	});

	return (
		<div class="relative h-lvh w-full overflow-hidden" ref={worldRef!}>
			<GameField />
			<UIStats />
			<Player />

			{/* <Banner /> */}
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
	let playerRef: HTMLDivElement;

	onMount(() => {
		const playerRect = getRect(playerRef!);
		setPlayerPos(playerRect);
	});

	return (
		<>
			<div
				ref={playerRef!}
				class="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center border-2 border-red-800 bg-red-500 text-white transition-none"
			>
				<strong>{gameState.experience}</strong>
				<span>EXP</span>
				<FaSolidArrowRightLong
					class={cn(
						!lastPressedCombination() && 'opacity-0',
						getRotationClass(lastPressedCombination())
					)}
				/>
			</div>
		</>
	);
}

function GameField() {
	const enemyRefs: HTMLSpanElement[] = [];

	onMount(() => {
		enemies().forEach(([, setEnemy], idx) => {
			const rect = getRect(enemyRefs[idx]);
			setEnemy(rect);
		});
	});

	return (
		<div
			class="bg-size absolute h-[2000px] w-[2000px] bg-forest bg-[100px_100px]"
			style={{
				transform: `translate3d(${worldPos().x}px, ${worldPos().y}px, 0)`,
			}}
		>
			<For each={enemies()}>
				{([enemy], idx) => (
					<span
						ref={enemyRefs[idx()]}
						class="absolute h-8 w-8 bg-blue-500"
						style={{ transform: `translate3d(${enemy().x}px, ${enemy().y}px, 0)` }}
					/>
				)}
			</For>

			<Bullet />
		</div>
	);
}

function Banner() {
	return (
		<div
			class={cn(
				'absolute left-0 top-0 z-50 flex h-full w-full items-center justify-center text-9xl uppercase',
				gameState.status !== 'won' && gameState.status !== 'lost' && 'hidden',
				gameState.status === 'won' && 'bg-green-500/50',
				gameState.status === 'lost' && 'bg-red-500/50'
			)}
		>
			{gameState.status}
		</div>
	);
}

function getBulletDistance() {
	if (lastPressedCombination() === 'w') return { x: 0, y: -BULLET_DISTANCE };
	if (lastPressedCombination() === 's') return { x: 0, y: BULLET_DISTANCE };
	if (lastPressedCombination() === 'a') return { x: -BULLET_DISTANCE, y: 0 };
	if (lastPressedCombination() === 'd') return { x: BULLET_DISTANCE, y: 0 };
	if (lastPressedCombination() === 'wa') {
		return { x: -getDiagonalDistance(BULLET_DISTANCE), y: -getDiagonalDistance(BULLET_DISTANCE) };
	}
	if (lastPressedCombination() === 'wd') {
		return { x: getDiagonalDistance(BULLET_DISTANCE), y: -getDiagonalDistance(BULLET_DISTANCE) };
	}
	if (lastPressedCombination() === 'sa') {
		return { x: -getDiagonalDistance(BULLET_DISTANCE), y: getDiagonalDistance(BULLET_DISTANCE) };
	}
	// sd
	return { x: getDiagonalDistance(BULLET_DISTANCE), y: getDiagonalDistance(BULLET_DISTANCE) };
}

function Bullet() {
	let ref: HTMLDivElement;
	let firingBulletInterval: NodeJS.Timeout;

	onMount(() => {
		const bulletRect = getRect(ref!);
		const bulletStartX = playerPos().centerX - bulletRect.width / 2;
		const bulletStartY = playerPos().centerY - bulletRect.height / 2;
		setBulletPos((pos) => ({
			...pos,
			...getNewPos({
				x: bulletStartX,
				y: bulletStartY,
				width: bulletRect.width,
				height: bulletRect.height,
			}),
		}));

		firingBulletInterval = setInterval(() => {
			const bulletRect = getRect(ref!);
			const bulletStartX = relativePlayerPos().centerX - bulletRect.width / 2;
			const bulletStartY = relativePlayerPos().centerY - bulletRect.height / 2;
			setBulletPos((pos) => ({
				...pos,
				...getNewPos({
					x: bulletStartX,
					y: bulletStartY,
					width: bulletRect.width,
					height: bulletRect.height,
				}),
				rotation: getRotationDeg(lastPressedCombination()),
				firedAt: {
					x: relativePlayerPos().centerX + getBulletDistance().x,
					y: relativePlayerPos().centerY + getBulletDistance().y,
				},
			}));
		}, 1000);
	});

	onCleanup(() => {
		clearInterval(firingBulletInterval);
	});

	return (
		<span
			ref={ref!}
			class={cn('absolute flex h-8 w-2 bg-purple-700', !bulletPos().firedAt && 'opacity-0')}
			style={{
				'transform-origin': 'center center',
				transform: `translate3d(${bulletPos().x}px, ${bulletPos().y}px, 0) rotate(${bulletPos().rotation}deg)`,
			}}
		/>
	);
}
