/// <reference types="@solidjs/start/env" />
declare global {
  type RectSides = Pick<DOMRect, 'left' | 'right' | 'top' | 'bottom'>;
  type RectCoords = Pick<DOMRect, 'x' | 'y'>;
  type RectSize = Pick<DOMRect, 'width' | 'height'>;
  type RectCenter = { centerX: number; centerY: number };
  type Rect = RectSides & RectCoords & RectSize & RectCenter;
}

export { }