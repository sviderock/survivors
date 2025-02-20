import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { HEALTH_COLOR_FULL, HEALTH_COLOR_HALF, HEALTH_COLOR_NONE } from '~/constants';
import type { GameServerEvent } from '~/ws';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function parseJson(str: string) {
	try {
		return JSON.parse(str);
	} catch (error) {
		console.log('issue parsing JSON', error);
		return {};
	}
}

export function encodeJson<T extends object>(obj: T) {
	try {
		return JSON.stringify(obj);
	} catch (error) {
		console.log('issue encoding JSON', error);
		return '';
	}
}

export function parseEvent(str: string) {
	const parsed = parseJson(str) as GameServerEvent;
	return parsed.type ? parsed : null;
}

export function persistData<T extends object>(key: string, data: T) {
	try {
		localStorage.setItem(key, JSON.stringify(data));
	} catch (error) {
		console.error(error);
	}
}

export function getPersistedData<T extends object>(key: string): T | null {
	try {
		const data = localStorage.getItem(key);
		if (!data) return null;
		return JSON.parse(data) as T;
	} catch (error) {
		console.error(error);
		return null;
	}
}

export function getDiagonalDistance(distance: number) {
	return distance * (1 / Math.sqrt(2));
}

export function collisionDetected<T extends RectSides>(a: T, b: T) {
	return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

export function getRect<T extends HTMLElement>(ref: T): Rect {
	const rect = ref.getBoundingClientRect();
	return {
		x: rect.x,
		y: rect.y,
		bottom: rect.bottom,
		top: rect.top,
		left: rect.left,
		right: rect.right,
		width: rect.width,
		height: rect.height,
		centerX: rect.x + rect.width / 2,
		centerY: rect.y + rect.height / 2,
	};
}

export function getNewPos({
	x,
	y,
	width,
	height,
}: {
	x: number;
	y: number;
	width: number;
	height: number;
}): Rect {
	return {
		x,
		y,
		width,
		height,
		left: x,
		right: x + width,
		top: y,
		bottom: y + height,
		centerX: x + width / 2,
		centerY: y + height / 2,
	};
}

type GetInitialRectProps = { x: number; y: number; width: number; height: number };
export function getInitialRect({ x, y, width, height }: GetInitialRectProps): Rect {
	return {
		x,
		y,
		width,
		height,
		bottom: y + height,
		top: y,
		left: x,
		right: x + width,
		centerX: x + width / 2,
		centerY: y + height / 2,
	};
}

export type GetRotationDeg = ReturnType<typeof getRotationDeg>;
export function getRotationDeg(comb: Player['attack']['direction']) {
	if (comb === 'north-east') return -45;
	if (comb === 'south-east') return 45;
	if (comb === 'north-west') return -135;
	if (comb === 'south-west') return 135;
	if (comb === 'south') return 90;
	if (comb === 'north') return -90;
	if (comb === 'west') return 180;
	return 0;
}

export function getRandomBetween(min: number, max: number, randomSign?: boolean): number {
	if (min > max) {
		[min, max] = [max, min];
	}
	return (
		(Math.floor(Math.random() * (max - min + 1)) + min) *
		(randomSign ? (Math.random() > 0.5 ? 1 : -1) : 1)
	);
}

export function msToTime(ms: number) {
	const totalSeconds = (ms / 1000) | 0;
	const mm = (totalSeconds / 60) | 0;
	const ss = totalSeconds % 60;
	return (mm < 10 ? '0' + mm : mm) + ':' + (ss < 10 ? '0' + ss : ss);
}

function rgbToHex(c: RGB) {
	const r = c.r.toString(16).padStart(2, '0');
	const g = c.g.toString(16).padStart(2, '0');
	const b = c.b.toString(16).padStart(2, '0');
	return `#${r}${g}${b}`.toUpperCase();
}

function hexToRgb(hex: string) {
	hex = hex.replace(/^#/, '');
	if (hex.length === 3) {
		hex = hex
			.split('')
			.map((c) => c + c)
			.join('');
	}
	const num = parseInt(hex, 16);
	return {
		r: (num >> 16) & 255,
		g: (num >> 8) & 255,
		b: num & 255,
	};
}

export function lerp(a: number, b: number, t: number) {
	return a + (b - a) * t;
}

function getRGB(color: RGBStr) {
	const [r, g, b] = color
		.replace('rgb(', '')
		.replace(')', '')
		.split(',')
		.map((i) => +i);
	return { r, g, b } as RGB;
}

function interpolateColors(c1: RGB, c2: RGB, t: number) {
	const r = Math.round(lerp(c1.r, c2.r, t));
	const g = Math.round(lerp(c1.g, c2.g, t));
	const b = Math.round(lerp(c1.b, c2.b, t));
	return rgbToHex({ r, g, b });
}

export function interpolateHealth(percentage: number) {
	percentage = Math.min(Math.max(percentage, 0), 1);
	if (percentage > 0.5) {
		const hex1 = getRGB(HEALTH_COLOR_FULL);
		const hex2 = getRGB(HEALTH_COLOR_HALF);
		return interpolateColors(hex2, hex1, (percentage - 0.5) * 2);
	}

	const hex2 = getRGB(HEALTH_COLOR_HALF);
	const hex3 = getRGB(HEALTH_COLOR_NONE);
	return interpolateColors(hex3, hex2, percentage * 2);
}

export function getDirection(a: number, b: number) {
	return a < b ? 1 : a > b ? -1 : 0;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function slowCollisionDetect() {
	// for (let j = 0; j < enemies.length; j++) {
	// 	if (i === j) continue;
	// 	const foreignEnemy = enemies[j]!;
	// 	// stuck moving right
	// 	if (dirX === 1 && newPos.right + COLLISION_OFFSET === foreignEnemy.rect().left) {
	// 		blocked.right = true;
	// 	}
	// 	// stuck moving left
	// 	if (dirX === -1 && newPos.left - COLLISION_OFFSET === foreignEnemy.rect().right) {
	// 		blocked.left = true;
	// 	}
	// 	// stuck moving bottom
	// 	if (dirY === 1 && newPos.bottom + COLLISION_OFFSET === foreignEnemy.rect().top) {
	// 		blocked.bottom = true;
	// 	}
	// 	// stuck moving top
	// 	if (dirY === -1 && newPos.top - COLLISION_OFFSET === foreignEnemy.rect().bottom) {
	// 		blocked.top = true;
	// 	}
	// }
}

export function getWsUrl(location: Location) {
	return `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/_ws/`;
}

export function getMins(mm: number) {
	return mm * 60 * 1000;
}
