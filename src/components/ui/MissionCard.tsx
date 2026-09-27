import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import styles from './MissionCard.module.css';

type MissionCardStatus = 'locked' | 'available' | 'completed';

type MissionCardProps = {
  title: string;
  objective: string;
  status: MissionCardStatus;
  onStart?: () => void;
  /** Version dense pour la carte Univers (pas de scroll). */
  compact?: boolean;
};

const STATUS_LABEL: Record<MissionCardStatus, string> = {
  locked: 'Verrouillée',
  available: 'Disponible',
  completed: 'Terminée',
};

const STATUS_TONE: Record<MissionCardStatus, 'neutral' | 'nebula' | 'success'> = {
  locked: 'neutral',
  available: 'nebula',
  completed: 'success',
};

export function MissionCard({
  title,
  objective,
  status,
  onStart,
  compact = false,
}: MissionCardProps) {
  const locked = status === 'locked';

  return (
    <Card
      className={`${styles.root}${compact ? ` ${styles.compact}` : ''}`}
      interactive={!locked}
      dense={compact}
    >
      <div className={styles.top}>
        <h3 className={styles.title}>{title}</h3>
        <Badge tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Badge>
      </div>
      <p className={styles.objective}>{objective}</p>
      {!locked && onStart ? (
        <Button variant={status === 'completed' ? 'secondary' : 'primary'} onClick={onStart}>
          {status === 'completed' ? 'Rejouer' : 'Démarrer'}
        </Button>
      ) : null}
    </Card>
  );
}
