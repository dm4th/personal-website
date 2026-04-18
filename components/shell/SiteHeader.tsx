'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { UserButton, SignInButton, useUser } from '@clerk/nextjs';
import styles from './SiteHeader.module.css';
import type { InfoGroup } from '@/lib/content/infoDocs';

type Props = {
  allInfoData: InfoGroup[];
};

const Dropdown = ({ title, children }: { title: string; children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={styles.dropdown}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button className={styles.dropbtn}>{title}</button>
      {open && <div className={styles.dropdownContent}>{children}</div>}
    </div>
  );
};

export default function SiteHeader({ allInfoData }: Props) {
  const { isSignedIn } = useUser();

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <Link href="/" className={styles.logo}>
          Dan Mathieson
        </Link>
        {allInfoData.map(({ subDirectory, allSubInfoData, dropdownTitle }) => (
          <Dropdown key={subDirectory} title={dropdownTitle}>
            {allSubInfoData.map(({ file, type, Start, Title, End }) => {
              if (type === 'pdf') {
                const pageTitle = file
                  .replace(/-/g, ' ')
                  .replace(/\b\w/g, (l) => l.toUpperCase())
                  .replace('Ai', 'AI');
                return (
                  <Link
                    key={`info-${file}`}
                    href={`/info/${subDirectory}/${file}`}
                    className={styles.dropdownPdf}
                  >
                    {pageTitle}
                  </Link>
                );
              }
              return (
                <Link
                  key={`info-${file}`}
                  href={`/info/${subDirectory}/${file}`}
                  className={styles.dropdownMd}
                >
                  {Title}
                  <br />
                  <small className={styles.lightText}>
                    {Start}
                    {End && ` - ${End}`}
                  </small>
                </Link>
              );
            })}
          </Dropdown>
        ))}
      </div>

      <div className={styles.right}>
        {isSignedIn ? (
          <UserButton afterSignOutUrl="/" />
        ) : (
          <SignInButton mode="modal">
            <button className={styles.loginBtn}>Sign In</button>
          </SignInButton>
        )}
      </div>
    </header>
  );
}
