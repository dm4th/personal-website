'use client';
import { useRef, useState } from 'react';
import type { SampleDoc } from '@/lib/projects/docwow/types';
import styles from './UploadPanel.module.css';

interface Props {
  samples: SampleDoc[];
  randomSamples: SampleDoc[];
  onSampleSelect: (s: SampleDoc) => void;
  onRandomSelect: (s: SampleDoc) => void;
  onFileUpload: (f: File) => void;
}

export default function UploadPanel({ samples, randomSamples, onSampleSelect, onRandomSelect, onFileUpload }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [lastRandom, setLastRandom] = useState(-1);

  // TODO(human): implement handleSurpriseMe
  // Pick a random document from randomSamples and call onRandomSelect with it.
  // Consider: what should happen if randomSamples is empty? And how would you
  // avoid picking the same document twice in a row? (~4-6 lines)
  const handleSurpriseMe = () => {
    if (randomSamples.length == 0) return null;

    let randomIndex = Math.floor(Math.random() * randomSamples.length);
    while (randomIndex == lastRandom && randomSamples.length > 1) {
      randomIndex = Math.floor(Math.random() * randomSamples.length);
    }

    setLastRandom(randomIndex);
    onRandomSelect(randomSamples[randomIndex]);
  }

  const handleFile = (file: File) => {
    if (file.type !== 'application/pdf') return;
    onFileUpload(file);
  };

  return (
    <div className={styles.root}>
      {randomSamples.length > 0 && (
        <div className={styles.randomSection}>
          <p className={styles.sectionLabel}>Surprise Me</p>
          <button className={styles.randomBtn} onClick={handleSurpriseMe}>
            <div className={styles.randomIcon}>🎲</div>
            <div className={styles.randomText}>
              <span className={styles.randomLabel}>Pick A Random Document</span>
              <span className={styles.randomDesc}>Randomizes from 14 synthetic medical records — discharge summaries, lab panels, radiology reports, op notes, and prior auth forms</span>
            </div>
            <span className={styles.randomArrow}>→</span>
          </button>
        </div>
      )}
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
