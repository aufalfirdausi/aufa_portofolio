export type RGB = [number, number, number];

/** Shared, mutable scroll state read every frame by the DOM loop and the WebGL scene. */
export type ScrollState = {
  /** Index the user is scrolling towards (float while scrolling, integer once snapped) */
  target: number;
  /** Smoothed index actually rendered */
  current: number;
  /** target - current, used for bending/fading */
  velocity: number;
  /** Last snapped index */
  settled: number;
  /** Current interpolated background color */
  bg: RGB;
};

export const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

export function hexToRgb(hex: string): RGB {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.replace(/./g, (c) => c + c) : h;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export const mixRgb = (a: RGB, b: RGB, t: number): RGB => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];

export const rgbCss = (c: RGB) =>
  `rgb(${Math.round(c[0])} ${Math.round(c[1])} ${Math.round(c[2])})`;
