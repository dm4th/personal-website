'use client';

import { useEffect, useRef, useState } from 'react';
import { FINTECHCO_THEME as T } from '@/lib/fintechco/theme';

const STORAGE_KEY = 'fintechco-unlocked-v1';
const ACCESS_CODE = process.env.NEXT_PUBLIC_FINTECHCO_ACCESS_CODE ?? 'fintechco';

export default function AccessGate() {
  const [locked, setLocked] = useState<boolean | null>(null);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocked(sessionStorage.getItem(STORAGE_KEY) !== '1');
  }, []);

  useEffect(() => {
    if (locked) inputRef.current?.focus();
  }, [locked]);

  function tryUnlock() {
    if (inputRef.current?.value === ACCESS_CODE) {
      sessionStorage.setItem(STORAGE_KEY, '1');
      setLocked(false);
    } else {
      setError('Incorrect access code.');
      setTimeout(() => setError(''), 2500);
    }
  }

  if (locked === null || !locked) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: T.cream,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'inherit',
    }}>
      <div style={{
        background: T.card,
        border: `1px solid ${T.cardBorder}`,
        borderRadius: 16, padding: '48px 56px',
        width: 400, maxWidth: '90vw', textAlign: 'center',
      }}>
        <div style={{
          width: 44, height: 44, background: T.terracotta, borderRadius: 10,
          margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <rect x="5" y="10" width="12" height="9" rx="2" fill="white" opacity="0.92"/>
            <path d="M8 10V7a3 3 0 016 0v3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <p style={{ color: T.text, fontSize: 18, fontWeight: 700, margin: '0 0 6px', letterSpacing: '-0.01em' }}>
          Shared Workspace
        </p>
        <p style={{ color: T.textMuted, fontSize: 13, margin: '0 0 32px', lineHeight: 1.5 }}>
          Dan Mathieson
        </p>
        <input
          ref={inputRef}
          type="password"
          placeholder="Access code"
          autoComplete="off"
          onKeyDown={(e) => e.key === 'Enter' && tryUnlock()}
          style={{
            width: '100%', background: T.cream,
            border: `1px solid ${error ? T.terracotta : T.cardBorder}`,
            borderRadius: 8, padding: '13px 16px',
            color: T.text, fontSize: 15, fontFamily: 'inherit',
            outline: 'none', marginBottom: 10, transition: 'border-color 0.2s',
            boxSizing: 'border-box',
          }}
        />
        <p style={{ color: T.terracotta, fontSize: 13, minHeight: 18, margin: '0 0 10px' }}>
          {error}
        </p>
        <button
          onClick={tryUnlock}
          style={{
            width: '100%', background: T.terracotta, border: 'none',
            borderRadius: 8, padding: 14, color: 'white',
            fontSize: 15, fontWeight: 600, fontFamily: 'inherit',
            cursor: 'pointer', letterSpacing: '-0.01em',
          }}
        >
          View Workspace
        </button>
      </div>
    </div>
  );
}
