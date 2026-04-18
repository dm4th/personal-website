'use client';

import { SignInButton } from '@clerk/nextjs';
import styles from './SignupNudge.module.css';

export default function SignupNudge({ reason }: { reason?: string }) {
  return (
    <div className={styles.nudge}>
      <p className={styles.text}>{reason ?? 'Sign up to save this conversation and unlock more features.'}</p>
      <SignInButton mode="modal">
        <button className={styles.btn}>Create account</button>
      </SignInButton>
    </div>
  );
}
