import styles from './ApprovalPrompt.module.css';

type Props = {
  onApprove: () => void;
  onDismiss: () => void;
  approved: boolean;
};

export default function ApprovalPrompt({ onApprove, onDismiss, approved }: Props) {
  if (approved) {
    return (
      <div className={`${styles.wrapper} ${styles.approved}`}>
        <span className={styles.approvedIcon}>✓</span>
        <span className={styles.approvedText}>
          Added to your session library. Re-run this query to see exact match in action.
        </span>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <p className={styles.prompt}>
        Is this determination correct? Approving it adds the case to your session library —
        the next identical query will match exactly without calling the LLM.
      </p>
      <div className={styles.actions}>
        <button className={styles.approveBtn} onClick={onApprove}>
          Mark as Correct ✓
        </button>
        <button className={styles.dismissBtn} onClick={onDismiss}>
          Dismiss
        </button>
      </div>
    </div>
  );
}
