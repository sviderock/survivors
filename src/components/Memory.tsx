import { createSignal, onCleanup, onMount, Show } from 'solid-js';

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
			<div class="flex flex-col text-sm text-zinc-500">
				<span class="flex justify-end gap-1">
					Used Memory: <strong>{formatBytes(memoryData()!.usedJSHeapSize)}</strong>
				</span>
				<span class="flex justify-end gap-1">
					Total Allocated Memory: <strong>{formatBytes(memoryData()!.totalJSHeapSize)}</strong>
				</span>
				<span class="flex justify-end gap-1">
					Heap Size Limit: <strong>{formatBytes(memoryData()!.jsHeapSizeLimit)}</strong>
				</span>
			</div>
		</Show>
	);
}
