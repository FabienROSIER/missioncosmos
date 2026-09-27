import { describe, expect, it } from 'vitest';
import {
  buildAssetFileName,
  buildAssetPublicPath,
  isPlaceholderAssetName,
} from '@/lib/assets/naming';
import { AppError, toUserMessage } from '@/lib/errors';

describe('asset naming', () => {
  it('construit un nom conforme', () => {
    expect(
      buildAssetFileName({
        id: 'AST-010',
        subject: 'Earth',
        variant: 'diffuse',
        extension: 'webp',
      }),
    ).toBe('ast-010-earth-diffuse.webp');
  });

  it('marque les placeholders', () => {
    const name = buildAssetFileName({
      id: 'AST-010',
      subject: 'earth',
      extension: 'webp',
      placeholder: true,
    });
    expect(name).toContain('placeholder');
    expect(isPlaceholderAssetName(name)).toBe(true);
  });

  it('place les assets sous /assets', () => {
    expect(buildAssetPublicPath('texture', 'ast-010-earth.webp')).toBe(
      '/assets/textures/ast-010-earth.webp',
    );
    expect(buildAssetPublicPath('audio', 'tap.ogg', 'sfx')).toBe('/assets/audio/sfx/tap.ogg');
  });
});

describe('errors', () => {
  it('expose le message enfant pour AppError', () => {
    const err = new AppError('LOAD_FAIL', 'texture 404', 'La planète met du temps à apparaître.');
    expect(toUserMessage(err)).toBe('La planète met du temps à apparaître.');
  });

  it('fallback générique sinon', () => {
    expect(toUserMessage(new Error('boom'))).toMatch(/espace/i);
  });
});
