import { createEffect, createSignal, onCleanup, onMount, Show } from 'solid-js';
import { parseJson } from '~/utils';

const hrefToWs = (location: Location) =>
	`${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/_ws/`;

export default function Ping(props: { explicit?: boolean }) {
	const [socket, setSocket] = createSignal<WebSocket | null>(null);
	const [ping, setPing] = createSignal(0);

	const pingInterval = setInterval(() => {
		if (socket()?.readyState === WebSocket.OPEN) {
			socket()!.send(JSON.stringify({ type: 'ping', ts: Date.now() }));
		}
	}, 1000);

	const pingState = () => {
		if (!ping()) return { color: '#888888', type: 'Disconnected' };
		if (ping() <= 10) return { color: '#00E676', type: 'Professional' };
		if (ping() < 20) return { color: '#76FF03', type: 'Pretty decent' };
		if (ping() < 50) return { color: '#FFEB3B', type: 'Perfectly average' };
		if (ping() < 100) return { color: '#FF9800', type: 'Poor' };
		return { color: '#F44336', type: 'Unplayable' };
	};

	onMount(() => {
		const ws = new WebSocket(hrefToWs(location));

		ws.onopen = () => {
			console.log('WebSocket connection opened');
		};

		ws.onmessage = (event) => {
			console.log('Received message:');
			const message = parseJson(event.data);
			if (message.type === 'pong') {
				setPing(Date.now() - message.ts);
			}
		};

		ws.onclose = (event) => {
			console.log('WebSocket connection closed', event);
			setPing(0);
		};

		ws.onerror = (error) => {
			console.error('WebSocket encountered an error:', error);
		};

		setSocket(ws);
	});

	// Clean up when the component unmounts
	onCleanup(() => {
		socket()?.close();
		clearInterval(pingInterval);
	});

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
