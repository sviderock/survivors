import { type JSX } from 'solid-js';
import { cn } from '~/utils';

interface CharacterProps {
	ref: HTMLDivElement | ((el: HTMLDivElement) => void) | undefined;
	hitboxSize: number;
	size: number;
	spriteSrc: string;
	wrapperClass?: string;
	wrapperStyle?: JSX.CSSProperties;
	class?: string;
	debug?: boolean;
}

export default function Character(props: CharacterProps) {
	return (
		<div
			ref={props.ref}
			class={cn('relative', props.debug && 'border-2', props.wrapperClass)}
			style={{
				width: `${props.hitboxSize}px`,
				height: `${props.hitboxSize}px`,
				...props.wrapperStyle,
			}}
		>
			<div
				class="relative left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden"
				style={{
					width: `calc(${props.size}px * var(--pixel-size))`,
					height: `calc(${props.size}px * var(--pixel-size))`,
				}}
			>
				<img
					src={props.spriteSrc}
					class={cn('absolute max-w-[unset]', props.class)}
					style={{
						width: `calc(${props.size * 8}px * var(--pixel-size))`,
						'image-rendering': 'pixelated',
					}}
				/>
			</div>
		</div>
	);
}
