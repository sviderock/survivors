import { batch, createEffect, createSignal, onCleanup, onMount } from 'solid-js';
import { createStore, produce } from 'solid-js/store';
import HealthBar from '~/components/HealthBar';
import { setTiles, tiles } from '~/components/Terrain';
import { spawnBullet } from '~/components/weapons/Bullets';
import {
	DIAGONAL_SPEED,
	GAME_WORLD_SIZE,
	PLAYER_BASE_COOLDOWN,
	PLAYER_BASE_HEALTH,
	PLAYER_SIZE,
	PLAYER_SPEED,
	SHOOTING_ANIMATION_DURATION_SS,
	TILE_SIZE,
	XP_LVL_2,
	XP_LVL_21_TO_40,
	XP_LVL_3_TO_20,
	XP_LVL_41_AND_UP,
} from '~/constants';
import { keyPressed } from '~/lib/keyboardEvents';
import { gameState, setWorldRect, worldRect } from '~/state';
import { bitwiseAbs, cn, getInitialRect, getNewPos, getRect } from '~/utils';

export const [playerRect, setPlayerRect] = createSignal(
	getInitialRect({ x: 0, y: 0, width: PLAYER_SIZE, height: PLAYER_SIZE }),
);
export const [player, setPlayer] = createStore<Player>({
	ref: undefined,
	health: PLAYER_BASE_HEALTH,
	maxHealth: PLAYER_BASE_HEALTH,
	movement: 'idle',
	direction: 'east',
	lastOccupiedTile: { x: 0, y: 0 },
	attack: {
		status: 'ready',
		direction: 'east',
		cooldown: PLAYER_BASE_COOLDOWN,
	},
});

export const relativePlayerPos = () => ({
	left: playerRect().left - worldRect.x,
	right: playerRect().right - worldRect.x,
	top: playerRect().top - worldRect.y,
	bottom: playerRect().bottom - worldRect.y,
	centerX: playerRect().left - worldRect.x + playerRect().width / 2,
	centerY: playerRect().top - worldRect.y + playerRect().height / 2,
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
	if (!keyPressed.w && !keyPressed.s && !keyPressed.a && !keyPressed.d) {
		return { newWorldX: worldRect.x, newWorldY: worldRect.y };
	}

	const playerSpeedModifier =
		(keyPressed.w && keyPressed.a) ||
		(keyPressed.w && keyPressed.d) ||
		(keyPressed.s && keyPressed.a) ||
		(keyPressed.s && keyPressed.d)
			? DIAGONAL_SPEED
			: 1;

	let newWorldX = worldRect.x;
	let newWorldY = worldRect.y;
	if (keyPressed.w) newWorldY += (PLAYER_SPEED * playerSpeedModifier) | 0;
	if (keyPressed.s) newWorldY -= (PLAYER_SPEED * playerSpeedModifier) | 0;
	if (keyPressed.a) newWorldX += (PLAYER_SPEED * playerSpeedModifier) | 0;
	if (keyPressed.d) newWorldX -= (PLAYER_SPEED * playerSpeedModifier) | 0;

	const { x, y } = updateOccupiedMatrix(playerRect().x + newWorldX, playerRect().y + newWorldY);

	batch(() => {
		setWorldRect(
			getNewPos({ x: newWorldX, y: newWorldY, width: GAME_WORLD_SIZE, height: GAME_WORLD_SIZE }),
		);

		if (player.lastOccupiedTile.x !== x || player.lastOccupiedTile.y !== y) {
			setTiles(
				'occupiedMatrix',
				produce((matrix) => {
					matrix[player.lastOccupiedTile.x]![player.lastOccupiedTile.y] = 0;
					matrix[x]![y] = 1;
				}),
			);
			setPlayer('lastOccupiedTile', { x, y });
		}
	});

	return { newWorldX, newWorldY };
}

function updateOccupiedMatrix(targetX: number, targetY: number) {
	const offsetTilesX = bitwiseAbs(tiles.rect.x) / TILE_SIZE;
	const offsetPlayerX = (bitwiseAbs(playerRect().x) / TILE_SIZE) * 2;
	const offsetWorldX = (targetX / TILE_SIZE) * -1;
	const x = (offsetTilesX + offsetPlayerX + offsetWorldX + 0.5) | 0;

	const offsetTilesY = bitwiseAbs(tiles.rect.y) / TILE_SIZE;
	const offsetPlayerY = (bitwiseAbs(playerRect().y) / TILE_SIZE) * 2;
	const offsetWorldY = (targetY / TILE_SIZE) * -1;
	const y = (offsetTilesY + offsetPlayerY + offsetWorldY + 1) | 0;

	return { x: x < 0 ? 0 : x, y: y < 0 ? 0 : y };
}

export default function Player() {
	onMount(() => {
		setPlayerRect({ ...getRect(player.ref!), width: PLAYER_SIZE, height: PLAYER_SIZE });
	});

	createEffect(() => {
		let attackTimeout: NodeJS.Timeout;
		if (player.attack.status === 'started_attack') {
			attackTimeout = setTimeout(() => {
				batch(() => {
					spawnBullet(player.attack.direction);
					setPlayer('attack', 'status', 'cooldown');
				});
			}, SHOOTING_ANIMATION_DURATION_SS * 1000);
		}

		onCleanup(() => {
			clearTimeout(attackTimeout);
		});
	});

	createEffect(() => {
		let cooldownTimeout: NodeJS.Timeout;
		if (player.attack.status === 'cooldown') {
			cooldownTimeout = setTimeout(() => {
				setPlayer('attack', 'status', 'ready');
			}, player.attack.cooldown);
		}

		onCleanup(() => {
			clearTimeout(cooldownTimeout);
		});
	});

	return (
		<div class="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center">
			<div ref={(ref) => setPlayer('ref', ref)} class="relative h-player-hitbox w-player-hitbox">
				<div
					class={cn(
						'relative left-1/2 top-1/2 h-player w-player -translate-x-1/2 -translate-y-1/2 animate-move-sprite-sheet-idle overflow-hidden bg-player will-change-bp [image-rendering:pixelated]',
						player.direction === 'west' && '-scale-x-100',
						player.movement === 'moving' && 'animate-move-sprite-sheet-run',
						player.attack.status === 'started_attack' &&
							player.attack.direction === 'north-west' &&
							'-scale-x-100 animate-move-sprite-sheet-shoot-north-east',
						player.attack.status === 'started_attack' &&
							player.attack.direction === 'north' &&
							'animate-move-sprite-sheet-shoot-north',
						player.attack.status === 'started_attack' &&
							player.attack.direction === 'north-east' &&
							'animate-move-sprite-sheet-shoot-north-east',
						player.attack.status === 'started_attack' &&
							player.attack.direction === 'east' &&
							'animate-move-sprite-sheet-shoot-east',
						player.attack.status === 'started_attack' &&
							player.attack.direction === 'south-east' &&
							'animate-move-sprite-sheet-shoot-south-east',
						player.attack.status === 'started_attack' &&
							player.attack.direction === 'south' &&
							'animate-move-sprite-sheet-shoot-south',
						player.attack.status === 'started_attack' &&
							player.attack.direction === 'south-west' &&
							'-scale-x-100 animate-move-sprite-sheet-shoot-south-east',
						player.attack.status === 'started_attack' &&
							player.attack.direction === 'west' &&
							'-scale-x-100 animate-move-sprite-sheet-shoot-east',
					)}
				/>
			</div>

			<HealthBar class="mt-1 h-3" currentHealth={player.health} maxHealth={player.maxHealth} />
		</div>
	);
}
