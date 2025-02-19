import { batch, Match, ParentProps, Switch } from 'solid-js';
import { produce } from 'solid-js/store';
import { setPlayer } from '~/components/Player';
import { Button } from '~/components/ui/button';
import { gameState, resetGameState, setGameState } from '~/state';
import { cn } from '~/utils';

export default function Banner() {
	return (
		<Switch fallback={null}>
			<Match when={gameState.status === 'not_started'}>
				<FullScreenBanner class="bg-zinc-500/50 text-7xl">
					Press <strong>Spacebar</strong> to start
					<Button
						onClick={() => {
							batch(() => {
								setPlayer(
									produce((player) => {
										player.health = 10_000;
										player.maxHealth = 10_000;
									}),
								);
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
				</FullScreenBanner>
			</Match>

			<Match when={gameState.status === 'paused'}>
				<FullScreenBanner class="bg-zinc-500/50">
					<span class="text-4xl">Paused</span>
				</FullScreenBanner>
			</Match>

			<Match when={gameState.status === 'lost'}>
				<FullScreenBanner class="bg-red-500/50">
					<span>{gameState.status}</span>
					<span class="text-3xl">
						Press <strong>R</strong> to restart
					</span>
				</FullScreenBanner>
			</Match>

			<Match when={gameState.status === 'active_game_found'}>
				<FullScreenBanner class="bg-yellow-500/50">
					<span class="text-3xl">You've got an unfinished game.</span>
					<span class="text-3xl">
						Press <strong>spacebar</strong> to continue
					</span>
				</FullScreenBanner>
			</Match>

			<Match when={gameState.status === 'won'}>
				<FullScreenBanner class="bg-green-500/50">
					<div class="flex flex-col text-center">
						<strong>You won!</strong>
						You've earned <strong>{gameState.activeGame!.coinsAtStake}</strong> coins!
					</div>

					<Button
						variant="secondary"
						onClick={() => {
							resetGameState();
						}}
					>
						Reset
					</Button>
				</FullScreenBanner>
			</Match>
		</Switch>
	);
}

function FullScreenBanner(props: ParentProps<{ class?: string }>) {
	return (
		<div
			class={cn(
				'absolute left-0 top-0 z-50 flex h-full w-full flex-col items-center justify-center text-9xl uppercase',
				props.class,
			)}
		>
			{props.children}
		</div>
	);
}
