import { createEffect, createSignal, For, onMount } from 'solid-js';
import { createStore, produce } from 'solid-js/store';
import HealthBar from '~/components/HealthBar';
import { relativePlayerPos } from '~/components/Player';
import { ENEMY_ATTACK_COOLDOWN, ENEMY_BASE_HEALTH, ENEMY_SIZE } from '~/constants';
import { LoadingSpinner } from '~/icons/LoadingSpinner';
import { cn, getInitialRect, getRandomBetween, getRect } from '~/utils';

export const [enemies, setEnemies] = createStore<Enemy[]>([]);

function createSingleEnemy(): Enemy {
	const initialRect = getInitialRect({
		width: ENEMY_SIZE,
		height: ENEMY_SIZE,
		x: relativePlayerPos().centerX + getRandomBetween(500, 1500, true),
		y: relativePlayerPos().centerY + getRandomBetween(500, 1500, true),
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
	setEnemies(produce((enemies) => enemies.push(createSingleEnemy())));
}

export function destroyEnemy(idx: number) {
	setEnemies((prev) => prev.filter((_, i) => idx !== i));
}

export default function Enemies() {
	onMount(() => {
		enemies.forEach((enemy) => {
			const rect = getRect(enemy.ref!);
			enemy.setRect(rect);
		});
	});

	return (
		<For each={enemies}>
			{(enemy, idx) => (
				<Enemy idx={idx()} enemy={enemy} ref={(el) => setEnemies(idx(), 'ref', el)} />
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
		<div
			class="absolute flex flex-col items-center justify-center"
			style={{
				// transition: 'transform 2s linear',
				transform: `translate3d(${props.enemy.rect().x}px, ${props.enemy.rect().y}px, 0)`,
			}}
		>
			<div
				ref={(el) => setEnemies(props.idx, 'ref', el)}
				class={cn(
					'flex items-center justify-center border-2 border-blue-900 bg-blue-500',
					props.enemy.blocked.left && 'border-l-red-500',
					props.enemy.blocked.right && 'border-r-red-500',
					props.enemy.blocked.top && 'border-t-red-500',
					props.enemy.blocked.bottom && 'border-b-red-500',
				)}
				style={{
					width: `${ENEMY_SIZE}px`,
					height: `${ENEMY_SIZE}px`,
				}}
			>
				<LoadingSpinner
					class={cn('opacity-0', props.enemy.attackStatus() === 'cooldown' && 'opacity-1')}
				/>
			</div>

			<HealthBar
				currentHealth={props.enemy.health}
				maxHealth={props.enemy.maxHealth}
				class="mt-0.5 h-2"
			/>
		</div>
	);
}
