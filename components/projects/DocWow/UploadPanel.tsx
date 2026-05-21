'use client';
import { useRef, useState } from 'react';
import type { SampleDoc } from '@/lib/projects/docwow/types';
import styles from './UploadPanel.module.css';

interface Props {
  samples: SampleDoc[];
  onSampleSelect: (s: SampleDoc) => void;
  onFileUpload: (f: File) => void;
}

export default function UploadPanel({ samples, onSampleSelect, onFileUpload }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = (file: File) => {
    if (file.type !== 'application/pdf') return;
    onFileUpload(file);
  };

  return (
    <div className={styles.root}>
      {samples.length > 0 && (
        <div className={styles.samples}>
          <p className={styles.sectionLabel}>Try A Sample Document</p>
          {samples.map((s) => (
            <button key={s.id} className={styles.sampleCard} onClick={() => onSampleSelect(s)}>
              <div className={styles.sampleIcon}>📄</div>
              <div className={styles.sampleText}>
                <span className={styles.sampleLabel}>{s.label}</span>
                <span className={styles.sampleDesc}>{s.description}</span>
              </div>
              <span className={styles.sampleArrow}>→</span>
            </button>
          ))}
        </div>
      )}

      <div className={styles.divider}>Or Upload Your Own PDF</div>

      <div
        className={`${styles.dropzone} ${dragging ? styles.dragging : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
      >
        <span className={styles.uploadIcon}>⬆️</span>
        <p className={styles.dropText}>Drop A PDF Here, Or Click To Browse</p>
        <p className={styles.dropHint}>Max 10 MB · Medical Records, Contracts, Research Papers</p>
        <input ref={inputRef} type="file" accept=".pdf" className={styles.hidden} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
      </div>

      <div className={styles.readyHint}>
        <p>Your document is ready. Ask anything about it and Claude will find the answer, citing the exact location in the document.</p>
      </div>
    </div>
  );
}
