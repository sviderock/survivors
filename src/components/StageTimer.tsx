import { createTimer } from '@solid-primitives/timer';
import { createSignal } from 'solid-js';
import { sendWS } from '~/lib/gameServer';
import { gameState, setGameState } from '~/state';
import { msToTime } from '~/utils';

export const [stageTimer, setStageTimer] = createSignal(0);

export function setupGameTimer() {
  createTimer(
    async () => {
      if (!gameState.activeGame) return;
      if (stageTimer() >= gameState.activeGame.timeLimit) {
        setGameState('status', 'won');
        sendWS({ type: 'game_won' });
        return;
      }
      setStageTimer((p) => p + 500);
    },
    () => gameState.status === 'in_progress' && 500,
    setInterval,
  );
}

export default function StageTimer() {
  const formattedTime = () => msToTime(stageTimer());

  return <span class="-translate-x-1/2 absolute top-6 left-1/2 text-4xl">{formattedTime()}</span>;
}
