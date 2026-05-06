'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { UserButton, SignInButton, useUser } from '@clerk/nextjs';
import styles from './SiteHeader.module.css';
import type { InfoGroup, InfoSubGroup } from '@/lib/content/infoDocs';

type Props = {
  allInfoData: InfoGroup[];
};

const SubGroupRow = ({
  subGroup,
  subDirectory,
}: {
  subGroup: InfoSubGroup;
  subDirectory: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={styles.subGroupRow}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Link
        href={`/info/${subDirectory}/${subGroup.subDir}`}
        className={styles.subGroupLabel}
      >
        {subGroup.displayTitle}
        <span className={styles.arrow}>›</span>
      </Link>
      {open && (
        <div className={styles.subMenu}>
          {subGroup.entries.map(({ file, type, Start, Title, End }) => {
            if (type === 'pdf') {
              const leafName = file.split('/').pop() ?? file;
              const pageTitle = leafName
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
        </div>
      )}
    </div>
  );
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
        {allInfoData.map(({ subDirectory, flatEntries, subGroups, dropdownTitle }) => (
          <Dropdown key={subDirectory} title={dropdownTitle}>
            {subGroups.map((subGroup) => (
              <SubGroupRow key={subGroup.subDir} subGroup={subGroup} subDirectory={subDirectory} />
            ))}
            {subGroups.length > 0 && flatEntries.length > 0 && (
              <div className={styles.divider} />
            )}
            {flatEntries.map(({ file, type, Start, Title, End }) => {
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
        <Link href="/projects" className={styles.navLink}>Live Demos</Link>
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
