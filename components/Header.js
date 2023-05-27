import React, { useState } from 'react';
import Link from 'next/link';
import Date from '@/components/date';
import styles from '@/styles/Header.module.css';
import utilStyles from '@/styles/utils.module.css';
import { useSupaUser } from '@/lib/SupaContextProvider';


const Header = ({ allPostsData, allInfoData, onLogin }) => {
    const { user, userDetails, supabaseClient } = useSupaUser();

    const [showDropdown, setShowDropdown] = useState(null);

    const toggleDropdown = (dropdown) => {
        if (showDropdown === dropdown) {
            setShowDropdown(null);
        } else {
            setShowDropdown(dropdown);
        }
    };
    const Dropdown = ({ title, children }) => (
        <div className={styles.dropdown}>
            <button className={styles.dropbtn} onClick={() => toggleDropdown(title)}>
                {title}
            </button>
            {showDropdown === title && (
                <div className={styles.dropdownContent}>{children}</div>
            )}
        </div>
    );

    return (
        <header className={styles.header}>
            <div className={styles.left}>
                {allInfoData.map(({ subDirectory, allSubInfoData, dropdownTitle }) => (
                    <Dropdown key={subDirectory} title={dropdownTitle}>
                        {allSubInfoData.map(({ file, Start, Title, End }) => (
                            <a key={`info-${file}`} href={`/info/${subDirectory}/${file}`}>
                                {Title}
                                <br />
                                <small className={utilStyles.lightText}>{Start}{End && ` - ${End}`}</small>
                            </a>
                        ))}
                    </Dropdown>
                ))}
                <Dropdown title="Prompting">
                    {allPostsData.map(({ id, date, title }) => (
                        <a key={`prompting-${id}`} href={`/prompting/${id}`}>
                            {title}
                            <br />
                            <small className={utilStyles.lightText}><Date dateString={date} /></small>
                        </a>
                    ))}
                </Dropdown>
            </div>
                {user ? (
            <div className={styles.right}>
                    <Link href="/account" className={styles.loginStatus}>
                        Account
                    </Link>
                    <button className={styles.loginStatus} onClick={() => supabaseClient.auth.signOut()}>
                        Logout
                    </button>
                    </div>
                ) : (
                    <div className={styles.right}>
                    <button className={styles.loginStatus} onClick={() => onLogin()}>
                        Login
                    </button>
            </div>
                )}
        </header>
    );
};

export default Header;
