import { withBasePath } from '@/lib/basePath';

/**
 * Loader next/image pour export statique.
 * Idempotent : les src sont déjà préfixés via `withBasePath` dans paths.ts.
 */
export default function staticImageLoader({ src }: { src: string }): string {
  return withBasePath(src);
}
