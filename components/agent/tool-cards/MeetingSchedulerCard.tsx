'use client';

import React, { useState } from 'react';
import { useAuth, SignInButton } from '@clerk/nextjs';
import type { ToolUsePart } from '@/stores/agent';
import type { ScheduleMeetingOutput, MeetingSlot } from '@/lib/agent/tools/scheduleMeeting';
import styles from './MeetingSchedulerCard.module.css';

type BookState = 'idle' | 'booking' | 'booked' | 'error';

export default function MeetingSchedulerCard({ part }: { part: ToolUsePart }) {
  const [expanded, setExpanded] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<MeetingSlot | null>(null);
  const [bookState, setBookState] = useState<BookState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const { isSignedIn } = useAuth();

  const isPending = part.status === 'pending';
  const isError = part.status === 'error';
  const data = part.payload as ScheduleMeetingOutput | undefined;

  const handleBook = async () => {
    if (!selectedSlot || !data || bookState !== 'idle') return;
    setBookState('booking');
    setErrorMsg('');
    try {
      const res = await fetch('/api/agent/tools/confirm-meeting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slotStart: selectedSlot.start,
          slotEnd: selectedSlot.end,
          purpose: data.purpose,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? 'Booking failed');
      }
      setBookState('booked');
    } catch (err) {
      setErrorMsg(String(err));
      setBookState('error');
    }
  };

  return (
    <div className={styles.card}>
      <button className={styles.header} onClick={() => setExpanded((v) => !v)}>
        <span className={styles.icon}>{isPending ? '⏳' : isError ? '✗' : '📅'}</span>
        <span className={styles.label}>
          {isPending ? 'Checking availability…' : (part.summary ?? 'Meeting slots')}
        </span>
        {!isPending && <span className={styles.chevron}>{expanded ? '▲' : '▼'}</span>}
      </button>

      {expanded && !isPending && (
        <div className={styles.body}>
          {isError && <p className={styles.error}>Could not load calendar availability.</p>}

          {data && bookState !== 'booked' && (
            <>
              {data.suggestedSlots.length === 0 ? (
                <p className={styles.noSlots}>No open slots found in that window. Try a wider date range.</p>
              ) : (
                <>
                  <p className={styles.hint}>
                    Select a {data.durationMinutes}-min slot for: <strong>{data.purpose}</strong>
                  </p>
                  <ul className={styles.slotList}>
                    {data.suggestedSlots.map((slot) => (
                      <li key={slot.start}>
                        <button
                          className={`${styles.slotBtn} ${selectedSlot?.start === slot.start ? styles.selected : ''}`}
                          onClick={() => setSelectedSlot(slot)}
                        >
                          {slot.label}
                        </button>
                      </li>
                    ))}
                  </ul>

                  {selectedSlot && (
                    <div className={styles.confirmRow}>
                      {isSignedIn ? (
                        <button
                          className={styles.bookBtn}
                          onClick={handleBook}
                          disabled={bookState === 'booking'}
                        >
                          {bookState === 'booking' ? 'Booking…' : `Book ${selectedSlot.label} →`}
                        </button>
                      ) : (
                        <div className={styles.guestBook}>
                          <span className={styles.guestNote}>Sign in to confirm this meeting</span>
                          <SignInButton mode="modal">
                            <button className={styles.bookBtn}>Sign in to book →</button>
                          </SignInButton>
                        </div>
                      )}
                      {bookState === 'error' && (
                        <p className={styles.bookError}>{errorMsg}</p>
                      )}
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {bookState === 'booked' && selectedSlot && (
            <div className={styles.bookedConfirmation}>
              <span className={styles.bookedIcon}>✓</span>
              <div>
                <p className={styles.bookedTitle}>Meeting confirmed</p>
                <p className={styles.bookedTime}>{selectedSlot.label}</p>
                <p className={styles.bookedNote}>Calendar invite sent to your email.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
