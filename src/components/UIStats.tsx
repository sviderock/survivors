import { Show, Suspense } from 'solid-js';
import MemoryUsage from '~/components/Memory';
import { PingClientOnly } from '~/components/Ping';
import { playerLevel } from '~/components/Player';
import { currentUser } from '~/lib/currentUser';
import { gameState } from '~/state';

export default function UIStats() {
  const { user } = currentUser();

  return (
    <div class="absolute top-2 right-4 flex w-[300px] flex-col items-end justify-between rounded-md border-2 bg-white p-2 px-4 text-sm text-zinc-800">
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
      <div class="flex flex-row items-end gap-1 px-1">
        <span>Enemies killed:</span>
        <strong>{gameState.enemiesKilled}</strong>
      </div>

      <Suspense fallback={'Fetching coins...'}>
        <Show when={user.data}>
          <span>Coins: {user.data!.coins}</span>
        </Show>
      </Suspense>

      <div class="flex w-36 justify-end gap-2">
        <PingClientOnly />
        {/* <FPSCounter /> */}
      </div>
    </div>
  );
}
