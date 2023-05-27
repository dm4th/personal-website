import React from 'react';
import Link from 'next/link';
import styles from '@/styles/Footer.module.css';
import utilStyles from '@/styles/utils.module.css';

const Footer = ({ home }) => {
    return (
        <footer className={styles.footer}>
            {!home && (
                <div className={styles.backToHome}>
                    <Link href="/">← Back to Chat</Link>
                </div>
            )}
            <p className={utilStyles.lightText}>
                Website template is sourced from{' '}
                <a href="https://nextjs.org/learn">this Next.js tutorial</a>
            </p>
            <p className={utilStyles.lightText}>
                SupaBase Auth is sourced from{' '}
                <a href="https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs">this SupaBase tutorial</a>
            </p>
            <p className={utilStyles.lightText}>
                <a href="https://www.flaticon.com/free-icons/ui" title="ui icons">Ui icons created by feen - Flaticon</a>
            </p>
        </footer>
    );
};

export default Footer;
