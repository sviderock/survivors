import { clientOnly } from '@solidjs/start';
import { Show } from 'solid-js';
import { ping } from '~/state';

export const PingClientOnly = clientOnly(() => import('~/components/Ping'));

export default function Ping(props: { explicit?: boolean }) {
  const pingState = () => {
    if (!ping()) return { color: '#888888', type: 'Disconnected' };
    if (ping() <= 10) return { color: '#00E676', type: 'Professional' };
    if (ping() < 20) return { color: '#76FF03', type: 'Pretty decent' };
    if (ping() < 50) return { color: '#FFEB3B', type: 'Perfectly average' };
    if (ping() < 100) return { color: '#FF9800', type: 'Poor' };
    return { color: '#F44336', type: 'Unplayable' };
  };

  return (
    <div
      class="flex flex-row items-center justify-center gap-3"
      style={{ color: pingState().color }}
    >
      <div class="flex items-center justify-center gap-2 text-base">
        <span class="h-2 w-2 rounded-full bg-current" />
        <span>{ping()}ms</span>
      </div>

      <Show when={props.explicit}>
        <span class="text-base text-current">({pingState().type})</span>
      </Show>
    </div>
  );
}
