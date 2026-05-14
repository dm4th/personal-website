import styles from './QualificationsSummary.module.css';

type Props = { items: string[] };

export default function QualificationsSummary({ items }: Props) {
  if (!items || items.length === 0) return null;
  return (
    <ul className={styles.list}>
      {items.map((item, i) => (
        <li key={i} className={styles.item}>
          <span className={styles.bullet}>→</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
