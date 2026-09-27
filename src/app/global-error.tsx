'use client';

import { useEffect } from 'react';
import { ErrorState } from '@/components/ui/ErrorState';
import { getErrorDigest, toUserMessage } from '@/lib/errors';
import { logger } from '@/lib/logger';

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

/** Remplace le layout racine — doit inclure html/body. */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    logger.error('Erreur globale', {
      digest: getErrorDigest(error),
      name: error.name,
    });
  }, [error]);

  return (
    <html lang="fr">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          fontFamily: 'system-ui, sans-serif',
          background: '#0b1220',
          color: '#f5f7fb',
        }}
      >
        <ErrorState
          title="Signal perdu"
          message={toUserMessage(error)}
          actionLabel="Réessayer"
          onAction={reset}
        />
      </body>
    </html>
  );
}
