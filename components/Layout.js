import { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import styles from '../styles/layout.module.css';
import utilStyles from '../styles/utils.module.css';
import Link from 'next/link';
import Header from './Header';
import Footer from './Footer';

import { useSupaUser } from '@/lib/SupaContextProvider';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';

const name = 'Dan Mathieson';
export const siteTitle = "Dan's Personal Website";

export default function Layout({ children, home, none, allPostsData, allInfoData }) {
    const { user, supabaseClient } = useSupaUser();

    const [showModal, setShowModal] = useState(false);

    const handleLogin = () => {
        setShowModal(true);
    };

    const handleClose = () => {
        setShowModal(false);
    };

    useEffect(() => {
        handleClose();
    }, [user]);

    return (
        <div>
            <Head>
                <link rel="icon" href="/favicon.ico" />
                <meta
                    name="description"
                    content="Personal Website with Next.JS"
                />
                <meta
                    property="og:image"
                    content={`https://og-image.vercel.app/${encodeURI(
                        siteTitle,
                    )}.png?theme=light&md=0&fontSize=75px&images=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fnextjs-black-logo.svg`}
                />
                <meta name="og:title" content={siteTitle} />
                <meta name="twitter:card" content="summary_large_image" />
            </Head>
            <Header allPostsData={allPostsData} allInfoData={allInfoData} onLogin={handleLogin}/>
            <div className={styles.container}>
                <div className={styles.title}>
                    {home ? (
                        <>
                            <Image
                                priority
                                src="/images/headshot.jpg"
                                className={utilStyles.borderCircle}
                                height={144}
                                width={144}
                                alt=""
                            />
                            <h1 className={utilStyles.heading2Xl}>{name}</h1>
                        </>
                    ) : none ? (
                        <>
                            <Link href="/">← Back to Chat</Link>
                        </>
                    ) : (
                        <>
                            <Link href="/">
                                <Image
                                    priority
                                    src="/images/headshot.jpg"
                                    className={utilStyles.borderCircle}
                                    height={108}
                                    width={108}
                                    alt=""
                                />
                            </Link>
                            <h2 className={utilStyles.headingLg}>
                                <Link href="/" className={utilStyles.colorInherit}>
                                    {name}
                                </Link>
                            </h2>
                        </>
                    )}
                </div>
                <main>
                    {children}
                </main>
            </div>
            <Footer home={home} />
            {showModal && (
                <div className={`${styles.modal}`}>
                    <div className={`${styles.modalCenter}`}>
                        <div className={`${styles.modalContent}`}>
                            <button onClick={handleClose} className={`${styles.closeButton}`}>
                                X
                            </button>
                            <Auth
                                appearance={{ theme: ThemeSupa }}
                                theme="light"
                                providers={[]}
                                supabaseClient={supabaseClient}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
