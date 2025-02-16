import { createEffect, createSignal, onMount } from 'solid-js';
import HealthBar from '~/components/HealthBar';
import {
	BASE_HEALTH,
	PLAYER_SIZE,
	XP_LVL_2,
	XP_LVL_21_TO_40,
	XP_LVL_3_TO_20,
	XP_LVL_41_AND_UP,
} from '~/constants';
import FaSolidArrowRightLong from '~/icons/FaSolidArrowRightLong';
import { gameState, lastPressedCombination, worldPos } from '~/state';
import { cn, getInitialRect, getRect, getRotationClass } from '~/utils';

export const [player, setPlayer] = createSignal<Player>({
	ref: undefined,
	rect: getInitialRect({ x: 0, y: 0, width: PLAYER_SIZE, height: PLAYER_SIZE }),
	health: BASE_HEALTH,
	maxHealth: BASE_HEALTH,
});

export const relativePlayerPos = () => ({
	left: player().rect.left - worldPos().x,
	right: player().rect.right - worldPos().x,
	top: player().rect.top - worldPos().y,
	bottom: player().rect.bottom - worldPos().y,
	centerX: player().rect.left - worldPos().x + player().rect.width / 2,
	centerY: player().rect.top - worldPos().y + player().rect.height / 2,
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

export default function Player() {
	onMount(() => {
		setPlayer((p) => ({ ...p, rect: getRect(p.ref!) }));
	});

	createEffect(() => {
		console.log(playerLevel().level);
	});

	return (
		<div class="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center">
			<div
				ref={(ref) => setPlayer((p) => ({ ...p, ref }))}
				class="flex flex-col items-center justify-center gap-2 border-2 border-red-800 bg-red-500 text-white transition-none"
				style={{
					width: `${player().rect.width}px`,
					height: `${player().rect.height}px`,
				}}
			>
				<FaSolidArrowRightLong
					class={cn(
						!lastPressedCombination() && 'opacity-0',
						getRotationClass(lastPressedCombination()),
					)}
				/>
				<span class="flex text-center text-xs">WASD to move</span>
			</div>

			<HealthBar class="mt-1 h-3" currentHealth={player().health} maxHealth={player().maxHealth} />
		</div>
	);
}
