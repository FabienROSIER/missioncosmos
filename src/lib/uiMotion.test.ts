import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('UI motion and graphics preferences', () => {
  let graphics: typeof import('@/3d/materials/graphicsQuality');
  let motion: typeof import('@/lib/uiMotion');
  let browser: EventTarget & { devicePixelRatio: number };
  let reduced: EventTarget & { matches: boolean };
  let mobile: EventTarget & { matches: boolean };
  let connection: EventTarget & { saveData: boolean };
  let storage: Map<string, string>;

  beforeEach(async () => {
    vi.resetModules();
    storage = new Map();
    reduced = Object.assign(new EventTarget(), { matches: false });
    mobile = Object.assign(new EventTarget(), { matches: false });
    connection = Object.assign(new EventTarget(), { saveData: false });
    browser = Object.assign(new EventTarget(), {
      devicePixelRatio: 1,
      matchMedia: (query: string) => (query.includes('reduced-motion') ? reduced : mobile),
    });
    vi.stubGlobal('window', browser);
    vi.stubGlobal('navigator', { hardwareConcurrency: 8, deviceMemory: 8, connection });
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
    });
    graphics = await import('@/3d/materials/graphicsQuality');
    motion = await import('@/lib/uiMotion');
  });

  afterEach(() => vi.unstubAllGlobals());

  it.each([
    ['low', 'minimal'],
    ['medium', 'standard'],
    ['high', 'full'],
  ] as const)('applies %s quality immediately and notifies every subscriber', (quality, level) => {
    const onChange = vi.fn();
    const unsubscribe = motion.subscribeUiMotion(onChange);
    graphics.setStoredGraphicsQuality(quality);
    expect(onChange).toHaveBeenCalledOnce();
    expect(motion.getUiMotionSnapshot()).toBe(level);
    expect(storage.get(graphics.GRAPHICS_QUALITY_STORAGE_KEY)).toBe(quality);
    unsubscribe();
  });

  it('adapts auto to mobile, dense displays and limited hardware', () => {
    expect(motion.getUiMotionSnapshot()).toBe('full');
    mobile.matches = true;
    expect(motion.getUiMotionSnapshot()).toBe('standard');
    mobile.matches = false;
    browser.devicePixelRatio = 3;
    expect(motion.getUiMotionSnapshot()).toBe('standard');
    vi.stubGlobal('navigator', { hardwareConcurrency: 2, deviceMemory: 8 });
    expect(motion.getUiMotionSnapshot()).toBe('minimal');
    vi.stubGlobal('navigator', { hardwareConcurrency: 8, deviceMemory: 2 });
    expect(motion.getUiMotionSnapshot()).toBe('minimal');
  });

  it('updates live for reduced motion and data saving, including explicit high quality', () => {
    graphics.setStoredGraphicsQuality('high');
    const onChange = vi.fn();
    const unsubscribe = motion.subscribeUiMotion(onChange);
    reduced.matches = true;
    reduced.dispatchEvent(new Event('change'));
    expect(onChange).toHaveBeenCalledOnce();
    expect(motion.getUiMotionSnapshot()).toBe('none');
    connection.saveData = true;
    connection.dispatchEvent(new Event('change'));
    expect(motion.getUiMotionSnapshot()).toBe('none');
    reduced.matches = false;
    reduced.dispatchEvent(new Event('change'));
    expect(motion.getUiMotionSnapshot()).toBe('minimal');
    connection.saveData = false;
    connection.dispatchEvent(new Event('change'));
    expect(motion.getUiMotionSnapshot()).toBe('full');
    expect(onChange).toHaveBeenCalledTimes(4);
    unsubscribe();
  });

  it('keeps a selection usable when storage is blocked', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('Storage blocked');
      },
      setItem: () => {
        throw new Error('Storage blocked');
      },
    });
    expect(graphics.getStoredGraphicsQuality()).toBe('auto');
    expect(() => graphics.setStoredGraphicsQuality('low')).not.toThrow();
    expect(graphics.getStoredGraphicsQuality()).toBe('low');
    expect(motion.getUiMotionSnapshot()).toBe('minimal');
  });

  it('synchronizes another tab without responding to unrelated storage writes', () => {
    graphics.setStoredGraphicsQuality('high');
    const onChange = vi.fn();
    const unsubscribe = motion.subscribeUiMotion(onChange);
    const unrelated = Object.assign(new Event('storage'), { key: 'mc:save' });
    browser.dispatchEvent(unrelated);
    expect(onChange).not.toHaveBeenCalled();
    storage.set(graphics.GRAPHICS_QUALITY_STORAGE_KEY, 'low');
    browser.dispatchEvent(
      Object.assign(new Event('storage'), { key: graphics.GRAPHICS_QUALITY_STORAGE_KEY }),
    );
    expect(onChange).toHaveBeenCalledOnce();
    expect(motion.getUiMotionSnapshot()).toBe('minimal');
    unsubscribe();
  });

  it('removes all listeners when the consumer unmounts', () => {
    const onChange = vi.fn();
    const unsubscribe = motion.subscribeUiMotion(onChange);
    unsubscribe();
    graphics.setStoredGraphicsQuality('low');
    browser.dispatchEvent(new Event('resize'));
    browser.dispatchEvent(Object.assign(new Event('storage'), { key: null }));
    reduced.dispatchEvent(new Event('change'));
    connection.dispatchEvent(new Event('change'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('provides a safe SSR snapshot without browser globals', () => {
    vi.stubGlobal('window', undefined);
    vi.stubGlobal('navigator', undefined);
    expect(motion.getUiMotionSnapshot()).toBe('minimal');
    expect(() => motion.subscribeUiMotion(() => undefined)()).not.toThrow();
    expect(() => graphics.setStoredGraphicsQuality('high')).not.toThrow();
  });
});
