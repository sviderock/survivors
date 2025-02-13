import { gameState } from '~/state';
import { cn } from '~/utils';

export default function Banner() {
	return (
		<div
			class={cn(
				'absolute left-0 top-0 z-50 flex h-full w-full flex-col items-center justify-center text-9xl uppercase',
				gameState.status !== 'won' && gameState.status !== 'lost' && 'hidden',
				gameState.status === 'won' && 'bg-green-500/50',
				gameState.status === 'lost' && 'bg-red-500/50'
			)}
		>
			<span>{gameState.status}</span>
			<span class="text-xl">Refresh to restart</span>
		</div>
	);
}
