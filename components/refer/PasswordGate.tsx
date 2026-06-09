'use client';

import { useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'solutioning-unlocked-v1';

export default function PasswordGate() {
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
    if (inputRef.current?.value === 'solutioning') {
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
      background: 'var(--background, #0f0e0d)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'inherit',
    }}>
      <div style={{
        background: 'var(--surface, #1a1917)',
        border: '1px solid var(--border, #2a2825)',
        borderRadius: 16, padding: '48px 56px',
        width: 400, maxWidth: '90vw', textAlign: 'center',
      }}>
        <div style={{
          width: 44, height: 44, background: '#C86A48', borderRadius: 10,
          margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <rect x="5" y="10" width="12" height="9" rx="2" fill="white" opacity="0.92"/>
            <path d="M8 10V7a3 3 0 016 0v3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <p style={{ color: 'var(--foreground)', fontSize: 18, fontWeight: 700, margin: '0 0 6px', letterSpacing: '-0.01em' }}>
          Interview Prep Materials
        </p>
        <p style={{ color: 'var(--subtle)', fontSize: 13, margin: '0 0 32px', lineHeight: 1.5 }}>
          Dan Mathieson &middot; Anthropic Applied AI
        </p>
        <input
          ref={inputRef}
          type="password"
          placeholder="Access code"
          autoComplete="off"
          onKeyDown={(e) => e.key === 'Enter' && tryUnlock()}
          style={{
            width: '100%', background: 'var(--background, #0f0e0d)',
            border: `1px solid ${error ? '#C86A48' : 'var(--border, #2a2825)'}`,
            borderRadius: 8, padding: '13px 16px',
            color: 'var(--foreground)', fontSize: 15, fontFamily: 'inherit',
            outline: 'none', marginBottom: 10, transition: 'border-color 0.2s',
            boxSizing: 'border-box',
          }}
        />
        <p style={{ color: '#C86A48', fontSize: 13, minHeight: 18, margin: '0 0 10px' }}>
          {error}
        </p>
        <button
          onClick={tryUnlock}
          style={{
            width: '100%', background: '#C86A48', border: 'none',
            borderRadius: 8, padding: 14, color: 'white',
            fontSize: 15, fontWeight: 600, fontFamily: 'inherit',
            cursor: 'pointer', letterSpacing: '-0.01em',
          }}
        >
          View Page
        </button>
      </div>
    </div>
  );
}
