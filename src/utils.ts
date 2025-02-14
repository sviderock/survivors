import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { ENEMY_SIZE } from '~/constants'
import { type LastPressedCombination } from '~/state'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseJson(str: string) {
  try {
    return JSON.parse(str)
  } catch (error) {
    console.log('issue parsing JSON', error)
    return {}
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
    centerY: rect.y + rect.height / 2
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
}): RectSides & RectCoords & RectCenter {
  return {
    x: x,
    y: y,
    left: x,
    right: x + width,
    top: y,
    bottom: y + height,
    centerX: x + width / 2,
    centerY: y + height / 2,
  };
}

export function getInitialRect({ x, y }: { x: number; y: number }): Rect {
  return {
    x,
    y,
    bottom: y + ENEMY_SIZE,
    top: y,
    left: x,
    right: x + ENEMY_SIZE,
    width: ENEMY_SIZE,
    height: ENEMY_SIZE,
    centerX: x + ENEMY_SIZE / 2,
    centerY: y + ENEMY_SIZE / 2,
  }
};

export type GetRotationDeg = ReturnType<typeof getRotationDeg>
export function getRotationDeg(comb: LastPressedCombination) {
  if (comb === 'wa') return -45;
  if (comb === 'wd') return 45;
  if (comb === 'sa') return -135;
  if (comb === 'sd') return 135;
  if (comb === 'd') return 90;
  if (comb === 'a') return -90;
  if (comb === 's') return 180;
  return 0;
}

export function getRotationClass(comb: LastPressedCombination) {
  if (comb === 'wa') return '-rotate-45';
  if (comb === 'wd') return 'rotate-45';
  if (comb === 'sa') return '-rotate-[135deg]';
  if (comb === 'sd') return 'rotate-[135deg]';
  if (comb === 'd') return 'rotate-90';
  if (comb === 'a') return '-rotate-90';
  if (comb === 's') return 'rotate-180';
  return 'flex';
}



