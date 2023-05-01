import React from 'react';
import Link from 'next/link';
import styles from '@/styles/Footer.module.css';
import utilStyles from '@/styles/utils.module.css';

const Footer = ({ home }) => {
    return (
        <footer className={styles.footer}>
            {!home && (
                <div className={styles.backToHome}>
                    <Link href="/">← Back to home</Link>
                </div>
            )}
            <p className={utilStyles.lightText}>
                Website template is sourced from{' '}
                <a href="https://nextjs.org/learn">this Next.js tutorial</a>
            </p>
        </footer>
    );
};

export default Footer;
