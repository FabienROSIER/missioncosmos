import { describe, expect, it } from 'vitest';
import { withBasePath, BASE_PATH } from '@/lib/basePath';

describe('withBasePath', () => {
  it('laisse les chemins absolus inchangés sans basePath (tests locaux)', () => {
    expect(BASE_PATH).toBe('');
    expect(withBasePath('/assets/icons/logo.png')).toBe('/assets/icons/logo.png');
  });

  it('ignore les URLs déjà absolues non-root', () => {
    expect(withBasePath('https://example.com/a.png')).toBe('https://example.com/a.png');
  });
});
