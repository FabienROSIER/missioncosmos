import styles from './ErrorState.module.css';

type ErrorStateProps = {
  title?: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

/** État d'erreur lisible pour un enfant — pas de jargon technique. */
export function ErrorState({
  title = 'Petit nuage cosmique',
  message,
  actionLabel = 'Réessayer',
  onAction,
}: ErrorStateProps) {
  return (
    <div className={styles.root} role="alert">
      <p className={styles.eyebrow}>Mission Cosmos</p>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.message}>{message}</p>
      {onAction ? (
        <button type="button" className="btn btn--primary" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
