import type { JSX } from 'solid-js';
import { cn } from '~/utils';

export interface ISVGProps extends JSX.SvgSVGAttributes<SVGSVGElement> {
	size?: number;
	className?: string;
}

export const LoadingSpinner = (props: ISVGProps) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={props.size ?? 24}
			height={props.size ?? 24}
			{...props}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			class={cn('animate-spin', props.class)}
		>
			<path d="M21 12a9 9 0 1 1-6.219-8.56" />
		</svg>
	);
};
