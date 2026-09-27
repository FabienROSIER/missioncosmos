/**
 * Logs de développement. En production : messages courts, sans détails sensibles.
 * Pas de tracking publicitaire ici.
 */

const isDev = process.env.NODE_ENV === 'development';

type LogPayload = unknown;

function prefix(level: string): string {
  return `[MissionCosmos:${level}]`;
}

export const logger = {
  debug(...args: LogPayload[]): void {
    if (isDev) {
      console.debug(prefix('debug'), ...args);
    }
  },

  info(...args: LogPayload[]): void {
    if (isDev) {
      console.info(prefix('info'), ...args);
    }
  },

  warn(...args: LogPayload[]): void {
    console.warn(prefix('warn'), ...args);
  },

  /**
   * En prod : message court uniquement.
   * En dev : message + détail éventuel.
   */
  error(message: string, detail?: LogPayload): void {
    if (isDev && detail !== undefined) {
      console.error(prefix('error'), message, detail);
      return;
    }
    console.error(prefix('error'), message);
  },
};
