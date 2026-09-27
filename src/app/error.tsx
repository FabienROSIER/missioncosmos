'use client';

import { useEffect } from 'react';
import { ErrorState } from '@/components/ui/ErrorState';
import { getErrorDigest, toUserMessage } from '@/lib/errors';
import { logger } from '@/lib/logger';

type AppErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AppErrorPage({ error, reset }: AppErrorPageProps) {
  useEffect(() => {
    logger.error('Erreur de route', {
      digest: getErrorDigest(error),
      name: error.name,
    });
  }, [error]);

  return (
    <ErrorState
      title="Petit nuage cosmique"
      message={toUserMessage(error)}
      actionLabel="Réessayer"
      onAction={reset}
    />
  );
}
