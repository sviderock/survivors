import { Show, Suspense } from 'solid-js';
import FPSCounter from '~/components/FPSCounter';
import MemoryUsage from '~/components/Memory';
import { PingClientOnly } from '~/components/Ping';
import { playerLevel } from '~/components/Player';
import { useUser } from '~/components/UserAccount';
import { LoadingSpinner } from '~/icons/LoadingSpinner';
import { connectedUser, gameState } from '~/state';

export default function UIStats() {
	const user = useUser();

	return (
		<div class="absolute right-4 top-2 flex w-[300px] flex-col items-end justify-between rounded-md border-2 bg-white p-2 px-4 text-sm text-zinc-800">
			<MemoryUsage />

			<div class="flex flex-row items-end gap-1 px-1">
				<span>EXP:</span>
				<strong>
					{playerLevel().exp}/{playerLevel().xpToNextLevel}
				</strong>
			</div>

			<div class="flex flex-row items-end gap-1 px-1">
				<span>LVL:</span>
				<strong>{playerLevel().level}</strong>
			</div>

			<div class="flex flex-row items-end gap-1 px-1">
				<span>Enemies spawned:</span>
				<strong>{gameState.enemies.length}</strong>
			</div>

			<Suspense fallback={'Fetching coins...'}>
				<Show when={user.data}>
					<span>Coins: {user.data!.coins}</span>
				</Show>
				<Show
					when={connectedUser.status === 'connecting' || connectedUser.status === 'reconnecting'}
				>
					<div class="flex items-center gap-2">
						<LoadingSpinner size={16} />
						Fetching coins...
					</div>
				</Show>
			</Suspense>

			<div class="flex w-36 justify-between gap-2">
				<PingClientOnly />
				<FPSCounter />
			</div>
		</div>
	);
}
