import { type ParentProps } from 'solid-js';
import { WORLD_SIZE } from '~/constants';
import { worldRect } from '~/state';

export default function Terrain(props: ParentProps) {
	return (
		<div
			class="bg-forest"
			style={{
				'image-rendering': 'pixelated',
				transform: `translate3d(calc(-50% + ${worldRect().x}px), calc(-50% + ${worldRect().y}px), 0)`,
				width: `${WORLD_SIZE}px`,
				height: `${WORLD_SIZE}px`,
			}}
		>
			{props.children}
		</div>
	);
}
