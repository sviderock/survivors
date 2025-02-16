import { batch, Match, Switch } from 'solid-js';
import { produce } from 'solid-js/store';
import { setPlayer } from '~/components/Player';
import { Button } from '~/components/ui/button';
import { gameState, setGameState } from '~/state';
import { cn } from '~/utils';

export default function Banner() {
	return (
		<Switch fallback={null}>
			<Match when={gameState.status === 'not_started'}>
				<div
					class={cn(
						'absolute left-0 top-0 z-50 flex h-full w-full flex-col items-center justify-center bg-zinc-500/50 text-center text-7xl uppercase',
					)}
				>
					Press <strong>Spacebar</strong> to start
					<Button
						onClick={() => {
							batch(() => {
								setPlayer((p) => ({ ...p, health: 10000, maxHealth: 10000 }));
								setGameState(
									produce((state) => {
										state.status = 'in_progress';
										state.bulletSpawnInterval = 50;
										state.enemySpawnInterval = 10;
									}),
								);
							});
						}}
					>
						Fun mode
					</Button>
				</div>
			</Match>

			<Match when={gameState.status === 'paused'}>
				<div
					class={cn(
						'absolute left-0 top-0 z-50 flex h-full w-full flex-col items-center justify-center bg-zinc-500/50 text-9xl uppercase',
					)}
				>
					<span class="text-4xl">Paused</span>
				</div>
			</Match>

			<Match when={gameState.status === 'won'}>
				<div
					class={cn(
						'absolute left-0 top-0 z-50 flex h-full w-full flex-col items-center justify-center bg-green-500/50 text-9xl uppercase',
					)}
				>
					You won!
				</div>
			</Match>

			<Match when={gameState.status === 'lost'}>
				<div
					class={cn(
						'absolute left-0 top-0 z-50 flex h-full w-full flex-col items-center justify-center bg-red-500/50 text-9xl uppercase',
					)}
				>
					<span>{gameState.status}</span>
					<span class="text-3xl">
						Press <strong>R</strong> to restart
					</span>
				</div>
			</Match>
		</Switch>
	);
}
