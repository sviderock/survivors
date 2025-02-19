import { createEffect, createSignal, For, onMount } from 'solid-js';
import { produce } from 'solid-js/store';
import Character from '~/components/Character';
import { relativePlayerPos } from '~/components/Player';
import {
	ENEMY_ATTACK_COOLDOWN,
	ENEMY_BASE_HEALTH,
	ENEMY_SIZE,
	PLAYER_SIZE,
	WORLD_SIZE,
} from '~/constants';
import { LoadingSpinner } from '~/icons/LoadingSpinner';
import { gameState, setGameState, world } from '~/state';
import { cn, getInitialRect, getRandomBetween, getRect } from '~/utils';

function createSingleEnemy(): Enemy {
	const initialRect = getInitialRect({
		width: ENEMY_SIZE,
		height: ENEMY_SIZE,
		x: relativePlayerPos().centerX + getRandomBetween(300, 300),
		y: relativePlayerPos().centerY + getRandomBetween(0, 0, true),
	});
	const [rect, setRect] = createSignal(initialRect);
	const [attackStatus, setAttackStatus] = createSignal<EnemyAttackStatus>('ready');
	const health = getRandomBetween(1, ENEMY_BASE_HEALTH);
	return {
		ref: undefined,
		rect,
		setRect,
		attack: 3,
		attackStatus,
		setAttackStatus,
		health,
		maxHealth: health,
		blocked: { left: false, right: false, top: false, bottom: false },
	};
}

export function spawnEnemy() {
	setGameState(
		'enemies',
		produce((enemies) => enemies.push(createSingleEnemy())),
	);
}

export function destroyEnemy(idx: number) {
	setGameState('enemies', (prev) => prev.filter((_, i) => idx !== i));
}

export default function Enemies() {
	onMount(() => {
		gameState.enemies.forEach((enemy) => {
			const rect = getRect(enemy.ref!);
			enemy.setRect(rect);
		});
	});

	return (
		<For each={gameState.enemies}>
			{(enemy, idx) => (
				<Enemy idx={idx()} enemy={enemy} ref={(el) => setGameState('enemies', idx(), 'ref', el)} />
			)}
		</For>
	);
}

interface EnemyProps {
	ref: (ref: HTMLDivElement) => void;
	enemy: Enemy;
	idx: number;
}

function Enemy(props: EnemyProps) {
	createEffect(() => {
		if (props.enemy.attackStatus() === 'hit') {
			props.enemy.setAttackStatus('cooldown');
			setTimeout(() => {
				props.enemy.setAttackStatus('ready');
			}, ENEMY_ATTACK_COOLDOWN);
		}
	});

	return (
		<Character
			ref={props.ref}
			direction={'east'}
			hitboxSize={80}
			size={PLAYER_SIZE}
			spriteSrc="/game-assets/Factions/Goblins/Troops/Torch/Red/Torch_Red.png"
			class={cn('animate-move-sprite-sheet-enemy-idle')}
			wrapperClass="absolute"
			wrapperStyle={{
				transform: `translate3d(calc(${props.enemy.rect().x}px + ${world.rect.x}px), calc(${props.enemy.rect().y}px + ${world.rect.y}px - ${WORLD_SIZE}px), 0)`,
			}}
		/>
	);
}
