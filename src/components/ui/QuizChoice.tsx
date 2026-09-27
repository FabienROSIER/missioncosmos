import styles from './QuizChoice.module.css';

type QuizChoiceState = 'idle' | 'selected' | 'correct' | 'incorrect';

type QuizChoiceProps = {
  label: string;
  state?: QuizChoiceState;
  disabled?: boolean;
  onSelect?: () => void;
};

export function QuizChoice({
  label,
  state = 'idle',
  disabled = false,
  onSelect,
}: QuizChoiceProps) {
  return (
    <button
      type="button"
      className={`${styles.root} ${styles[state]}`}
      disabled={disabled}
      onClick={onSelect}
      aria-pressed={state === 'selected' || state === 'correct'}
    >
      {label}
    </button>
  );
}
