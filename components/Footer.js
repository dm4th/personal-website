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
            <div className={styles.footerContent}>
                <div className={styles.footerColumn}>
                    <h3 className={utilStyles.headingMd}>Contact Info</h3>
                    <p className={utilStyles.lightText}>
                        Email: <a href="mailto:your-email@example.com">your-email@example.com</a>
                    </p>
                    <p className={utilStyles.lightText}>
                        Cell: <a href="tel:1234567890">123-456-7890</a>
                    </p>
                    <p className={utilStyles.lightText}>
                        <a href="https://www.linkedin.com/in/daniel-mathieson-572b7958/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                    </p>
                    <p className={utilStyles.lightText}>
                        <a href="https://github.com/dm4th" target="_blank" rel="noopener noreferrer">GitHub</a>
                    </p>
                </div>
                <div className={styles.footerColumn}>
                    <h3 className={utilStyles.headingMd}>Credits</h3>
                    <p className={utilStyles.lightText}>
                        Website template is sourced from{' '}
                        <a href="https://nextjs.org/learn" target="_blank" rel="noopener noreferrer">this Next.js tutorial</a>
                    </p>
                    <p className={utilStyles.lightText}>
                        SupaBase Auth is sourced from{' '}
                        <a href="https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs" target="_blank" rel="noopener noreferrer">this SupaBase tutorial</a>
                    </p>
                    <p className={utilStyles.lightText}>
                        SupaBase Embeddings & Chat is sourced from{' '}
                        <a href="https://www.youtube.com/watch?v=Yhtjd7yGGGA" target="_blank" rel="noopener noreferrer">this incredible YouTube Video</a>
                    </p>
                    <p className={utilStyles.lightText}>
                        <a href="https://www.flaticon.com/free-icons/ui" title="ui icons" target="_blank" rel="noopener noreferrer">Ui icons created by feen - Flaticon</a>
                    </p>
                    <p className={utilStyles.lightText}>
                        <a href="https://www.flaticon.com/free-icons/search" title="search icons" target="_blank" rel="noopener noreferrer">Search icons created by Chanut - Flaticon</a> 
                    </p>
                    <p className={utilStyles.lightText}>
                        <a href="https://www.flaticon.com/free-icons/bot" title="bot icons" target="_blank" rel="noopener noreferrer">Bot icons created by Smashicons - Flaticon</a>
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
