import Link from 'next/link';
import styles from '@/components/ui/ErrorState.module.css';

export default function NotFoundPage() {
  return (
    <div className={styles.root} role="status">
      <p className={styles.eyebrow}>Mission Cosmos</p>
      <h1 className={styles.title}>Planète introuvable</h1>
      <p className={styles.message}>
        Cette page n&apos;existe pas. Retournons à la base spatiale ?
      </p>
      <Link className="btn btn--primary" href="/">
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
