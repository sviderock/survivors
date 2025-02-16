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
		health: number;
		maxHealth: number;
	};

	type EnemyAttackStatus = 'ready' | 'hit' | 'cooldown';
	type Enemy = {
		ref: HTMLDivElement | undefined;
		rect: Accessor<Rect>;
		setRect: Setter<Rect>;
		attack: number;
		attackStatus: Accessor<EnemyAttackStatus>;
		setAttackStatus: Setter<EnemyAttackStatus>;
		health: number;
		maxHealth: number;
	};

	type Bullet = {
		ref: HTMLSpanElement | undefined;
		rect: Accessor<Rect>;
		setRect: Setter<Rect>;
		target: { x: number; y: number };
		damage: number;
	};

	type Gem = {
		ref: HTMLSpanElement | undefined;
		rect: Accessor<Rect>;
		setRect: Setter<Rect>;
		value: number;
	};

	type RGBStr = `rgb(${number},${'' | ' '}${number},${'' | ' '}${number})`;
	type RGB = { r: number; g: number; b: number };
}

export {};
