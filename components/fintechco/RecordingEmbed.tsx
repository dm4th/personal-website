import { toEmbedUrl } from '@/lib/fintechco/embed';
import styles from './RecordingEmbed.module.css';

type Props = {
  recordingUrl?: string;
  title: string;
};

export default function RecordingEmbed({ recordingUrl, title }: Props) {
  const embedUrl = toEmbedUrl(recordingUrl);

  if (!embedUrl) {
    return (
      <div className={styles.frame}>
        <div className={styles.placeholder}>
          <span className={styles.placeholderIcon} aria-hidden>▶</span>
          <span>Recording coming soon</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.frame}>
      <iframe
        className={styles.player}
        src={embedUrl}
        title={title}
        allow="fullscreen; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
