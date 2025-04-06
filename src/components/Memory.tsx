import { Show, createSignal, onCleanup, onMount } from 'solid-js';

export function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 MB';
  const mb = bytes / (1024 * 1024);
  return mb.toFixed(decimals) + ' MB';
}

export default function MemoryUsage() {
  let interval: NodeJS.Timeout;
  const [memoryData, setMemoryData] = createSignal({
    usedJSHeapSize: 0,
    totalJSHeapSize: 0,
    jsHeapSizeLimit: 0,
  });

  onMount(() => {
    if (performance && 'memory' in performance) {
      interval = setInterval(() => {
        const { usedJSHeapSize, totalJSHeapSize, jsHeapSizeLimit } = (performance as any).memory;
        setMemoryData({ usedJSHeapSize, totalJSHeapSize, jsHeapSizeLimit });
      }, 1000);
    }
  });

  onCleanup(() => {
    clearInterval(interval);
  });

  return (
    <Show when={memoryData()}>
      <div class="flex w-full flex-col text-sm">
        <span class="flex justify-between gap-2">
          <strong>{formatBytes(memoryData()!.usedJSHeapSize)}</strong>Used Memory
        </span>
        <span class="flex justify-between gap-2">
          <strong>{formatBytes(memoryData()!.totalJSHeapSize)}</strong>Total Allocated Memory
        </span>
        <span class="flex justify-between gap-2">
          <strong>{formatBytes(memoryData()!.jsHeapSizeLimit)}</strong>Heap Size Limit
        </span>
      </div>
    </Show>
  );
}
