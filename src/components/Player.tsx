import { createEffect, onMount } from 'solid-js';
import { createStore, produce } from 'solid-js/store';
import Character from '~/components/Character';
import { spawnEnemy } from '~/components/Enemies';
import HealthBar from '~/components/HealthBar';
import {
	BASE_HEALTH,
	DIAGONAL_SPEED,
	PLAYER_SIZE,
	PLAYER_SPEED,
	XP_LVL_2,
	XP_LVL_21_TO_40,
	XP_LVL_3_TO_20,
	XP_LVL_41_AND_UP,
} from '~/constants';
import { gameState, keyPressed, setWorld, world } from '~/state';
import { cn, getInitialRect, getNewPos, getRect } from '~/utils';

export const [player, setPlayer] = createStore<Player>({
	ref: undefined,
	rect: getInitialRect({ x: 0, y: 0, width: PLAYER_SIZE, height: PLAYER_SIZE }),
	health: BASE_HEALTH,
	maxHealth: BASE_HEALTH,
	state: { type: 'idle', direction: 'east' },
});

export const relativePlayerPos = () => ({
	left: player.rect.left - world.rect.x,
	right: player.rect.right - world.rect.x,
	top: player.rect.top - world.rect.y,
	bottom: player.rect.bottom - world.rect.y,
	centerX: player.rect.left - world.rect.x + player.rect.width / 2,
	centerY: player.rect.top - world.rect.y + player.rect.height / 2,
});

export const playerLevel = () => {
	if (gameState.experience < XP_LVL_2) {
		return { level: 1, exp: gameState.experience, xpToNextLevel: XP_LVL_2 };
	}

	if (gameState.experience === XP_LVL_2) {
		return {
			level: 2,
			exp: gameState.experience - XP_LVL_2,
			xpToNextLevel: XP_LVL_2 + XP_LVL_3_TO_20,
		};
	}

	let accumulatedXP = gameState.experience - XP_LVL_2;
	let level = 2;
	let xpIncrease = XP_LVL_3_TO_20;
	let xpToNextLevel = XP_LVL_2 + XP_LVL_3_TO_20;
	while (accumulatedXP > 0) {
		if (accumulatedXP < xpToNextLevel) break;

		level++;
		if (level >= 20 && level < 40) {
			xpIncrease = XP_LVL_21_TO_40;
		} else if (level >= 40) {
			xpIncrease = XP_LVL_41_AND_UP;
		}

		accumulatedXP -= xpToNextLevel;
		xpToNextLevel += xpIncrease;
	}

	return { level, xpToNextLevel, exp: accumulatedXP };
};

export function movePlayer() {
	const playerSpeedModifier =
		(keyPressed.w && keyPressed.a) ||
		(keyPressed.w && keyPressed.d) ||
		(keyPressed.s && keyPressed.a) ||
		(keyPressed.s && keyPressed.d)
			? DIAGONAL_SPEED
			: 1;

	let newWorldX = world.rect.x;
	let newWorldY = world.rect.y;
	if (keyPressed.w) newWorldY += (PLAYER_SPEED * playerSpeedModifier) | 0;
	if (keyPressed.s) newWorldY -= (PLAYER_SPEED * playerSpeedModifier) | 0;
	if (keyPressed.a) newWorldX += (PLAYER_SPEED * playerSpeedModifier) | 0;
	if (keyPressed.d) newWorldX -= (PLAYER_SPEED * playerSpeedModifier) | 0;

	setWorld('rect', (rect) =>
		getNewPos({ x: newWorldX, y: newWorldY, width: rect.width, height: rect.height }),
	);

	return { newWorldX, newWorldY };
}

export default function Player() {
	onMount(() => {
		setPlayer(
			produce((player) => {
				player.rect = { ...getRect(player.ref!), width: PLAYER_SIZE, height: PLAYER_SIZE };
			}),
		);

		setTimeout(() => {
			spawnEnemy();
		}, 1);
	});

	return (
		<div
			class={cn(
				'pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center',
			)}
		>
			<Character
				ref={(ref) => setPlayer('ref', ref)}
				hitboxSize={80}
				size={PLAYER_SIZE}
				spriteSrc="/game-assets/Factions/Knights/Troops/Archer/Blue/Archer_Blue.png"
				wrapperStyle={{
					transform: `scaleX(${player.state.direction === 'west' ? -1 : 1})`,
				}}
				class={cn(
					'animate-move-sprite-sheet-idle',
					player.state.type === 'moving' && 'animate-move-sprite-sheet-run',
				)}
			/>

			<HealthBar class="mt-1 h-3" currentHealth={player.health} maxHealth={player.maxHealth} />
		</div>
	);
}
