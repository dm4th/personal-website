'use client';
import { useEffect, useRef, useState } from 'react';
import type { Citation } from '@/lib/projects/docwow/types';
import styles from './PDFViewer.module.css';

interface Props {
  pdfUrl: string;
  activeCitation: Citation | null;
}

const COLORS: Record<string, string> = {
  text: 'rgba(251,191,36,0.35)',
  table: 'rgba(34,197,94,0.35)',
  'key-value': 'rgba(99,102,241,0.35)',
};

export default function PDFViewer({ pdfUrl, activeCitation }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<number>(0);
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs';

      const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
      if (cancelled) return;
      setPages(pdf.numPages);
      canvasRefs.current = new Array(pdf.numPages).fill(null);

      // Render after state update — wait a tick
      setTimeout(async () => {
        for (let i = 1; i <= pdf.numPages; i++) {
          if (cancelled) return;
          const page = await pdf.getPage(i);
          const canvas = canvasRefs.current[i - 1];
          if (!canvas) continue;
          const viewport = page.getViewport({ scale: 1.5 });
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext('2d')!;
          await page.render({ canvasContext: ctx, viewport }).promise;
        }
        if (!cancelled) setRendered(true);
      }, 50);
    })();
    return () => { cancelled = true; };
  }, [pdfUrl]);

  // Scroll to active citation page
  useEffect(() => {
    if (!activeCitation || !containerRef.current) return;
    const canvas = canvasRefs.current[activeCitation.pageNumber - 1];
    canvas?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [activeCitation]);

  return (
    <div ref={containerRef} className={styles.container}>
      {Array.from({ length: pages }, (_, i) => {
        const pageNum = i + 1;
        const isActivePage = activeCitation?.pageNumber === pageNum;

        return (
          <div key={pageNum} className={styles.page}>
            <canvas
              ref={(el) => { canvasRefs.current[i] = el; }}
              className={styles.canvas}
            />
            {rendered && isActivePage && activeCitation && (
              <div
                className={styles.highlight}
                style={{
                  left: `${activeCitation.bbox.left * 100}%`,
                  top: `${activeCitation.bbox.top * 100}%`,
                  width: `${activeCitation.bbox.width * 100}%`,
                  height: `${activeCitation.bbox.height * 100}%`,
                  background: COLORS[activeCitation.type] ?? COLORS.text,
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
