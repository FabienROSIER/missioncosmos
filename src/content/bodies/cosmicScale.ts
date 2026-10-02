const fade = (p: number, a: number, b: number) => {
  const t = Math.max(0, Math.min(1, (p - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
function interpolate(values: number[], level: number, logarithmic = false) {
  const p = Math.max(0, Math.min(values.length - 1, level));
  const i = Math.min(values.length - 2, Math.floor(p));
  const t = fade(p, i, i + 1),
    a = values[i]!,
    b = values[i + 1]!;
  return logarithmic ? a * Math.pow(b / a, t) : a + (b - a) * t;
}
/** Artistic stage scales, not a metric model of cosmological expansion.
 * Huge scale jumps collapse outgoing frames early; incoming layers overlap. */
export function cosmicScaleFrame(level: number) {
  return {
    sunModelOpacity: fade(level, 0.45, 0.95),
    planetModelOpacity: fade(level, 1.1, 1.8),
    moonModelOpacity: 1 - fade(level, 0.65, 1),
    solarScale: interpolate([6, 3, 1.1, 0.000018, 1e-9, 1e-9, 1e-9], level, true),
    neighbourScale: interpolate([1, 1, 1, 1, 0.00005, 0.00005, 0.00005], level, true),
    galaxyScale: interpolate([1, 1, 1, 1, 1, 0.12, 0.000015], level, true),
    galaxyX: interpolate([0, 0, 0, 0, 0, -8, -8], level),
    galaxyOpacity: fade(level, 3.35, 4),
    neighbourOpacity: fade(level, 2.15, 2.65) * (1 - fade(level, 3.5, 4)),
    sunOpacity: fade(level, 2.15, 2.65) * (1 - fade(level, 4.1, 4.8)),
    otherScale: interpolate([0.12, 0.12, 0.12, 0.12, 0.12, 0.12, 0.000015], level, true),
    otherOpacity: fade(level, 4.2, 4.8),
    remoteScale: 0.065,
    remoteOpacity: fade(level, 5.15, 5.65),
  };
}
