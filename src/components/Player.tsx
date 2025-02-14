import { createSignal, onMount } from 'solid-js';
import FaSolidArrowRightLong from '~/icons/FaSolidArrowRightLong';
import { gameState, lastPressedCombination, worldPos } from '~/state';
import { cn, getInitialRect, getRect, getRotationClass } from '~/utils';

export const [playerPos, setPlayerPos] = createSignal(getInitialRect({ x: 0, y: 0 }));

export const relativePlayerPos = () => ({
	left: playerPos().left - worldPos().x,
	right: playerPos().right - worldPos().x,
	top: playerPos().top - worldPos().y,
	bottom: playerPos().bottom - worldPos().y,
	centerX: playerPos().left - worldPos().x + playerPos().width / 2,
	centerY: playerPos().top - worldPos().y + playerPos().height / 2,
});

export default function Player() {
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
				<div class="flex w-full flex-row justify-between px-2">
					<strong>{gameState.experience}</strong>
					<span>EXP</span>
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
