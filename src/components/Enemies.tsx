import { createEffect, For } from 'solid-js';
import { relativePlayerPos } from '~/components/Player';
import { ENEMY_ATTACK_COOLDOWN, ENEMY_BASE_HEALTH, ENEMY_SIZE } from '~/constants';
import { gameState, setGameState } from '~/state';
import { cn, getInitialRect, getRandomBetween } from '~/utils';

function createSingleEnemy(): Enemy {
	const health = getRandomBetween(1, ENEMY_BASE_HEALTH);
	return {
		ref: undefined,
		attack: 3,
		attackStatus: 'ready',
		health,
		maxHealth: health,
		blocked: { left: false, right: false, top: false, bottom: false },
		status: 'idle',
		dirX: 0,
		rect: getInitialRect({
			width: ENEMY_SIZE,
			height: ENEMY_SIZE,
			x: relativePlayerPos().centerX + getRandomBetween(500, 1000, true),
			y: relativePlayerPos().centerY + getRandomBetween(500, 1000, true),
		}),
	};
}

export function spawnEnemy() {
	setGameState('enemies', gameState.enemies.length, createSingleEnemy());
}

export function destroyEnemy(idx: number) {
	setGameState(
		'enemies',
		gameState.enemies.filter((_, i) => idx !== i),
	);
}

export default function Enemies() {
	return (
		<For each={gameState.enemies}>
			{(enemy, idx) => (
				<Enemy
					idx={idx()}
					rect={enemy.rect}
					dirX={enemy.dirX}
					ref={(el) => setGameState('enemies', idx(), 'ref', el)}
				/>
			)}
		</For>
	);
}

interface EnemyProps {
	ref: (ref: HTMLDivElement) => void;
	idx: number;
	rect: Rect;
	dirX: Enemy['dirX'];
}

function Enemy(props: EnemyProps) {
	createEffect(() => {
		if (gameState.enemies[props.idx]!.attackStatus === 'hit') {
			setGameState('enemies', props.idx, 'attackStatus', 'cooldown');
			setTimeout(() => {
				if (gameState.enemies[props.idx]) {
					setGameState('enemies', props.idx, 'attackStatus', 'ready');
				}
			}, ENEMY_ATTACK_COOLDOWN);
		}
	});

	return (
		<div ref={props.ref} class="absolute h-enemy-hitbox w-enemy-hitbox">
			<div
				class={cn(
					'relative left-1/2 top-1/2 h-enemy w-enemy -translate-x-1/2 -translate-y-1/2 animate-move-sprite-sheet-enemy-run overflow-hidden bg-enemy will-change-bp [image-rendering:pixelated]',
					props.dirX === -1 && '-scale-x-100',
				)}
			/>
		</div>
	);
}
