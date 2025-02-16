import { createSignal, onMount } from 'solid-js';
import { cn, getRect, interpolateHealth } from '~/utils';

interface Props {
	currentHealth: number;
	maxHealth: number;
	class?: string;
}

export default function HealthBar(props: Props) {
	let ref: HTMLDivElement;
	const [fontSize, setFontSize] = createSignal(0);

	const health = () => {
		const percentage = props.currentHealth / props.maxHealth;
		return {
			percentage: percentage * 100,
			percentageRounded: (percentage * 100) | 0,
			color: interpolateHealth(percentage),
		};
	};

	onMount(() => {
		const rect = getRect(ref!);
		setFontSize((rect.height * 0.8) | 0);
	});

	return (
		<div ref={ref!} class={cn('relative flex w-full border border-zinc-900', props.class)}>
			<span
				class="flex h-full"
				style={{ 'background-color': health().color, width: `${health().percentage}%` }}
			/>
			<span
				class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
				style={{ 'font-size': `${fontSize()}px` }}
			>
				{health().percentageRounded}%
			</span>
		</div>
	);
}
