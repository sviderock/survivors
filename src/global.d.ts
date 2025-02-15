/// <reference types="@solidjs/start/env" />

import type { Accessor, Setter } from 'solid-js';

declare global {
	type RectSides = Pick<DOMRect, 'left' | 'right' | 'top' | 'bottom'>;
	type RectCoords = Pick<DOMRect, 'x' | 'y'>;
	type RectSize = Pick<DOMRect, 'width' | 'height'>;
	type RectCenter = { centerX: number; centerY: number };
	type Rect = RectSides & RectCoords & RectSize & RectCenter;

	type Player = {
		ref: HTMLDivElement | undefined;
		rect: Rect;
	};

	type Enemy = {
		ref: HTMLSpanElement | undefined;
		rect: Accessor<Rect>;
		setRect: Setter<Rect>;
	};

	type Bullet = {
		ref: HTMLSpanElement | undefined;
		rect: Accessor<Rect>;
		setRect: Setter<Rect>;
		target: { x: number; y: number };
	};
}

export {};
