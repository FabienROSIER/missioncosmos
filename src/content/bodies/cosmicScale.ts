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
  // Neighbours drift in from off-screen (large scale → 1) so the move reads as a dezoom.
  const neighbourArrive = interpolate([12, 12, 12, 1, 1, 1, 1], level, true);
  const neighbourCollapse = interpolate([1, 1, 1, 1, 0.00005, 0.00005, 0.00005], level, true);
  return {
    sunModelOpacity: fade(level, 0.45, 0.95),
    planetModelOpacity: fade(level, 1.1, 1.8),
    moonModelOpacity: 1 - fade(level, 0.65, 1),
    solarScale: interpolate([6, 3, 1.1, 0.000018, 1e-9, 1e-9, 1e-9], level, true),
    neighbourArrive,
    neighbourScale: neighbourArrive * neighbourCollapse,
    galaxyScale: interpolate([1, 1, 1, 1, 1, 0.12, 0.000015], level, true),
    galaxyX: interpolate([0, 0, 0, 0, 0, -8, -8], level),
    // Galaxy appears while we pull back around the Sun neighbourhood — not after a dive.
    galaxyOpacity: fade(level, 3.05, 3.75),
    // Keep the star group readable while it shrinks; hide only once it is a speck.
    neighbourOpacity: fade(level, 1.95, 2.08) * (1 - fade(level, 3.75, 4.15)),
    sunOpacity: fade(level, 1.95, 2.08) * (1 - fade(level, 4.1, 4.8)),
    // Pull the camera back for the neighbourhood → Milky Way dezoom.
    cameraRadius: interpolate([43, 43, 43, 43, 64, 52, 34], level),
    // Hold framing on the Sun first; only then ease to the full galactic overview.
    cameraTargetMix: fade(level, 3.55, 4),
    otherScale: interpolate([0.12, 0.12, 0.12, 0.12, 0.12, 0.12, 0.000015], level, true),
    otherOpacity: fade(level, 4.2, 4.8),
    // Deep field drifts in from off-screen (large → 1) so MW→universe reads as a dezoom.
    remoteArrive: interpolate([12, 12, 12, 12, 12, 12, 1], level, true),
    remoteScale: 0.065,
    remoteOpacity: fade(level, 5.15, 5.65),
  };
}

/** Named neighbour used for the Proxima label during the stellar-neighbourhood stage. */
export const COSMIC_PROXIMA = {
  x: 6.3,
  y: -1.5,
  z: 4.2,
  color: [1, 0.55, 0.4, 1] as const,
};

/** Moon sits just beyond Earth, away from the Sun (solar frame origin).
 * A fixed +X offset pushed the Moon toward the Sun during Lune→Soleil dezoom. */
export function moonBesideEarth(
  earthX: number,
  earthY: number,
  earthZ: number,
  separation = 1.15,
): { x: number; y: number; z: number } {
  const len = Math.hypot(earthX, earthY, earthZ);
  const nx = len > 1e-8 ? earthX / len : 1;
  const ny = len > 1e-8 ? earthY / len : 0;
  const nz = len > 1e-8 ? earthZ / len : 0;
  return {
    x: earthX + nx * separation,
    y: earthY + ny * separation,
    z: earthZ + nz * separation,
  };
}

/** Deterministic 0..1 hash for stable deep-field layouts. */
function fieldSample(index: number, seed: number): number {
  let value = Math.imul(index + 1, seed);
  value = Math.imul(value ^ (value >>> 16), 0x45d9f3b);
  value = Math.imul(value ^ (value >>> 16), 0x45d9f3b);
  return ((value ^ (value >>> 16)) >>> 0) / 4294967296;
}

export type DeepFieldGalaxy = {
  x: number;
  y: number;
  z: number;
  /** Relative size — most are tiny, a few dominate, like a deep-field plate. */
  scale: number;
  brightness: number;
  family: 'spiral' | 'elliptical' | 'irregular';
  yaw: number;
  pitch: number;
};

/**
 * Artistic Hubble-deep-field layout: irregular positions, depth, and size mix.
 * Not a catalogue — avoids the equidistant grid that read as wallpaper.
 */
export function deepFieldGalaxies(count: number): DeepFieldGalaxy[] {
  return Array.from({ length: count }, (_, i) => {
    const u = fieldSample(i, 73);
    const v = fieldSample(i, 191);
    const w = fieldSample(i, 409);
    const d = fieldSample(i, 617);
    const sizeRoll = fieldSample(i, 821);
    const typeRoll = fieldSample(i, 953);
    // Wide plate that fills the viewport at the universe stop (not a tight central clump).
    const golden = i * 2.399963229728653;
    const radius = Math.pow(0.02 + 0.98 * u, 0.42) * 40;
    const x = Math.cos(golden) * radius + (v - 0.5) * 7;
    const y = (w - 0.5) * 26 + Math.sin(i * 1.71) * 2;
    const z = Math.sin(golden) * radius * 0.95 + (d - 0.5) * 28;
    // Strong power-law: lots of tiny fillers, a few larger anchors (Hubble-like).
    const scale = 0.01 + Math.pow(1 - sizeRoll, 3.1) * 0.16;
    const brightness =
      0.22 + Math.pow(1 - sizeRoll, 1.2) * 0.78 * (0.55 + fieldSample(i, 1021) * 0.7);
    const family = typeRoll < 0.48 ? 'spiral' : typeRoll < 0.78 ? 'elliptical' : 'irregular';
    return {
      x,
      y,
      z,
      scale,
      brightness: Math.min(1, brightness),
      family,
      yaw: fieldSample(i, 1103) * Math.PI * 2,
      pitch: (fieldSample(i, 1301) - 0.5) * 0.95,
    };
  });
}

/** Full 3D specimens only for the brighter/larger islands; the rest are cheap specks. */
export function isDeepFieldFeatured(galaxy: DeepFieldGalaxy): boolean {
  return galaxy.scale >= 0.045;
}

/** Smootherstep — soft start/end so a fast scale jump does not strobe. */
export function easedScaleProgress(t: number): number {
  const x = Math.max(0, Math.min(1, t));
  return x * x * x * (x * (x * 6 - 15) + 10);
}

/** Level along a capped transition (ordering challenge). */
export function scaleLevelAlongJump(
  from: number,
  to: number,
  elapsedSeconds: number,
  durationSeconds: number,
): number {
  if (durationSeconds <= 0) return to;
  return from + (to - from) * easedScaleProgress(elapsedSeconds / durationSeconds);
}
