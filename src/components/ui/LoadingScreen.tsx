import styles from './LoadingScreen.module.css';

type LoadingScreenProps = {
  message?: string;
};

export function LoadingScreen({ message = 'Préparation du vaisseau…' }: LoadingScreenProps) {
  return (
    <div className={styles.root} role="status" aria-live="polite">
      <div className={styles.spinner} aria-hidden="true" />
      <p className={styles.brand}>Mission Cosmos</p>
      <p className={styles.message}>{message}</p>
    </div>
  );
}
