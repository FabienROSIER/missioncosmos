/** Erreurs applicatives avec message sûr pour l'enfant. */

export class AppError extends Error {
  readonly code: string;
  readonly userMessage: string;

  constructor(
    code: string,
    /** Message technique (logs / dev uniquement) */
    technicalMessage: string,
    /** Texte affiché à l'enfant */
    userMessage: string,
    options?: { cause?: unknown },
  ) {
    super(technicalMessage, options);
    this.name = 'AppError';
    this.code = code;
    this.userMessage = userMessage;
  }
}

export const DEFAULT_USER_ERROR_MESSAGE =
  "Oups ! Quelque chose s'est embrouillé dans l'espace. On réessaie ?";

export function toUserMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.userMessage;
  }
  return DEFAULT_USER_ERROR_MESSAGE;
}

export function getErrorDigest(error: unknown): string | undefined {
  if (error && typeof error === 'object' && 'digest' in error) {
    const digest = (error as { digest?: unknown }).digest;
    return typeof digest === 'string' ? digest : undefined;
  }
  return undefined;
}
