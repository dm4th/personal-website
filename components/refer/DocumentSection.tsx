import styles from './DocumentSection.module.css';

type Props = {
  id: string;
  company: string;
  resumeFile: string;
  coverLetterFile: string;
};

export default function DocumentSection({ id, company, resumeFile, coverLetterFile }: Props) {
  if (!resumeFile && !coverLetterFile) return null;

  const docs = [
    { label: 'Resume', file: resumeFile },
    { label: 'Cover Letter', file: coverLetterFile },
  ].filter((d) => d.file);

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.heading}>Application materials</h2>
        <p className={styles.subheading}>
          Role-specific versions tailored for {company}
        </p>
      </div>
      <div className={styles.grid}>
        {docs.map(({ label, file }) => {
          const base = `/api/refer/${id}/files/${encodeURIComponent(file)}`;
          return (
            <div key={file} className={styles.card}>
              <div className={styles.cardIcon}>
                <span className={styles.fileIcon}>PDF</span>
                <p className={styles.docLabel}>{label}</p>
              </div>
              <div className={styles.actions}>
                <a
                  href={base}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.btnSecondary}
                >
                  Preview
                </a>
                <a
                  href={`${base}?download=1`}
                  className={styles.btnPrimary}
                  download
                >
                  Download
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
