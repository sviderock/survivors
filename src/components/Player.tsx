import { createSignal, onMount } from 'solid-js';
import {
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
	if (gameState.experience < XP_LVL_2) return 1;

	const boundaryLvl20 = 18 * XP_LVL_3_TO_20 + XP_LVL_2;
	if (gameState.experience <= boundaryLvl20) {
		return Math.floor(2 + (gameState.experience - XP_LVL_2) / XP_LVL_3_TO_20);
	}

	const boundaryLvl40 = boundaryLvl20 + 20 * XP_LVL_21_TO_40;
	if (gameState.experience <= boundaryLvl40) {
		return Math.floor(20 + (gameState.experience - boundaryLvl20) / XP_LVL_21_TO_40);
	}

	return Math.floor(40 + (gameState.experience - boundaryLvl40) / XP_LVL_41_AND_UP);
};

export default function Player() {
	onMount(() => {
		setPlayer((p) => ({ ...p, rect: getRect(p.ref!) }));
	});

	return (
		<>
			<div
				ref={(ref) => setPlayer((p) => ({ ...p, ref }))}
				class="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center border-2 border-red-800 bg-red-500 text-white opacity-50 transition-none"
				style={{
					width: `${player().rect.width}px`,
					height: `${player().rect.height}px`,
				}}
			>
				<div class="flex w-full flex-row justify-between px-2">
					<strong>{gameState.experience}</strong>
					<span>EXP</span>
				</div>

				<div class="flex w-full flex-row justify-between px-2">
					<strong>{playerLevel()}</strong>
					<span>LVL</span>
				</div>

				<FaSolidArrowRightLong
					class={cn(
						!lastPressedCombination() && 'opacity-0',
						getRotationClass(lastPressedCombination()),
					)}
				/>
				<span class="flex text-center text-xs">WASD to move</span>
			</div>
		</>
	);
}
